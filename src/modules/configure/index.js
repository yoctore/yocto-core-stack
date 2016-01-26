'use strict';

var Q     = require('q');
var joi   = require('joi');
var _     = require('lodash');

/**
 * Default configure method for core stack
 *
 * @class Configure
 */
function Configure () {
  /**
   * Default rules populate by init method
   *
   * @property rules
   * @type {Object}
   * @default {}
   */
  this.rules = {};
}

/**
 * Default init method
 *
 * @param {Object} value default object value to validate
 * @return {Boolean} true if all is ok false otherwise
 */
Configure.prototype.init = function (value) {
  // create Async process
  var deferred = Q.defer();

  // default repeat item
  var repeat = {
    logger  : joi.object().keys({
      level   : joi.string().default('debug').allow([ 'debug', 'versobe', 'warning',
                                                    'error', 'info'
                                                  ]),
      rotate  : joi.object().keys({
        path    : joi.string().required().empty(),
        name    : joi.string().required().empty()
      }).default({ enable : false, path : '' }).allow([ 'path', 'name' ])
    }).allow([ 'level', 'rotate' ]).default({ level : 'debug' })
  };

  // default scheme
  var schema = joi.object().keys({
    modules : joi.array().items(joi.string().required().empty()).default([]),
    config  : joi.string().required().empty(),
    env     : joi.object().keys({
      development : joi.object().required().keys(repeat),
      staging     : joi.object().required().keys(repeat),
      production  : joi.object().required().keys(repeat)
    }).allow([ 'development', 'staging', 'production' ])
  }).allow([ 'modules', 'config', 'env' ]);

  // try to validate
  var validate = joi.validate(value, schema);

  // has error ?
  if (_.isNull(validate.error)) {
    // saved rules
    this.rules = validate.value;

    // resolve with current object
    deferred.resolve(validate.value);
  } else {
    // reject with error
    deferred.reject(validate.error);
  }

  // default statement
  return deferred.promise;
};

// Default export
module.exports = new (Configure)();
