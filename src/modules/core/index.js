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
 */
function Core (logger) {
  /**
   * Default logger instance
   */
  this.logger   = logger;

  /**
   * Default config object
   */
  this.config   = require('yocto-config')(this.logger);

  /**
   * Default render object
   */
  this.render   = require('yocto-render')(this.logger);

  /**
   * Default router object
   */
  this.router   = require('yocto-router')(this.logger);

  /**
   * Current express app
   */
  this.app      = require('yocto-express')(this.config, this.logger);

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
  this.state         = false;
}

/**
 * Initialize default module to enable for config validation
 *
 * @param {Array} items array of items name to activate
 * @return {Object} default promise to catch
 */
Core.prototype.initialize = function (items) {
  // banner message
  this.logger.banner('[ Core.initialize ] - Initializing Core Stack > Enable module validators.');

  // create async process
  var deferred  = Q.defer();
  // validation schema
  var schema    = joi.array().required().min(1).items(joi.string().required().empty());

  // normalize array if is undefined
  items = items || [];
  // add default item
  items.push(this.wantedModules);
  // keep array to one level deep
  items = _.flatten(items);
  // validate
  var validate  = joi.validate(items, schema);

  // is valid ?
  if (_.isNull(validate.error)) {
    // enable validators
    if (this.config.autoEnableValidators(validate.value)) {
      // save value for configure action
      this.wantedModules = validate.value;
      // resolve all is ok
      deferred.resolve(validate.value);
    } else {
      // reject cannot enable validators
      deferred.reject('Cannot enable validators on config package.');
    }
  } else {
    // reject cannot enable validators
    deferred.reject([ 'Cannot enable validators. Errors occured during schema validation :',
                      validate.error
                    ].join(' '));
  }

  // default statement
  return deferred.promise;
};

/**
 * set config path to use for config load
 *
 * @param {String} p path of file
 * @return {Object} default promise to catch
 */
Core.prototype.setConfigPath = function (p) {
  // banner message
  this.logger.banner('[ Core.setConfigPath ] - Initializing Core Stack > Setting config path.');
  // create async process
  var deferred  = Q.defer();

  // test if path is a valid format ?
  if (_.isString(p) && !_.isEmpty(p)) {
    // is absolute ?
    if (!path.isAbsolute(p)) {
      // normalize path
      p = path.normalize([ process.cwd(), p ].join('/'));
    }

    // file exists ?
    fs.stat(p, function (error, stats) {
      // default error message
      var errorMessage = 'Invalid config path given.';

      // has error ?
      if (!error) {
        // is directory ?
        if (!stats.isDirectory()) {
          // set error message
          errorMessage = 'Invalid config path given.';
          // set error status
          error        = true;
        } else {
          // all is ok set data
          if (!this.config.setConfigPath(p)) {
            // set error message
            errorMessage = 'Cannot set config path. config refused value.';
            // set error status
            error        = true;
          }
        }
      }

      // has error for promise action ?
      if (error) {
        // log error
        this.logger.error([ '[ Core.setConfigPath ] -', errorMessage ].join(' '));
        // reject
        deferred.reject(errorMessage);
      } else {
        // simple message
        this.logger.info('[ Core.setConfigPath ] - Config path was correctly set.');
        // resolve all is ok
        deferred.resolve();
      }
    }.bind(this));
  } else {
    // default message
    var message = 'Invalid config path given. Must be a string and not empty';
    // error
    this.logger.error([ '[ Core.setConfigPath ] -', message ].join(' '));
    // reject
    deferred.reject(message);
  }

  // default statement
  return deferred.promise;
};

/**
 * Default configure process
 *
 * @return {Object} default promise to catch
 */
