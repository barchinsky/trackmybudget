#!/bin/env node

// https://learn.javascript.ru/screencast/nodejs

var express = require("express");

//var https = require("https");
var path = require("path");
var bodyParser = require("body-parser");
var fs = require("fs");
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

//var db = require("./database");

var LoggerFactory = require("./public/src/utils/logger.js").LoggerFactory;
var logger = LoggerFactory.getLogger({label:"Server"});

var configDB = require('./public/config/mongodb.js');
mongoose.connect(configDB.url);

var host = process.env.BUDGET_HOST; 
var port = process.env.PORT || 18000;

if (typeof host === "undefined") {
  //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
  //  allows to run/test the app locally. 
  host = 'localhost';
}

app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( urlencodedParser ); // Parse request body into request.body.
app.use( cookieParser() );
app.use( session({ 
  secret: 'fskljlsdkfkljsdf',
  resave:false,
  saveUninitialized:true,
  maxAge:null,
} ) );

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//app.use(verifyJWT_MW());

require('./public/config/passport')(passport, logger);

require('./public/routes.js')(app, passport, logger, jwt);

app.listen(port, () => logger.info(`Server running on ${host}:${port}`));