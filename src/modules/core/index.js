'use strict';

var portScanner = require('portscanner');
var _           = require('lodash');
var logger      = require('yocto-logger');
var path        = require('path');
var fs          = require('fs');
var Q           = require('q');
var utils       = require('yocto-utils');
var joi         = require('joi');

/**
 * Default core stack process
 *
 * @class Core
 * @param {Object} logger logger instance
 */
function Core (logger) {
  /**
   * Default logger instance
   */
  this.logger = logger;

  /**
   * Default config object
   */
  this.config = require('yocto-config')(this.logger);

  /**
   * Default render object
   */
  this.render = require('yocto-render')(this.logger);

  /**
   * Default router object
   */
  this.router = require('yocto-router')(this.logger);

  /**
   * Current express app
   */
  this.app = require('yocto-express')(this.config, this.logger);

  /**
   * Default enable module to use for core stack
   *
   * @property {Array}
   * @default [ 'express', 'render', 'router' ]
   */
  this.wantedModules = [ 'express', 'render', 'router' ];

  /**
   * Default for ready check
   */
  this.state = false;
}

/**
 * Initialize default module to enable for config validation
 *
 * @param {Array} items array of items name to activate
 * @return {Object} default promise to catch
 */
Core.prototype.initialize = function (items) {
  // Banner message
  this.logger.banner('[ Core.initialize ] - Initializing Core Stack > Enable module validators.');

  // Create async process
  var deferred  = Q.defer();

  // Validation schema
  var schema    = joi.array().required().min(1).items(joi.string().required().empty());

  // Normalize array if is undefined
  items = items || [];

  // Add default item
  items.push(this.wantedModules);

  // Keep array to one level deep
  items = _.flatten(items);

  // Validate
  var validate  = joi.validate(items, schema);

  // Is valid ?
  if (_.isNull(validate.error)) {
    // Enable validators
    if (this.config.autoEnableValidators(validate.value)) {
      // Save value for configure action
      this.wantedModules = validate.value;

      // Resolve all is ok
      deferred.resolve(validate.value);
    } else {
      // Reject cannot enable validators
      deferred.reject('Cannot enable validators on config package.');
    }
  } else {
    // Reject cannot enable validators
    deferred.reject([ 'Cannot enable validators. Errors occured during schema validation :',
      validate.error
    ].join(' '));
  }

  // Default statement
  return deferred.promise;
};

/**
 * Set config path to use for config load
 *
 * @param {String} p path of file
 * @return {Object} default promise to catch
 */
Core.prototype.setConfigPath = function (p) {
  // Banner message
  this.logger.banner('[ Core.setConfigPath ] - Initializing Core Stack > Setting config path.');

  // Create async process
  var deferred  = Q.defer();

  // Test if path is a valid format ?
  if (_.isString(p) && !_.isEmpty(p)) {
    // Is absolute ?
    if (!path.isAbsolute(p)) {
      // Normalize path
      p = path.normalize([ process.cwd(), p ].join('/'));
    }

    // File exists ?
    fs.stat(p, function (error, stats) {
      // Default error message
      var errorMessage = 'Invalid config path given.';

      // Has error ?
      if (!error) {
        // Is directory ?
        if (!stats.isDirectory()) {
          // Set error message
          errorMessage = 'Invalid config path given.';

          // Set error status
          error = true;
        } else {
          // All is ok set data
          if (!this.config.setConfigPath(p)) {
            // Set error message
            errorMessage = 'Cannot set config path. config refused value.';

            // Set error status
            error = true;
          }
        }
      }

      // Has error for promise action ?
      if (error) {
        // Log error
        this.logger.error([ '[ Core.setConfigPath ] -', errorMessage ].join(' '));

        // Reject
        deferred.reject(errorMessage);
      } else {
        // Simple message
        this.logger.info('[ Core.setConfigPath ] - Config path was correctly set.');

        // Resolve all is ok
        deferred.resolve();
      }
    }.bind(this));
  } else {
    // Default message
    var message = 'Invalid config path given. Must be a string and not empty';

    // Error

    this.logger.error([ '[ Core.setConfigPath ] -', message ].join(' '));

    // Reject
    deferred.reject(message);
  }

  // Default statement
  return deferred.promise;
};

/**
 * Default configure process
 *
 * @return {Object} default promise to catch
 */
Core.prototype.configure = function () {
  // Banner message
  this.logger.banner([ '[ Core.configure ] - Initializing Core Stack >',
    'Starting middleware configuration.' ].join(' '));

  // Create async promise
  var deferred = Q.defer();

  // Load config
  this.config.load().then(function (data) {
    // Configure render
    if (this.render.updateConfig(data.render)) {
      // Messsage
      this.logger.info([ '[ Core.configure - Update render config succced.',
        'Add reference on app ]' ].join(' '));

      // Add on app
      if (this.addOnApp('render', this.render) &&
          this.addOnApp('logger', this.logger) &&
          this.addOnApp('config', this.config)) {
        // Config load already processed so we dont load data again
        this.app.configureWithoutLoad(this.config, true).then(function () {
          // Add app on router
          this.router.useApp(this.app.getApp());

          // Set routes path
          if (this.router.setRoutes(data.router.routes)) {
            // Set controller routes
            if (this.router.setEndPoint(data.router.controllers)) {
              // Configure router ?
              if (this.router.configure()) {
                // Change process state
                this.state = true;

                // Resolve all is ok
                deferred.resolve();
              } else {
                // Reject invalid path
                deferred.reject('Cannot process router configuration. Errors occured.');
              }
            } else {
              // Reject invalid path
              deferred.reject('Invalid path given for routes controllers.');
            }
          } else {
            // Reject invalid path
            deferred.reject('Invalid path given for routes.');
          }
        }.bind(this)).catch(function (error) {
          // Reject with error
          deferred.reject(error);
        });
      } else {
        // Reject process
        deferred.reject('Cannot continue. Cannot add render on app.');
      }
    } else {
      // Reject process
      deferred.reject('Cannot update render config. Cannot process configure.');
    }

    // Configure db ?
  }.bind(this)).catch(function (error) {
    // Error message
    this.logger.error('[ Core.configure ] - Cannot load config. check your logs.');

    // Reject with error message
    deferred.reject(error);
  }.bind(this));

  // Default promise
  return deferred.promise;
};