Core.prototype.configure = function () {
  // banner message
  this.logger.banner([ '[ Core.configure ] - Initializing Core Stack >',
                       'Starting middleware configuration.' ].join(' '));
  // create async promise
  var deferred = Q.defer();

  // load config
  this.config.load().then(function (data) {
    // Configure render
    if (this.render.updateConfig(data.render)) {
      // messsage
      this.logger.info([ '[ Core.configure - Update render config succced.',
                            'Add reference on app ]' ].join(' '));
      // add on app
      if (this.addOnApp('render', this.render) &&
          this.addOnApp('logger', this.logger) &&
          this.addOnApp('config', this.config)) {
        // config load already processed so we dont load data again
        this.app.configureWithoutLoad(this.config, true).then(function () {
          // add app on router
          this.router.useApp(this.app.getApp());
          // set routes path
          if (this.router.setRoutes(data.router.routes)) {
            // set controller routes
            if (this.router.setEndPoint(data.router.controllers)) {
              // configure router ?
              if (this.router.configure()) {
                // change process state
                this.state = true;
                // resolve all is ok
                deferred.resolve();
              } else {
                // reject invalid path
                deferred.reject('Cannot process router configuration. Errors occured.');
              }
            } else {
              // reject invalid path
              deferred.reject('Invalid path given for routes controllers.');
            }
          } else {
            // reject invalid path
            deferred.reject('Invalid path given for routes.');
          }
        }.bind(this)).catch(function (error) {
          // reject with error
          deferred.reject(error);
        });
      } else {
        // reject process
        deferred.reject('Cannot continue. Cannot add render on app.');
      }
    } else {
      // reject process
      deferred.reject('Cannot update render config. Cannot process configure.');
    }
    // configure db ?
  }.bind(this)).catch(function (error) {
    // error message
    this.logger.error('[ Core.configure ] - Cannot load config. check your logs.');
    // reject with error message
    deferred.reject(error);
  }.bind(this));

  // default promise
  return deferred.promise;
};

/**
 * Check if all is ready before start stack
 *
 * @return {Boolean} true if all is ok false otherwise
 */
Core.prototype.isReady = function () {
  // dafault statement
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
  // is valid format ??
  if (_.isString(name) && !_.isEmpty(name) && !_.isUndefined(value) && !_.isNull(value)) {
    // add element on app instance
    this.app.getApp().set(name, value);

    // a debug message
    this.logger.debug([ '[ Core.addOnApp ] - Add property', name,
                       'with value :', utils.obj.inspect(_.omit(value, [
                       'logger', 'schema', 'schemaList' ]))
                      ].join(' '));
    // valid statement
    return true;
  }

  // warning message
  this.logger.warning([ '[ Core.addOnApp ] - Cannot add property', name,
                        'on current app. name must be a string and not empty.',
                        'value must be not undefined or null.' ].join(' '));
  // invalid & default statement
  return false;
};

/**
 * Default function to add an external middleware on app
 *
 * @param {Function} middleware default middleware to use on app
 * @return {Boolean} return true if all is ok falser otherwise
 */
Core.prototype.useOnApp = function (middleware) {
  // is a function ? and app is ready ?
  if (this.isReady() && _.isFunction(middleware)) {
    // add middleware on current app
    this.app.getApp().use(middleware);
    // valid statement
    return true;
  }
  // default statement
  return false;
};

/**
 * Start the main process of your own server
 *
 * @return {Object} default promise to catch
 */
Core.prototype.start = function () {
  // create async process here
  var deferred  = Q.defer();

  // default error mesage
  var message   = 'Cannot start app. Configure process seems to be not ready';

  // all is ready ?
  if (this.isReady()) {
    // saving some requirements
    var port = this.app.getApp().get('port');
    var host = this.app.getApp().get('host');
    var env  = this.app.getApp().get('env');

    // banner start
    this.logger.banner([ '[ Core.start ] - Starting app :',
                          this.app.getApp().get('app_name') ].join(' '));
    // checking port on localhost
    portScanner.checkPortStatus(port, '127.0.0.1', function (error, status) {
      // port is not used ?
      if (status === 'closed') {
        // let's go !! listen the current port
        this.app.getApp().listen(port, function () {
          this.logger.info([ '[ Core.start ] -', env.toUpperCase(),
                                'mode is enabled.' ].join(' '));
          this.logger.info([ '[ Core.start ] - starting app on',
                                [ '127.0.0.1', port ].join(':') ].join(' '));
          this.logger.info('[ Core.start ] - To Kill your server following these command :');
          this.logger.info('[ Core.start ] - No standalone usage : Press Ctrl-C to terminate');
          this.logger.info('[ Core.start ] - On standalone usage : kill your process');
          // resolve all is ok here
          deferred.resolve();
        }.bind(this));
      } else {
        // default message
        message = [ 'Cannot start your app. Port [', port,
                    '] is already in use on [', host, ']' ].join(' ');
        // error
        this.logger.error([ '[ Core.start ] -', message ].join(' '));
        // reject
        deferred.reject(message);
      }
    }.bind((this)));
  } else {
    // app is not ready
    this.logger.error([ '[ Core.start ] - ', message ].join(' '));
    // reject
    deferred.reject(message);
  }

  // default statement
  return deferred.promise;
};

// Default export
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    logger.warning('[ Core.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }

  // default statement
  return new (Core)(l);
};
