'use strict';

var logger    = require('yocto-logger');
var configure = require('./modules/configure');
var core      = require('./modules/core');
var Q         = require('q');
var path      = require('path');
var fs        = require('fs');
var _         = require('lodash');

/**
 * Default core wrapper to initialize our statck
 *
 * @class CoreWrapper
 */
function CoreWrapper () {
  /**
   * Define if app is on debug mode
   *
   * @property debug
   * @type {Boolean}
   * @default false
   */
  this.debug  = false;

  /**
   * Default logger instance
   *
   * @property logger
   * @type {Object}
   */
  this.logger = logger;

  /**
   * Default core instance
   *
   * @property core
   * @type {Object}
   * @default {}
   */
  this.core   = {};

  /**
   * Default modules list to activate
   *
   * @property modules
   * @type {Array}
   * @default []
   */
  this.modules    = [];

  /**
   * Default Config path to use on start method
   *
   * @property configPath
   * @type {String}
   * @default ''
   */
  this.configPath = '';

  /**
   * Default env value
   *
   * @property env
   * @type {String}
   * @default {String}
   */
  this.env        = process.NODE_ENV || 'development';
}

/**
 * Default init method before start app
 *
 * @return {Object} default promise to catch
 */
CoreWrapper.prototype.init = function () {
  // create async process
  var deferred = Q.defer();

  // save current context
  var context = this;

  // normal process
  try {
    // normalize path before anything
    var data = path.normalize([ process.cwd() ,
                                this.debug ? 'example/core.json' : 'core.json'
                              ].join('/'));
    // try to load data
    data = JSON.parse(fs.readFileSync(data));

    // json file is ok try to configure
    configure.init(data).then(function (data) {
      // set config path
      context.configPath = data.config;
      // has env ?
      if (_.has(data.env, context.env)) {
        var env = data.env[context.env];
        // change log level
        logger.setLogLevel(env.logger.level);
        // add daily rotate transport ?
        if (_.has(env.logger, 'rotate')) {
          // add daily rotate
          logger.addDailyRotateTransport(env.logger.rotate.path, env.logger.rotate.name)
                .then(function () {
            // init core
            context.core = core(logger);
            // reject error occured
            deferred.resolve();
          }, function (error) {
            // reject error occured
            deferred.reject(error);
          });
        } else {
          // all is ok so resolve
          deferred.resolve();
        }
      } else {
        // reject item
        deferred.reject('Environment vars is not defined cannot continue.');
      }
    }).catch(function (error) {
      // log message
      var message = [ 'Config file is invalid :', error ].join(' ');
      // reject
      deferred.reject(message);
    });
  } catch (e) {
    // log message
    var message = [ 'Cannot init core :', e.message ].join(' ');
    // reject
    deferred.reject(message);
  }

  // default statement
  return deferred.promise;
};

/**
 * Define if all is ready on Wrapper before start app
 *
 * @return {Boolean} true if all is ok false otherwise
 */
CoreWrapper.prototype.isReady = function () {
  // default statement
  return _.isString(this.configPath) && !_.isEmpty(this.configPath) &&
         _.isArray(this.modules) && !_.isEmpty(this.core);
};

/**
 * Start Current app
 *
 * @return {Object} default promise to catch
 */
CoreWrapper.prototype.start = function () {
  // create async process
  var deferred = Q.defer();

  // save current context
  var context = this;

  // is ready ??
  if (this.isReady()) {
    // normal process for try catch
    try {
      // initialize core with needed module
      this.core.initialize(this.modules).then(function () {
        // set config path for config load
        context.core.setConfigPath(context.configPath).then(function () {
          // config path is ok so confiure before start
          context.core.configure().then(function () {
            // start the app
            context.core.start().then(function () {
              // nothing for the moment
            }).catch(function (error) {
              // error message
              logger.error([ '[ Core.stack.run ] - Cannot start app :', error ].join(' '));
              // reject
              deferred.reject(error);
            });
          }).catch(function (error) {
            // error message
            logger.error([ '[ Core.stack.run ] - Cannot configure core process :',
                            error ].join(' '));
            // reject
            deferred.reject(error);
          });
        }).catch(function (error) {
          // error message
          logger.error([ '[ Core.stack.run ] - Cannot process config setting :',
                          error ].join(' '));
          // reject
          deferred.reject(error);
        });
      }).catch(function (error) {
        // error message
        logger.error([ '[ Core.stack.run ] - Cannot process intialize :', error ].join(' '));
        // reject
        deferred.reject(error);
      });
    } catch (e) {
      // error message
      logger.error([ '[ Core.stack.run ] - An general error occured :', e.message ].join(' '));
      // reject
      deferred.reject(e.message);
    }
  } else {
    // reject message
    deferred.reject('[ Core.stack.run ] - Cannot start app. Stack is not ready.');
  }

  // default statement
  return deferred.promise;
};

// Default export
module.exports = new (CoreWrapper)();
