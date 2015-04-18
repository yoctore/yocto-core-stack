/**
 * Dependencies
 * @see : http://underscorejs.org/
 * @see : https://github.com/epeli/underscore.string
 * @see : http://nodejs.org/api/fs.html
 * @see : http://nodejs.org/api/path.html
 * @see :  http://nodejs.org/api/crypto.html
 * @see : http://aheckmann.github.io/gm/docs.html   
 * @author :  Mathieu ROBERT <mathieu@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 */
 
var config        = require('../../config/config'); 
var _             = require('underscore');
var _s            = require('underscore.string');
var path          = require('path');
var logger        = require(config.yoctoModules('logger'));
var fs            = require('fs');
var crypto        = require('crypto');
var gm            = require('gm');

// mixin underscore js ans underscore.string js to use the same namespace
_.mixin(_s.exports());

/**
 * Main Object
 */
var utils = function() {};

/**
 * Force a require file to be reload from root path of the app
 * @param (String), path, the current path to use
 */
utils.prototype.forceRelodRequire = function(path) {
  delete(require.cache[path]);
  return require(_.join('/', '../..', path, true));  
}

/**
 * Load a json file for db configuration 
 * @param (String), file, filename to use
 * @param (Boolean), filter, true if we need to use filter data, false otherwise
 * @return (Object), json reprensentation of file
 */
