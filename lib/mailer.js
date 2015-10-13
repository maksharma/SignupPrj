'use strict';

var nodemailer = require('nodemailer');
var config = require('../config/config');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'mayank2.sharma@paytm.com',
      pass: config.emailpwd
    }
  });

var sendMail = {
  sendMail : function(email, name, message, cb){
  var status =1;
  var mailOptions = {
    from: 'M S <mayank2.sharma@paytm.com>', // sender address
    to: email, // list of receivers
    subject: 'Password recovery', // Subject line
    html: message
  };

  transporter.sendMail(mailOptions, function(error, info){
      if(error){
        console.log(error);
        status = 1;
        return cb(error, status);
      }
      else{
        console.log('Message sent: ' + info.response);
        status =0;
        return cb(null, status);
      }
    });
  }
}
     
module.exports = sendMail;