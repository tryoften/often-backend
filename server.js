var express = require('express');
var path = require('path');

var app = express();

app.use('/img/', express.static(path.join(__dirname, 'client/img')));
app.use('/fonts/', express.static(path.join(__dirname, 'client/fonts')));

app.get('/js/vendors.js', (req, res) => {
	res.sendFile(path.join(__dirname, 'client/js/vendors.js'));
});

app.get('/js/app.js', function (req, res) {
	res.sendFile(path.join(__dirname, 'client/js/app.js'));
});

app.get('/css/style.css', function (req, res) {
	res.sendFile(path.join(__dirname, 'client/css/style.css'));
});

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'client/index.html'));
});

app.listen(80, function (err) {
	console.log('Listening at http://localhost:8080');
});
