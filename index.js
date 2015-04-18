/**
 * Dependencies
 * @see : https://www.npmjs.org/package/portscanner
 * @author :  Mathieu ROBERT <mathieu@yocto.re>
 * @copyright : Yocto SAS, All right reserved 
 */
//var config      = require('./config/config');
//var logger      = require(config.yoctoModules('logger'));
//var express     = require('express');
//var portScanner = require('portscanner');
//var app         = express();
//var _           = require('underscore');
//var _s          = require('underscore.string');

// mixin underscore js ans underscore.string js to use the same namespace
//_.mixin(_s.exports());

/**
 * Default function to start when all app is ready
 */
/*function appIsReady() {

  require('./config/express')(app)
  

  require('./config/routes').init(app);
  

  logger.banner('Initializing WebServer ...');
   
  portScanner.checkPortStatus(app.get('port'), '127.0.0.1', function(error, status) {  
    if (status == 'closed') {
      app.listen(app.get('port'), function() {
        logger.info(_.join(' ', 'Starting Web Server for app', app.get('app_name'), ' on port [',  app.get('port'), ']'));
        logger.info('On one shot usage : Press Ctrl-C to terminate');
        logger.info('On standalone usage : kill your process');  
      });
    } else {
      logger.error(_.join(' ', 'Cannot run your app. Port [', app.get('port'),  '] is already in use'));
    }
  });      
}

exports = module.exports = app;
*/
'use strict';

var portScanner = require('portscanner');
var express     = require('express');
var _           = require('lodash');
var app         = express();


var core        = function(){};

core.config     = {
    
};

/**
 * Start the main process of your own server
 */
core.prototype.start = function() {
  portScanner.checkPortStatus(app.get('port'), '127.0.0.1', function(error, status) {  
    if (status == 'closed') {
      app.listen(app.get('port'), function() {
        console.log('la');
        //logger.info(_.join(' ', 'Starting Web Server for app', app.get('app_name'), ' on port [',  app.get('port'), ']'));
        //logger.info('On one shot usage : Press Ctrl-C to terminate');
        //logger.info('On standalone usage : kill your process');  
      });
    } else {
      //logger.error(_.join(' ', 'Cannot run your app. Port [', app.get('port'),  '] is already in use'));
    }
  }); 
};

var instance    = new core();

instance.start();

// export core files
//module.exports  = instance;
