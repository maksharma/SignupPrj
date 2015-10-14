'use strict';

var session = require('express-session');
var sess;

var user = require('../model/user');

var users = {
  home : function(req, res, next){
      sess = req.session;

      if(sess.name)
        res.render('index',{name : sess.name});
      else
        res.render('index');
  },

  login : function(req, res, next){
    var name = req.body.username;
    var password = req.body.password;
    if(name=='' || name==null || password=='' || password==null){
      res.render('login', {message : 'Invalid credentials, please try again.'});
    }
    else{
      user.login(name, password, function cb(err, status){
        if(err){
          console.log(err);
        }
        else
        if(status == 0){
          sess = req.session;
          sess.name = name;
          res.render('successful-login', {name : sess.name});
        }
        else
        if(status == 1){
          res.render('message', { message : 'The entered username does not exist'});
        }
        else
        if(status == 2){
          res.render('message', {message : 'Incorrect password! Use reset password link if you have forgotten your password.'});
        }
        else{
          res.render('message', { message : 'Please verify your details.'});
        }
      });
    }
  },

  signupform : function(req, res, next){
    res.render('signup', {message: 'Sign Up :'});
  },

  encrypt : function(req, res, next){
    var password = req.body.password;
    user.encrypt(password, function cb(err, pwd){
      if(!err){
        req.body.hashpwd = pwd;
       next();
      }
      else
        console.log(err);
    });
  },

  signup : function(req, res, next){
    var name = req.body.username;
    var password = req.body.hashpwd;
    var email = req.body.email;
    
    if(name=='' || name==null  || password =='' || password==null || email=='' || email==null){
      res.render('signup', {message: 'Wrong data try again :'});
    }
    else{
      user.checkAndSignup(name, password, email, function cb(err, status){
        if(!err){
          status ==0? res.render('message', {message : 'Signup successful. Login now!'}) : res.render('message', {message : 'Duplicate details.'});
        }
        else
          res.render('message', {message : 'DB error'});
      });
    } 
  },

  recoveryform : function(req, res, next){
    res.render('recover-pass');
  },

  sendMail : function(req, res, next){
    var email = req.body.email;
    var username = '';
    var message = '';
    var ops = {
      'email' : email
    }
    
    if(email =='' || email == null){
      res.render('message',{message : 'You didn\'t enter any email. Try again'});
    }
    else{
      user.getname(email, ops, function cb1(err, status, name){
        if(err)
          console.log('error',err);
        else
        if(status == 1){
          username = 'Undefined in DB';
          res.render('message',{message : 'This email is not registered with us.'});
        }
        else{
          username = name;
          message = 'Hello, '+ name +'. Click link to reset password. ' + 
          '<a href = "http://localhost:3000/user/passwordresetpage">Reset link</a> ';
          //message to be sent in email
          user.sendMail(email, username, message, function cb2(err, mailstatus){
            if(!err && status == 1){
              res.render('message', {message : 'This email is not registered with us.'});
            }
            else
            if(!err && status == 0){
              res.render('message', {message : 'Password reset email  successfully sent!'});
            }
            else{
              console.log(err);
            }
          });
        }
      });
    }
  },

  displayresetpage : function(req, res, next){
    res.render('password-reset-page');
  },

  updatepassword : function(req, res, next){
    var email = req.body.email;
    var password = req.body.hashpwd;
    if(email == '' || email == null || password == '' || password == null)
      res.render('message', {message : 'Please enter your email and new password.'});
    else{
      user.updatepassword(email, password, function cb(err, status){
        status==0? res.render('message', {message: 'Password successfully changed.'}) : res.render('message',{message : 'Error in details! Email doesn\'t exist in records.'});
     });
    }
  },

  logout : function(req, res, next){
    sess = req.session;
    req.session.destroy();
    res.render('after-logout', {name : sess.name});
  }
}

module.exports = users;