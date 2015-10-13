var bcrypt = require('bcrypt');

var encrypter = {
  encrypt : function(password, callback){
    bcrypt.genSalt(10, function(err, salt){
      if(err){
        return callback(err, null);
      }
      bcrypt.hash(password, salt, function(err, hash){
        return callback(err, hash);
      });
    });
  },
  comparepassword : function(password, userPassDB, callback){
    bcrypt.compare(password, userPassDB, function(err, isPasswordMatch) {
      if (err)
        return callback(err, null);
      callback(err, isPasswordMatch);
   });
  }
};

module.exports = encrypter;