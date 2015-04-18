/**
 * Dependencies
 */
 
var config  = require('./config');
var express = require('express');
var fs      = require('fs');
var _       = require('underscore');
var path    = require('path');
var logger  = require(config.yoctoModules('logger'));
var router  = require(config.yoctoModules('router'));
var _s      = require('underscore.string');
var render  = require(config.yoctoModules('render'));
var eless   = require('express-less');

// mixin underscore js ans underscore.string js to use the same namespace
_.mixin(_s.exports());

/**
 * Helper function to iterate directory and get resources
 */
var recursiveListFiles = function(path) {
  if (path == undefined) {
    return [];
  }

  var paths = _.map(fs.readdirSync(path), function(p) {
    return path + '/' + p
  });
  
  var files = _.filter(paths, function(f) {
    return fs.statSync(f).isFile() && (f.slice(-3) == '.js');
  });

  var dirs = _.filter(paths, function(f) {
    return (fs.statSync(f).isDirectory());
  });

  return _.flatten(files.concat(_.map(dirs, function(d) {
    return this.recursiveListFiles(d)
  }, this)));
}

/**
 * Normalize some path and get all routes path
 */
var normalizePath   = path.normalize(__dirname + '/../routes');
var routesConfig    = recursiveListFiles(normalizePath);

exports.init = function(app) {

  var constants = config.constants;

  logger.banner('Initializing Routes ...');

  var rCount = 0;
   
  _.each(routesConfig, function(item) { 
    var simpleModuleName = item.replace(normalizePath + '/', '');
  
    logger.debug(_.join(' ', 'Retreiving routes for [', simpleModuleName, ']'));
    
    var mod = require(item);
    
    if (!mod.hasOwnProperty('routes')) {
      logger.warning(_.join(' ', 'Module [', simpleModuleName, "] doesn't have any routes. Remove this file or add one route configuration"));
    } else {
      
      if (_.isEmpty(mod.routes) || !_.isArray(mod.routes)) {
        logger.warning(_.join(' ', 'Module [', simpleModuleName, '] contains routes but syntax is invalid. must be an array of object, and not empty'));
      } else {
          logger.debug(_.join(' ', 'Module ', simpleModuleName, ' contains routes. processing set up'));      
          
          _.each(mod.routes, function(route) {
            logger.debug(_.join(' ', 'Checking route config for item [',  simpleModuleName, ']'));
            
            if (router.check(app, route)) {
              router.add(app, route);
              rCount++;
            } else {
              logger.warning(_.join(' ', 'Checking route for item n° [', (rCount + 1), '] in [', simpleModuleName, '] failed. This route was ignored'));
            }
          });
      }
    } 
  });

  logger.debug('Setting up less on the fly complile');
  app.use('/assets/css/less', eless(_.join('/', constants.PUBLIC_DIRECTORY, 'assets/css/less'), { debug : true, compress : true }));

  
  logger.debug('Setting up routes for HTTP 404 and 500 Request');

  /**
   * Setting up HTTP 404 and 500 rules
   */    
  logger.debug('Setting up the global default error handler');    
  app.use(function(err, req, res, next) {

    var message = (err.message).toLowerCase();
    
    if (_s.include(message, 'not found')) {
      return next();
    }
    
    logger.error(err.message);
    logger.error(err.stack);
    
    render.render(500, req, res, next, { error : err.stack });      
  });
  
  // Not render the 404 page on html 5  
  // Logger.debug('Setting up the 404 default error handler if no middelware is setting up');    
  /*
    app.use(function(req, res, next) {
    render.render(404, req, res, next, { url : req.originalUrl, error : 'Not Found' });
  });
  */

  // When we use html 5 mode in angular js we need to redirect all request to the main index render
  app.get('*', function(req, res, next) {
    render.render('index', req, res, next, {});
  });

  // check   
  if (rCount == 0) {
    logger.error('No Routes found. Only a global routes catcher is enable and HTTP 404/500 request');
  } else {
    logger.debug(_.join(' ', rCount, 'routes was added on this app + 404 and 500 http request routes'));
  }
  
  logger.info('Routes are ready to use ...');
};