/**
 * Check if all is ready before start stack
 *
 * @return {Boolean} true if all is ok false otherwise
 */
Core.prototype.isReady = function () {
  // Dafault statement
  return this.app.isReady() && this.state;
};

/**
 * Add element on app via set method
 *
 * @param {String} name reference name to use on app
 * @param {Mixed} value value to add on name reference
 * @return {Boolean} true if all is ok false otherwise
 */
Core.prototype.addOnApp = function (name, value) {
  // Is valid format ??
  if (_.isString(name) && !_.isEmpty(name) && !_.isUndefined(value) && !_.isNull(value)) {
    // Add element on app instance
    this.app.getApp().set(name, value);

    // A debug message
    this.logger.debug([ '[ Core.addOnApp ] - Add property', name,
      'with value :', utils.obj.inspect(_.omit(value, [
        'logger', 'schema', 'schemaList' ]))
    ].join(' '));

    // Valid statement
    return true;
  }

  // Warning message
  this.logger.warning([ '[ Core.addOnApp ] - Cannot add property', name,
    'on current app. name must be a string and not empty.',
    'value must be not undefined or null.' ].join(' '));

  // Invalid & default statement
  return false;
};

/**
 * Default function to add an external middleware on app
 *
 * @param {Function} middleware default middleware to use on app
 * @return {Boolean} return true if all is ok falser otherwise
 */
Core.prototype.useOnApp = function (middleware) {
  // Is a function ? and app is ready ?
  if (this.isReady() && _.isFunction(middleware)) {
    // Add middleware on current app
    this.app.getApp().use(middleware);

    // Valid statement
    return true;
  }

  // Default statement
  return false;
};

/**
 * Utility method to check if is a multiple instance app
 *
 * @return {Boolean} true if is a multiple instance false otherwise
 */
Core.prototype.isMultipleInstances = function () {
  // Default statement
  return _.has(process.env, 'instances') && _.has(process.env, 'NODE_APP_INSTANCE');
};

/**
 * Start the main process of your own server
 *
 * @return {Object} default promise to catch
 */
Core.prototype.start = function () {
  // Create async process here
  var deferred  = Q.defer();

  // Default error mesage
  var message   = 'Cannot start app. Configure process seems to be not ready';

  // All is ready ?
  if (this.isReady()) {
    // Saving some requirements
    var port = this.app.getApp().get('port');
    var host = this.app.getApp().get('host');
    var env  = this.app.getApp().get('env');

    // Banner start
    this.logger.banner([ '[ Core.start ] - Starting app :',
      this.app.getApp().get('app_name') ].join(' '));

    // Checking port
    portScanner.checkPortStatus(port, host, function (error, status) {
      // Is not multiple instance and status is closed ?
      if (!this.isMultipleInstances() && status !== 'closed') {
        // Default message
        message = [ 'Cannot start your app. Port [', port,
          '] is already in use on [', host, ']' ].join(' ');

        // Error
        this.logger.error([ '[ Core.start ] -', message ].join(' '));

        // Reject
        deferred.reject(message);
      } else {
        // Is multiple instance ?
        if (this.isMultipleInstances()) {
          // Log multiple instance
          this.logger.info([ '[ Core.start ] - Application [',
            this.app.getApp().get('app_name'), '] start on cluster mode with [',
            process.env.instances || 0, '] instances. Current instance is [',
            process.env.NODE_APP_INSTANCE || 0, ']' ].join(' '));
        }

        // Normal process
        this.app.getApp().listen(port, function () {
          this.logger.info([ '[ Core.start ] -', env.toUpperCase(),
            'mode is enabled.' ].join(' '));
          this.logger.info([ '[ Core.start ] - starting app on',
            [ '127.0.0.1', port ].join(':') ].join(' '));
          this.logger.info('[ Core.start ] - To Kill your server following these command :');
          this.logger.info('[ Core.start ] - No standalone usage : Press Ctrl-C to terminate');
          this.logger.info('[ Core.start ] - On standalone usage : kill your process');

          // Resolve all is ok here
          deferred.resolve();
        }.bind(this));
      }
    }.bind(this));
  } else {
    // App is not ready
    this.logger.error([ '[ Core.start ] - ', message ].join(' '));

    // Reject
    deferred.reject(message);
  }

  // Default statement
  return deferred.promise;
};

// Default export
module.exports = function (l) {
  // Is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    logger.warning('[ Core.constructor ] - Invalid logger given. Use internal logger');

    // Assign
    l = logger;
  }

  // Default statement
  return new Core(l);
};
