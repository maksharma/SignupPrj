'use strict';
/*
 * GET home page.
 */
var express = require('express');
var session = require('express-session');
var sess;

var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var user = require('./user');


module.exports = function(app) { 
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }
  app.get('/',function(req,res, next){
    res.redirect('/user/home');
  });

  app.get('/user/home', user.home);
  app.post('/user/login', user.login);

  app.get('/user/signup', user.signupform);
  app.post('/user/signup',user.encrypt, user.signup);
  app.get('/user/recoverpass', user.recoveryform);
  app.post('/user/recoverpass', user.sendMail);
  app.get('/user/passwordresetpage', user.displayresetpage);
  app.post('/user/passwordresetpage', user.encrypt, user.updatepassword); //resetpassword.changePassInDB, resetpassword.saveNewPassInDB);
  app.get('/user/logout', user.logout);
}
