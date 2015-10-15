'use strict';

var encrypter = require('../lib/encrypter');
var dbsequel = require('./db-sequel').connection;
var mailer = require('../lib/mailer');
var util = require('util');

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

  checkAndSignup : function(name, password, email, ops, cb){
    var status = 1;

    var filter = ops.filters;
    var filterArr = [];
    Object.keys(filter).forEach(function(t) {
      if (filter[t]) {
        if (util.isArray(filter[t])) {
          filterArr.push(usertable[t].in(filter[t]));
        } else {
          filterArr.push(usertable[t].equals(filter[t]));
        }
      }
    });

    var selected = ops.select;
    var selectedFields = [];

    Object.keys(selected).forEach(function(t) {
      if (selected[t]) {
        if (util.isArray(selected[t])) {
          selectedFields.push(usertable[t].in(selected[t]));
        } else {
          selectedFields.push(usertable[t].equals(selected[t]));
        }
      }
    });


    var existingEmailCheckQuery = usertable.select(selectedFields).from(usertable);
    var signupQuery = usertable.insert(ops.values);

    if (filterArr.length) {
      existingEmailCheckQuery = existingEmailCheckQuery.where.apply(existingEmailCheckQuery, filterArr);
    }
    console.log('signupquery : ', signupQuery.toQuery());

    existingEmailCheckQuery.exec(function cb1(err, data){
      if(err || data.length>0){
        // console.log('GOT IT : ', data);
        status = 1;
        return cb(null, status);
      }
      else{
        signupQuery.exec(function cb2(err, data){
          if(!err && (data.affectedRows > 0))
            {
              status = 0;
            }
            return cb(err, status);
        });
      }
    });

    /*======================================
    //old query for reference
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
    }); */
  },

  getname : function(email, ops, cb){
    var status =1;
    var filters = [];
    var query;
    var selectedFields = [];
    if (ops.columns) {
      ops.columns.forEach(function(t) {
        if (usertable[t]) {
          selectedFields.push(usertable[t]);
        }
      });
    }

    if (!selectedFields.length) {
      selectedFields = [usertable.star()];
    }

    ['email'].forEach(function(t) {
      if (ops[t]) {
        if (util.isArray(ops[t])) {
          filters.push(usertable[t].in(ops[t]));
        } else {
          filters.push(usertable[t].equals(ops[t]));
        }
      }
    });
    query = usertable.select(selectedFields).from(usertable);

    if (filters.length) {
      query = query.where.apply(query, filters);
    }

    query.exec(function cb1(err, data){
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

  updatepassword : function(email, pass, ops, cb){
    var status = 1;
    var query;
    var fields = [];
    
    var filter1 =ops.filters;
    var filter2 = [];
    Object.keys(filter1).forEach(function(t) {
      if (filter1[t]) {
        if (util.isArray(filter1[t])) {
          filter2.push(usertable[t].in(filter1[t]));
        } else {
          filter2.push(usertable[t].equals(filter1[t]));
        }
      }
    });
    query = usertable.update(ops.value);
    
    if (filter2.length) {
      query = query.where.apply(query, filter2);
    }
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



    /*====================================
    //Old code for reference
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
    ========================================*/
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