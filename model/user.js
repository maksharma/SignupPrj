'use strict';

var encrypter = require('../lib/encrypter');
var dbsequel = require('./db-sequel').connection;
var mailer = require('../lib/mailer');

var usertable = dbsequel.define({
      name: 'users',
      columns: {
        name: {primaryKey: true},
        password: {},
        email: {},
        age:{}
      }
    });

var user ={

  login : function(name, password, cb){
    var status =4;    

    /*
    status 0 = success
    status 1 = username not found
    status 2 = password wrong
    status 4 = DB error
    */

    var loginquery = usertable.select(usertable.name).from(usertable).where({name : name});
    var passcheckquery = usertable.select(usertable.password).from(usertable).where({name : name});

    loginquery.exec(function cb1(err, data){
      if(err)
        status =4; 
      else{
        if(data.length ==0){
          status=1;
          return cb(null, status);
        }
        else{
          passcheckquery.exec(function cb2(err, passdata){
            var passfromDB = passdata[0].password;
            encrypter.comparepassword(password, passfromDB, function cb3(err, result){
              if(!result){
                status = 2;
                return cb(null, status);
              }
              else{
                status = 0;
                return cb(null, status);
              }
            });
          });  
        }
      }
    });
  },

  encrypt : function(password, cb){
    encrypter.encrypt(password,function(err,pwd){
      return cb(err, pwd);//pwd is hashed pwd
    });
  },

  checkAndSignup : function(name, password, email, cb){
    var status = 1;

    var signupquery = usertable.insert({
      name : name,
      password : password,
      email :email,
      age : 20
    });

    var existingEmailCheckQuery = usertable.select(usertable.email).from(usertable).where({email : email});
    existingEmailCheckQuery.exec(function cb2(err, data){
      if(err || data.length>0){
        status = 1;
        return cb(null, status);
      }
      else{
        signupquery.exec(function cb1(err, data){
          if(!err && (data.affectedRows > 0))
            {
              status = 0;
            }
            return cb(err, status);
        });
      }
    }); 
  },

  getname : function(email, cb){
    var status =1;

    var getnamequery = usertable.select(usertable.name).from(usertable).where({email:email});
    getnamequery.exec(function cb1(err, data){
      if(err)
        return cb(err, null, null);
      else{
        if(data.length ==0){
          status =1;//not in DB
          return cb(null, status, null);
        }
        else
        if(data.length>0){
          status = 0;
          return cb(null, status, data[0].name);
        }
      }
    }); 
  },

  updatepassword : function(email, pass, cb){
    var status = 1;
    var query = usertable.update({
      password : pass
    }).where({
      email : email
    });
    query.exec(function cb1(err, data){
      if(!err && (data.affectedRows > 0))
      {
        status = 0;
        return cb(err, status);
      }
      else{
        status = 1;
        console.log(err);
        return cb(err, status);
      }
    });
  },

  sendMail : function(email, name, message, cb){
    mailer.sendMail(email, name, message, function cb2(err, mailstatus){
      if(!err && mailstatus == 0)
        return cb(null ,mailstatus);
      else 
        return(err, mailstatus);
    });
  }
};

module.exports = user;