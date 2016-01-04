// set variables for environment
var express       = require('express'),
	app           = express(),
	request       = require('request'),
	request_json  = require('request-json'),
	wp_api        = request_json.createClient('https://api.wordpress.org/');
	central_api   = request_json.createClient('http://wpcentral.io/api/');
	mysql         = require('mysql'),
	async         = require('async'),
	elasticsearch = require('elasticsearch'),
	moment        = require('moment');

// Set server port
app.listen(4002);
console.log('server is running');

var pool = mysql.createPool({
	connectionLimit : 10,
	host     : '10.133.71.192',
	user     : 'wpcentral_stats',
	password : 'password',
	database : 'wpcentral_stats'
});

pool.on('enqueue', function () {
	console.log('Waiting for available connection slot');
});

var client = new elasticsearch.Client({
	host: '10.133.170.195:9200',
	log: 'trace'
});


app.get( '/plugins/:slug', function(req, res) {
	get_data( 'plugin', req.params.slug );
	res.send('done');
});

app.get( '/themes/:slug', function(req, res) {
	get_data( 'theme', req.params.slug );
	res.send('done');
});

app.use(function(req, res, next) {
	res.status(404).json({
		'error': "Route doesn;'t exist"
	});
});


function get_data( type, slug ) {
	var data = {
		'info': {},
		'translations': {},
		'banners': {},
		'icons': {}
	};

	async.parallel([
		// Getting plugin information
		function(callback) {
			wp_api.get( type + 's/info/1.0/' + slug + '.json', function(err, res, body) {
				if ( err ) {
					return callback(err);
				}

				data.info = body;
				callback();
			});
		},
		// Get Translation info
		function(callback) {
			wp_api.get( 'translations/' + type + 's/1.0/?slug=' + slug, function(err, res, body) {
				if ( err ) {
					return callback(err);
				}

				data.translations = body;
				callback();
			});
		},
		// Get banners
		function(callback) {
			async.each(
				['banner-1544x500.png','banner-772x250.png'],
				function(file, callback2) {

					request.head('http://ps.w.org/' + slug + '/assets/' + file).on('response', function(response) {
						if (response.statusCode == 200) {
							data.banners[ file.replace('.png','') ] = 'http://ps.w.org/' + slug + '/assets/' + file;
						}
						callback2();
					});

				},
				function(err, results){
					// done
					callback();
				}
			);
		},
		// Get icons
		function(callback) {
			async.each(
				['icon-128x128.png', 'icon-256x256.png', 'icon.svg'],
				function(file, callback2) {

					request.head('http://ps.w.org/' + slug + '/assets/' + file).on('response', function(response) {
						if (response.statusCode == 200) {
							data.icons[ file.replace('.png','') ] = 'http://ps.w.org/' + slug + '/assets/' + file;
						}
						callback2();
					});

				},
				function(err, results){
					// done
					callback();
				}
			);
		}
	],
	function(err) {
		if (err) {
			console.log(err);
			return;
		}
		save_to_wordpress( slug, data );
		save_to_elasticsearch( slug, data );
	});
}


function save_to_wordpress( slug, data ) {
	// Transform the data how WordPress expects it.
	var modified = moment( data.info.last_updated, 'YYYY-MM-DD hh:mma' ).format('YYYY-MM-DD HH:mm');

	var data = {
		'postdata': {
			'post_title': data.info.name,
			'post_content': data.info.sections.description,
			'post_excerpt': data.info.short_description,
			'post_date': data.info.added,
			'post_date_gmt': data.info.added,
			'post_modified_gmt': modified
		},
		'metadata': {
			'download_link': data.info.download_link,
			'version': data.info.version,
			'requires': data.info.requires,
			'tested_up_to': data.info.tested,

			'rating': data.info.rating,
			'rating_count': data.info.num_ratings,
			'ratings': data.info.ratings,

			'banners': data.banners,
			'icons': data.icons
		}
	};

	central_api.post('plugins/report/' + slug, data, function(err, res, body) {
		
	});
}

function save_to_elasticsearch( slug, data ) {

}