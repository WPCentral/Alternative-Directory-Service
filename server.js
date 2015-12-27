// set variables for environment
var express = require('express'),
	app     = express(),
	request = require('request'),
	async   = require('async');

// Set server port
app.listen(4002);
console.log('server is running');

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