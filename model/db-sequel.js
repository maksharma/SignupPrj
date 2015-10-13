"use strict";
  
var mysequel = require('mysequel');
var config = require('../config/config');
var util = require('util');
  
var dbConfig = { 
                url: util.format('mysql://%s:%s@%s:%s/%s',
                                  encodeURIComponent(config.username),
                                  encodeURIComponent(config.password),
                                  config.hostname,
                                  (config.portname || 3306),
                                  config.database),
                connections: { min: config.min, max: config.max },
              };

var connection = mysequel(dbConfig);
  
exports.connection = connection;
