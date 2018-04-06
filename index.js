#!/bin/env node

// https://learn.javascript.ru/screencast/nodejs

var express = require("express");

//var https = require("https");
var path = require("path");
var bodyParser = require("body-parser");
/*var fs = require("fs");
var cookieParser = require('cookie-parser')
var session = require('express-session');*/

var urlencodedParser = bodyParser.urlencoded({ extended: false });

//var db = require("./database");

var LoggerFactory = require("./public/src/utils/logger.js").LoggerFactory;
var logger = LoggerFactory.getLogger({label:"Server"});

var host = process.env.BUDGET_HOST; 
var port = process.env.PORT || 18000;

if (typeof host === "undefined") {
  //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
  //  allows to run/test the app locally. 
  host = 'localhost';
  //logger.info("No OPENSHIFT_NODEJS_IP var, using %s",host);
}

app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( urlencodedParser ); // Parse request body into request.body.
//pp.use( cookieParser() );
/*app.use( session({ 
  secret: 'fskljlsdkfkljsdf',
  resave:false,
  saveUninitialized:true,
  maxAge:null,
} ) );*/

 app.use(require('connect-livereload')({
    port: port,
  }));

app.get("/", function(request, response){
    logger.info("/");
    sendResponse(response, {status:'/status - status of server'});
});

app.get("/status", function(request, response){
    sendResponse(response, {status:'alive'});
});

sendResponse = function(response, data){
  //logger.info("sendResponse()");
  // Convert data to Json-friendly object
  // Send results back to the client
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.send(data);
  response.end();

  //logger.info("~sendResponse()");
}

app.listen(port, () => logger.info(`Server running on ${host}:${port}`));