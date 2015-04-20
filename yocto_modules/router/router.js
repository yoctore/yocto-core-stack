/**
 * Dependencies
 * @see : http://underscorejs.org/
 * @see : https://www.npmjs.org/package/path
 * @see : http://nodejs.org/api/fs.html
 * @see : http://nodejs.org/api/path.html
 * @see : https://github.com/epeli/underscore.string
 * @author :  Mathieu ROBERT <mathieu@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 */

var config  = require('../../config/config');
var logger  = require(config.yoctoModules('logger'));
var _       = require('underscore');
var path    = require('path');
var fs      = require('fs');
var _s      = require('underscore.string');

// mixin underscore js ans underscore.string js to use the same namespace
_.mixin(_s.exports());

var constants = config.constants;

var router = function() {};

 /**
  * Check route rules
  * @param (Object), default app
  * @param (Object), route rules
  */
router.prototype.check = function(app, route) {

   var rules = new Array({ 'property' : 'method', 'required' : true, 'rules' : 'get|post|delete|put'},
                         { 'property' : 'path', 'required' : true },
                         { 'property' : 'controller', 'required' : true, 'properties' : ['name', 'endpoint']}
                        );
   /**
    * Checking Property validity
    */
   return _.every(rules, function(item) {

      if (item.hasOwnProperty('property') && item.hasOwnProperty('required')) {
        var p   = item.property;
        var req = item.required;

        if (req) {
          if (!(route.hasOwnProperty(p)) || _.isEmpty(route[p])) {
            logger.warning(_.join(' ', 'Checking property failed. Property [', p, "] doesn't exists or is empty"));
            return false;
          }

          if (item.hasOwnProperty('rules')) {
            var rules = new RegExp(item.rules);

            if (!rules.test(route[p])) {
              logger.warning(_.join(' ', 'Checking rules property failed. Property [', p, '] set to [', route[p], "] doesn't match with [", item.rules, ']'));
              return false;
            }
          }

          if (item.hasOwnProperty('properties')) {
            var properties = item.properties;
            var cObj       = route[p];
            var controller;
            var controllerName;

            return _.every(properties, function(current) {
              if (!(cObj.hasOwnProperty(current)) || (!(_.isBoolean(cObj[current])) && _.isEmpty(cObj[current]))) {
                logger.warning(_.join(' ', 'Checking properties rules for [', p, '] failed.', 'Property [', current, "] doesn't exists or is empty"));
                return false;
              } else {

                if (p === 'controller') {

                  if (current === 'name') {
                    var pathname = path.normalize(constants.CONTROLLERS_DIRECTORY + '/' + cObj[current]);

                    logger.debug(_.join(' ', 'Checking up the current controller [', pathname, ']'));

                    if (!fs.existsSync(_.join('.', pathname, 'js'))) {
                      logger.warning(_.join(' ', 'Controller [', cObj[current], "] doesn't exist "));
                      return false;
                    }

                    controller = require(pathname);
                    controllerName = cObj[current];
                  }

                  if (current === 'endpoint') {
                    if (_.isUndefined(controller) || _.isUndefined(controllerName)) {
                      logger.warning('Invalid usage for controller config. your properties must be in this order : [name, endpoint]');
                      return false;
                    }

                    if (!(controller.hasOwnProperty(cObj[current])) || typeof(controller[(cObj[current])]) !== 'function') {
                      logger.warning('Invalid property [ ' + cObj[current] + ' ] for controller : [ ' + controllerName + ' ] => ' +  ' Property : [ ' + cObj[current] + ' ] is undefined or is not a function');
                      return false;
                    }
                  }
                }
            }

              return true;
            });
          }
        }
      }
      return true;
   });
 };

 /**
  * Add a route
  * @param (Object), the default app instance
  * @param (Object), route rules
  */
router.prototype.add = function(app, route) {
  logger.debug(_.join(' ', 'Adding route [', route.path, '] to a [',  (route.method).toUpperCase(),  '] HTTP method with a callback [',  _.join('.', route.controller.name, route.controller.endpoint), ']'));

  var cPath       = path.normalize(_.join('/', constants.CONTROLLERS_DIRECTORY, route.controller.name));
  var controller  = require(cPath);

  app[route.method](route.path, controller[route.controller.endpoint]);
}

/**
 * expose router
 */
module.exports = new router();
