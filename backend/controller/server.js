
var express = require('express');
var app = express();
var https = require('https');
var http = require('http').Server(app);

var port = 3000;

var fs = require('fs');
var movies = require('./movies');
const options = {
  key : fs.readFileSync('private.pem'),
  cert : fs.readFileSync('public.pem')
};


var server = https.createServer(options,app).listen(port,function(){
  console.log('My test RTC');
});

http.listen(2000);

app.get('/api', function (req, res, next) {
  res.send(movies);
});
