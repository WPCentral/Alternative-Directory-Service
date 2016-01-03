// set variables for environment
var express = require('express'),
	app     = express(),
	request = require('request-json'),
	client  = request.createClient('https://api.wordpress.org/');
	mysql   = require('mysql'),
	async   = require('async'),
	elasticsearch = require('elasticsearch');

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
	var data = {};

	async.parallel([
		// Getting plugin information
		function(callback) {
			client.get( type + 's/info/1.0/' + slug + '.json', function(err, res, body) {
				if ( err ) {
					return callback(err);
				}

				data.info = body;
				callback();
			});
		},
		//
		function(callback) {
			callback();
		}
	], function(err) {
		if (err) {
			return;
		}

		console.log( slug );
		console.log( data );

	});
}


