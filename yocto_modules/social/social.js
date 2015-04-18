/**
 * Dependencies
 * @see : http://underscorejs.org/
 * @see : https://github.com/epeli/underscore.string
 * @see : http://nodejs.org/api/path.html
 * @see : https://www.npmjs.com/package/glob  
 * @author :  Mathieu ROBERT <mathieu@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 */
 
var config        = require('../../config/config'); 
var _             = require('underscore');
var _s            = require('underscore.string');
var logger        = require(config.yoctoModules('logger'));
var db            = require('../../config/database');
var glob          = require('glob');
var path          = require('path');

// mixin underscore js ans underscore.string js to use the same namespace
_.mixin(_s.exports());

/**
 * Main Object
 */
var social = function() {};

/**
 * Default social function to generate content dynamicly for facebook share
 * @param (String), url to share and to use for build content
 * @param (Function), callback to for default response
 */
social.prototype.generateFacebookShare = function(host, url, callback) {
  var allPart   = _.words(url, '/');
  var item      = _.last(allPart);
  var itemPart  = _.words(item, '.');
  var ext       = _.last(itemPart);
  var endUrl    = _.first(itemPart);
  var items     = _.words(endUrl, '-');
  items         = items.splice(1, 2);
  
  // extract needed data
  var reference = _.first(items);
  var category  = _.last(items);
  
  // get ad
  var ad = db.factory.getAd('standard');
  
  // get by reference
  ad.getByReference(db.factory, reference, function(data) {
    data          = _.first(JSON.parse(JSON.stringify(data.data)));
    var facebook  = [];
    var title     = null;
    
    // add title
    if (_.has(data, 'title_ad') && !_.isEmpty(data.title_ad)) {
      title = data.title_ad;
      facebook.push({ key : 'og:title', value : data.title_ad });
    }

    // add description
    if (_.has(data, 'description') && !_.isEmpty(data.description)) {
      facebook.push({ key : 'og:description', value : data.description });
    }

    // process pictures
    if (_.has(data, 'reference') && !_.isNull(data.reference) && !_.isEmpty(data.reference)) {
      var reference    = data.reference;
      var webMediaPath = _.join('/', 'media/ad', reference);
      var picturesPath = path.normalize(_.join('/', __dirname, '../../public', webMediaPath));
      var pictures     = [];

      // parse rules
      glob('*.*' , {
        cwd       : picturesPath,
        nosort    : false
      }, function (error, matches) {
        // parse all pictures
        _.each(matches, function (pitem) {
          // get the first item
          if (pitem.indexOf('-0.') >= 0) {
            pitem = _.join('/', host, webMediaPath, pitem);
            facebook.push({ key : 'og:image', value : pitem });
          }
        });
        
        // call callback
        callback({ title : title, facebook : facebook });
      });      
    } else {
      callback({});
    }
  }, {});  
}

/**
 * Default social function to generate content dynamicly for facebook share normal share
 * @param (String), url to share and to use for build content
 * @param (Function), callback to for default response
 */
social.prototype.generateDefaultShare = function(host, url, callback, type) {
  var constants = null;
  var title     = "";
  
  // check type and assign constants
  if (type == 'facebook') {
    if (_.has(config.app, 'social')) {
      if (_.has(config.app.social, 'facebook')) {
        constants = config.app.social.facebook;        
      }
    }
  }
  
  // is null ?
  if (!_.isNull(constants) && !_.isUndefined(constants) && !_.isEmpty(constants)) {    
    var data = [];
    _.each(constants, function(item, key) {
      
      // if image prefix it
      if (key == 'image') {
        item = _.join('/', host, item); 
      }
      
      // if a specific title was set
      if (key == 'title') {
        title = item;
      }
      
      data.push({ key : _.join(':', 'og', key), value : item });
    });
    
    callback({ title : title, facebook : data });
  }
}

/**
 * Expose Utils
 */
module.exports  = new social();