utils.prototype.loadDbJson = function(file, filter) {
  var json = {};
  
  try {
    file    = _.join('', file, '.json');
    
    if (!_.isUndefined(filter) && _.isString(filter)) {
      var p   = _.join('/', __dirname, '../../app/models/data', filter, file);
    } else {
      var p   = _.join('/', __dirname, '../../app/models/data', file);          
    }
    
    p       = path.normalize(p);
    json    = JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (e) {
      logger.error(_.join(' ', 'Cannot load JSON for file :', file, 'Error is : ', e.message));
  }
  
  return json;  
}

/**
 * Load a json file for filter type 
 * @param (String), file, filename to use
 * @return (Object), json reprensentation of file
 */
utils.prototype.loadFilterDbJson = function(file) {
  return this.loadDbJson(file, 'filter');
}

/**
 * Load a json file for filter type 
 * @param (String), file, filename to use
 * @return (Object), json reprensentation of file
 */
utils.prototype.loadFormDbJson = function(file) {
  return this.loadDbJson(file, 'form');
}

/**
 * Utility function. remove no needed property on a current object
 * @param (Array), items list of items
 * @param (Array), item to exclude
 */
utils.prototype.omitItems = function(items, exclude) {
  return _.difference(items, exclude);
}

/**
 * Return true if has no difference between source and compare list
 * @param (Array|Object), source list of item
 * @param (Array|Object), compate list of item 
 * @return (Boolean), true is no difference, false otherwise
 */
utils.prototype.allItemIsInList = function(source, compare) {
  if (!_.isUndefined(source) && !_.isUndefined(compare)) {
    if (!_.isArray(source) && _.isObject(source)) {
      source = Object.keys(source);
    }

    if (!_.isArray(compare) && _.isObject(compare)) {
      compare = Object.keys(compare);
    }

    if (_.isArray(source) && _.isArray(compare)) {      
      return _.isEmpty(this.omitItems(source, compare));
    }    
  }
  
  return false;
}

/**
 * Get the default mail template to build the correct template
 * @param (String), type, template type to use to retrive the current file
 * @param (Object), params, data to map with the template
 * @param (Boolean), encode, if true encode html chars
 * @return (String), current data to send
 */
utils.prototype.getEmailFullMessage = function(file, params, encode) {
  var p     = _.join('/', __dirname, '../../app/models/data/mail', file);
  
  try {
    p         = path.normalize(p);
    var data  = fs.readFileSync(p, 'utf-8');
    
    _.each(params, function(value, key) {
      var rules = _.join('', '#', key);
      var reg   = new RegExp(rules, 'g');
      data      = data.replace(reg, value);
    });

    return (encode) ? _.escapeHTML(data) : data;             
  } catch(e) {
      logger.error(_.join(' ', 'Cannot load mail template for type :', file, 'Error is : ', e.message));
  }
}

/**
 * Get the default mail config to process next step (building)
 * @param (String), type, template type to use to retrive the current file
 * @param (Object), params, data to map with the template
 * @return (Object), current config data
 */
utils.prototype.getEmailConfigByType = function(type, params) {
  var p     = _.join('/', __dirname, '../../app/models/data/mail/config.json');
  var obj   = [];
  
  try {
    p         = path.normalize(p);
    var data  = JSON.parse(fs.readFileSync(p, 'utf-8'));

    if (_.has(data, 'rules')) {
      var rules = data.rules;
      
      _.every(rules, function(rule) {
        if (_.has(rule, 'type') && _.has(rule, 'title') && _.has(rule, 'template')) {
          if (!_.isEmpty(rule.type) && rule.type == type) {
            obj.push(rule);
            return false
          }
        }
        
        return true;
      });
    }
    
    return obj;    
  } catch(e) {
    logger.error(_.join(' ', 'Cannot load mail config for type :', type, 'Error is : ', e.message));
  }
}

/**
 * Build notify object to send to DAO model
 * @param (Object), factory to use
 * @param (String), type to use
 * @param (String), subject to replace on original subject
 * @param (Object), params to assign on template
 * @return (Object), data to insert
 */
utils.prototype.buildNotify = function(factory, ctype, csubject, params) {
  // process contact on notify queue here
  // check is params is valid
  var notify    = factory.getLogs('notify_queue');
  var subject   = '';
  var template  = '';    
  var obj       = {};
  
  var config  = this.getEmailConfigByType(ctype, params, false);
  // check required
  if (!_.isUndefined(factory) && !_.isUndefined(ctype) && !_.isUndefined(csubject) && !_.isUndefined(params)) {
    if (!_.isEmpty(ctype)) {
      _.every(config, function(item) { 
        if (_.has(item, 'type') && _.has(item, 'title') && _.has(item, 'template')) {
          if (item.type.toLowerCase() == ctype.toLowerCase()) {
            subject   = item.title;
            template  = item.template;
            
            // replace string
            if (_.isString(csubject)) {              
              subject = subject.replace('#subject', csubject);
            }
            
            // replace multiple item
            if (_.isArray(csubject) || _.isObject(csubject)) {
              _.each(csubject, function(item, key) {
                subject = subject.replace(_.join('#', '', key), item);
              });
            }
                          
            return false;
          }
        }
        return true;
      });
    }        
  }
  
  // check subject
  if (!_.isEmpty(subject) && !_.isEmpty(template)) {
    var message = this.getEmailFullMessage(template, params, false);
                
    // not empty so run save notify
    if (!_.isEmpty(message)) {
      obj = { 
        subject       : subject,
        mail_to       : params.email,
        full_message  : message,
        type          : ctype
      };

      if (_.has(params, 'reference')) {
        _.extend(obj, { ad_reference :  params.reference });
      }

      if (_.has(params, 'ad_link')) {
        _.extend(obj, { ad_link :  params.ad_link });
      }
    } else {
      logger.error('Cannot build object for notify saving. message is empty');      
    }
  } else {
    logger.error('Cannot build object for notify saving. subject or template file is missing');
  }
  
  return obj;  
}



/**
 * Return a password from two rules
 * @param (Integer), n, password length
 * @param (String), a, chars to use 
 */
utils.prototype.randomizedPassword = function(n, a) {
  
  if (_.isUndefined(a) || _.isEmpty(a) || _.isNull(a)) {
    a = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890&(!-_%<>';
  }
  
  var index = (Math.random() * (a.length - 1)).toFixed(0);
  return n > 0 ? a[index] + this.randomizedPassword(n - 1, a) : '';
}

/**
 * Utility function to encrypt data
 * @param (String), key, key to use for encryption
 * @param (Mixed), data, data to encrypt
 * @return (String), crypted data
 */
utils.prototype.encrypt = function(key, data) {
  data = JSON.stringify(data);

  var cipher  = crypto.createCipher('aes256', key);
  var crypted = cipher.update(data, 'utf-8', 'hex');
  crypted     += cipher.final('hex');
  
  return crypted;
}

/**
 * Utility function to decrypt data
 * @param (String), key, key to use for encryption
 * @param (Mixed), data, data to encrypt
 * @return (String), decrypted data 
 */
utils.prototype.decrypt = function(key, data) {
  var decipher  = crypto.createDecipher('aes256', key);
  var decrypted = decipher.update(data, 'hex', 'utf-8');
  decrypted     += decipher.final('utf-8');

  return JSON.parse(decrypted);
}

/**
 * Utility function to build date list for search view
 * @param (Integer), min, start value
 * @param (Integer), max, end value
 * @param (String), prefixMin, prefix to use on min value
 * @param (String), prefixMax, prefix to use on max value
 * @param (Boolean), reverse, true if we need to reverse array
 * @return (Array), list of date
 */
utils.prototype.generateSearchDateList = function(min, max, prefixMin, prefixMax, reverse) {
  var list  = [];
  var date  = new Date();

  // init with default value to prevent infinite loop   
  max       = max || date.getFullYear();
  min       = min || 0;

  // process number
  for(var i = min; i <= max; i++) {
    list.push(i.toString());
  }

  // check is prefix is needed on list  
  if (!_.isNull(prefixMin) && !_.isEmpty(prefixMin)) {
    list[0] = _.join(' ', prefixMin, list[0]);
  } 
  
  // check is prefix is needed on list
  if (!_.isNull(prefixMax) && !_.isEmpty(prefixMax)) {
    list[list.length - 1] = _.join(' ', prefixMax, list[list.length - 1]);
  } 

  // reverse if needed
  if (!_.isNull(reverse) && reverse) {
    list = list.reverse();
  }
  
  return list;
}

/**
 * Return the correct host from a request header.
 * Implement x-forwarded data
 * @param (Object), HTTP request object 
 */
utils.prototype.getCorrectHost = function(request) {
  if (!_.isUndefined(request)) {
    return _.join('://', request.protocol, request.get('x-forwarded-host') || request.get('x-forwarded-server') || request.get('host') || 'localhost'); 
  }
  
  return null;
}

/**
 * Check if is an allowed image type format
 * @param (String), type to check
 * @return (Boolean), true if is correct false otherwise
 */
utils.prototype.isValidImageFormat = function(type) {
  type = _.join('|', '', type.toLowerCase(), '');
  return '|jpg|png|jpeg|gif|'.indexOf(type) !== -1;
}

/**
 * Process image and fit it from rules
 * @param (String), path, current path to use
 * @param (Integer), maxWidth, current maxWidth to use
 * @param (Integer), maxHeight, current maxHeight to use
 * @param (Integer), quality, current quality to use     
 */
utils.prototype.fitUploadedFile = function(path, maxWidth, maxHeight, quality) {
  // assign path
  var currentFile = path;

  // prevent null value and set up default value
  maxWidth    = maxWidth  || 670;
  maxHeight   = maxHeight || 470;
  quality     = quality   || 60;

  var $this = this;
  // get format 
  gm(path).format(function(err, value) {
    if (!err && !_.isUndefined(value)) {

      // check if is valid type before
      if ($this.isValidImageFormat(value)) {  
        // process
        gm(currentFile).size(function(err, size) {
          if (!err) {
            if (size.width > maxWidth || size.height > maxHeight) {
              gm(currentFile)
              .geometry(maxWidth, maxHeight, '>')
              .quality(quality)
              .write(path, function (err) {
                if (!err) {
                  logger.debug(_.join(' ', 'Fit image is success for path :', path));
                } else {
                  logger.debug(_.join(' ', 'Fit image is failed for path :', path, 'error is :', err));
                }
              });
            } else {
              logger.debug(_.join(' ', 'Fit image is not necessary for path :', path));
            }
          }
        });
      } else {
        logger.error(_.join(' ', 'Invalid format for fit image on path :', path));            
      }
    } else {
      logger.error(_.join(' ', 'Retrieve format on current image failed for path :', path, 'error is :', err));
    }
  });
}

/**
 * Expose Utils
 */
module.exports  = new utils();
