/**
 * Dependencies
 * @author :  Mathieu ROBERT <mathieu@yocto.re>
 * @copyright : Yocto SAS, All right reserved 
 * @see : https://github.com/andris9/nodemailer-smtp-transport
 * @see : https://github.com/andris9/nodemailer
 */

var all       = require('./all');
var _       = require('underscore');
var _s      = require('underscore.string');

// mixin underscore js ans underscore.string js to use the same namespace
_.mixin(_s.exports());

// custom constants
var constants = all.constants;

/**
 * export config
 */
module.exports = {

  // Database config
  db : {
    type                  : 'mysql',
    port                  : 3306,
    username              : 'bazarmaurice',
    password              : '93zPpZ6B5vmRpsCe',
    name                  : 'bazarmaurice',
    host                  : '127.0.0.1',
    sync                  : false, // true force sync for each call, false never force,
    logging               : true, 
    charset               : 'utf8',
    collate               : 'utf8_general_ci',
    syncOnAssociation     : false,
    maxConcurrentQueries  : 100,
    poolMinConnections    : 0,
    poolMaxConnections    : 1000,
    poolMaxIdleTime       : 30,
    timezone              : '+04:00'    
  },
  mailer : {
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
    tls             : {},
    adminAddress    : 'contact@bazarmaurice.mu'
  },
  logger : {
    emitErrs : true,
    exitOnError : false,
    transports : {
      transport : {
        level             : 'debug',
        dirname           : _.join('/', '/var/log/php', constants.APP_NAME),
        filename          : constants.APP_NAME,
        handleExceptions  : true,
        json              : false,
        maxsize           : 5242880, //5MB
        maxFiles          : 5,
        colorize          : true,
        datePattern       : '.yyyy-MM-dd.log'        
      },
      console : {
        level             : 'debug',
        handleExceptions  : false,
        json              : false,
        colorize          : true
      }    
    },
    logLevel : 'debug'
  },
  // applicaiton config
  app : {
    name         : constants.APP_NAME,
    stackError   : true,
    adminTimeOut : 30, // in minutes 
    social       : {
      facebook : {
        title       : "Free Ads in Mauritius - BazarMaurice.mu",
        description : "The right choice for buying & selling in Mauritius. Used cars, properties to rent, pets for sale, services and much more! BazarMaurice.mu - FREE, SIMPLE and LOCAL.",
        image       : "assets/pictures/social/default-fb-share.png"
      },
      twitter : {
        
      },
      dc : {
        
      }
    } 
  },
  express : {
    prettyHtml  : true,
    filter      : {
      rules : 'json|text|javascript|css',
      by    : 'Content-Type',
      level : 9
    },
    viewEngine : 'jade',
    session : {
      secret            : '12FeV20151938280000',
      name              : constants.APP_NAME,
      secure            : true,
      genuuid           : true,
      proxy             : true,
      resave            : true,
      saveUninitialized : true      
    },
    vhost : {
      enable      : true,
      url         : 'bmu.yocto.digital',
      aliases     : [ 'bmu2.yocto.digital' ],       
      subdomains  : true,
      http        : {
        redirect : {
          type : 301,
          url  : 'bmu.yocto.digital',
          port : 80
        }
      }
    }
  },
  render : {
    charset     : 'utf-8',
    language    : 'en',
    title       : 'Bazar Maurice',
    description : '',
    keywords    : [],
    httpEquiv   : [
      { name : 'X-UA-Compatible', value : 'IE=edge' },
      { name : 'Content-type', value : 'text/html; charset=UTF-8' }  
    ],
    meta : [
      { name : 'viewport', value : 'width=device-width, initial-scale=0' }     
    ],
    assets : {
      pictures :  '/assets/pictures',
      css : {
        header : [
          { link : '/assets/css/bootstrap/bootstrap.min.css', media : 'screen' },
          { link : '/assets/css/less/common.css', media : 'screen' }
        ],
        footer : [
          { link : '/assets/css/font-awesome/font-awesome.min.css', media : 'screen' },                    
          { link : '/assets/css/slick-carousel/slick.css', media : 'screen' }
        ] 
      },
      js : {
        header : [],
        footer : [
          '/assets/js/jquery/jquery.min.js',
          '/assets/js/bootstrap/bootstrap.min.js',
          '/assets/js/underscore/underscore-min.js',         
          '/assets/js/underscore-string/underscore.string.min.js',
          '/assets/js/angular/angular.min.js',
          '/assets/js/angular-cookies/angular-cookies.min.js',
          '/assets/js/angular-local-storage/angular-local-storage.min.js',          
          '/assets/js/angular-resource/angular-resource.min.js',
          '/assets/js/angular-route/angular-route.min.js',
          '/assets/js/angular-bootstrap/ui-bootstrap.min.js',
          '/assets/js/angular-bootstrap/ui-bootstrap-tpls.min.js',
          '/assets/js/angular-ui-utils/ui-utils.min.js',
          '/assets/js/angular-messages/angular-messages.min.js',
          '/assets/js/angular-filter/angular-filter.min.js',
          '/assets/js/angular-md5/angular-md5.min.js',
          '/assets/js/angular-file-upload/angular-file-upload.min.js',
          '/assets/js/angulartics/angulartics.js',
          '/assets/js/angulartics/angulartics-ga.js',          
          '/assets/js/angular-slick-carousel/slick.min.js',                         
          '/assets/js/slick-carousel/slick.min.js',
          '/assets/js/factory-filter.js',
          '/assets/js/app.js',
          '/assets/js/controllers.js',
          '/assets/js/directives.js',
          '/assets/js/routes.js'
        ]
      },
      font : {
        header : [],
        footer : []
      }
    }
  }
}