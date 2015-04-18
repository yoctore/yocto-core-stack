/**
 * Dependencies
 * @documentation : https://github.com/flatiron/winston
 * @see : http://tostring.it/2014/06/23/advanced-logging-with-nodejs/
 * @see : https://www.npmjs.org/package/winston
 * @author :  Mathieu ROBERT <mathieu@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 */
 
var config        = require('../../config/config'); 
var _             = require('underscore');
var _s            = require('underscore.string');
var nm            = require('nodemailer');
//var smtp          = require('nodemailer-smtp-transport');

// mixin underscore js ans underscore.string js to use the same namespace
_.mixin(_s.exports());
//var mailerTransporter = nodemailer.createTransport(nmSmtp(smtp));

var mailer               = function() {};
mailer.prototype.mconfig = {};

mailer.prototype.init = function() {
  if (!(_.isUndefined(config.mailer))) {
    var cmailer = config.mailer;
    
    if (!(_.isUndefined(cmailer.port) && _.isNumber(cmailer.port)) {
      this.mconfig = _.extend(this.mconfig, { port : cmailer.port });
    }
    
    if (!(_.isUndefined(cmailer.host) && _.isString(cmailer.host)) {
      this.mconfig = _.extend(this.mconfig, { host : cmailer.host });
    }    

    if (!(_.isUndefined(cmailer.secure) && _.isBoolean(cmailer.secure)) {
      this.mconfig = _.extend(this.mconfig, { secure : cmailer.secure });
    }
    
    if (!(_.isUndefined(cmailer.auth) && _.isObject(cmailer.auth)) {
      var auth  = cmailer.auth;
      
      if (auth.hasOwnProperty('') && auth.hasOwnProperty('')) {
        this.mconfig = _.extend(this.mconfig, { auth : cmailer.auth });        
      }
    }    
    
  }
};

mailer.prototype.send = function(message) {
    this.init();
};
/**
 * Assign data to the exports scope
 */
module.exports  = new mailer();



    port            : 25,
    host            : 'localhost',
    secure          : false,
    auth            : {},
    ignoreTls       : true,
    name            : '',
    localAdress     : null,
    timeout         : 200,
    greetingTimeout : null,
    socketTimeout   : null,
    debug           : true,
    authMethod      : 'PLAIN',
    tls             : {}
     