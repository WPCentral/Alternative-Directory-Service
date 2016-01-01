// set variables for environment
var express = require('express'),
	app     = express(),
	request = require('request-json'),
	client  = request.createClient('https://api.wordpress.org/');
	mysql   = require('mysql'),
	async   = require('async');

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

app.get( '/plugins/:slug', function(req, res) {

});

app.get( '/themes/:slug', function(req, res) {

});

app.use(function(req, res, next) {
	res.status(404).json({
		'error': "Route doesn;'t exist"
	});
});