/**
 * Dependencies
 * @see : http://underscorejs.org/
 * @see : https://github.com/epeli/underscore.string
 * @see : https://www.npmjs.org/package/uuid 
 * @author :  Mathieu ROBERT <mathieu@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 */
 
var _         = require('underscore');
var _s        = require('underscore.string');
var config    = require('../../config/config');
var uuid      = require('uuid');
var logger    = require(config.yoctoModules('logger'));

// mixin underscore js ans underscore.string js to use the same namespace
_.mixin(_s.exports());

var renderController = function() {};

renderController.prototype.buildHeader = function() {
  
  var hData = { 
    appname : uuid.v4()
  };

  /**
   * Set the default app name
   */
  if (!(_.isUndefined(config.app))) {
    if (!(_.isUndefined(config.app.name))) {
      hData.appname = config.app.name;
    }      
  }
  
  if (!(_.isUndefined(config.render))) {
    var cRender = config.render;
    
    /**
     * Get Default charset
     */
    if (!(_.isUndefined(cRender.charset))) {
      hData = _.extend(hData, { charset : (cRender.charset || 'utf-8') });
    }

    /**
     * Get Default title
     */
    if (!(_.isUndefined(cRender.title))) {
      hData = _.extend(hData, { title : (cRender.title || '') });
    }

    /**
     * Get default language
     */
    if (!(_.isUndefined(cRender.language))) {
      hData = _.extend(hData, { language : (cRender.language || 'fr') });
    }

    var metaItem        = new Array();
    var cssHeaderItem   = new Array();
    var jsHeaderItem    = new Array();
    var httpEquivItem   = new Array();
    
    /**
      * Get Meta rules
      */
    if (!(_.isUndefined(cRender.meta))) {
      _.each(cRender.meta, function(item) {
        if (item.hasOwnProperty('name') && item.hasOwnProperty('value')) {
          metaItem.push(item);
        }
      });
    }
    
    /**
      * Get HTTP Equiv rules
      */
    if (!(_.isUndefined(cRender.httpEquiv))) {
      _.each(cRender.httpEquiv, function(item) {
        if (item.hasOwnProperty('name') && item.hasOwnProperty('value')) {
          httpEquivItem.push(item);
        }
      });
    }
    
    /**
     * Get assets to include into main header
     */
     
    if (!(_.isUndefined(cRender.assets))) {
      var assets =  cRender.assets;
      
      /**
       * Get default pictures directory
       */
      if (!(_.isUndefined(assets.pictures))) {
        hData = _.extend(hData, { pictures : (assets.pictures || '/') });
      } 
      
      /**
       * Get css to include into main header
       */
      if (!(_.isUndefined(assets.css))) {
        var css         =  assets.css;
        
        if (!(_.isUndefined(css.header)) && _.isArray(css.header)) {
          
          _.each(css.header, function(hCss) {
            if (hCss.hasOwnProperty('link') && hCss.hasOwnProperty('media') && (!(_.isEmpty(hCss.link))) && (!(_.isEmpty(hCss.media)))) {                
              cssHeaderItem.push(hCss);
            }
          });
        }                    
      }
      
      /**
       * Get js to include into main header
       */
      if (!(_.isUndefined(assets.js))) {
        var js          = assets.js;
        
        if (!(_.isUndefined(js.header)) && _.isArray(js.header)) {
          _.each(js.header, function(hJs) {
            jsHeaderItem.push(hJs);
          });
        }
      }
    } 

    hData = _.extend(hData, { metas     : metaItem });
    hData = _.extend(hData, { httpEquiv : httpEquivItem });      
    hData = _.extend(hData, { cssHeader : cssHeaderItem });
    hData = _.extend(hData, { jsHeader  : jsHeaderItem });
  }
  
  return hData;
};
  
renderController.prototype.buildFooter = function() {
  var hData = {};
  
  if (!(_.isUndefined(config.render))) {
    var cRender = config.render;
    
    var cssFooterItem   = new Array();
    var jsFooterItem    = new Array();
    
    /**
     * Get assets to include into main footer
     */
     
    if (!(_.isUndefined(cRender.assets))) {
      var assets =  cRender.assets;
      
      /**
       * Get css to include into main footer
       */
      if (!(_.isUndefined(assets.css))) {
        var css =  assets.css;
        
        if (!(_.isUndefined(css.footer)) && _.isArray(css.footer)) {
          _.each(css.footer, function(fCss) {
            if (fCss.hasOwnProperty('link') && fCss.hasOwnProperty('media') && (!(_.isEmpty(fCss.link))) && (!(_.isEmpty(fCss.media)))) {
              cssFooterItem.push(fCss);
            }
          });
        }
      }
      
      /**
       * Get js to include into main footer
       */
      if (!(_.isUndefined(assets.js))) {
        var js = assets.js;
        
        if (!(_.isUndefined(js.footer)) && _.isArray(js.footer)) {
          _.each(js.footer, function(fJs) {
            jsFooterItem.push(fJs);
          });
        }
      }
    } 

    hData = _.extend(hData, { cssFooter : cssFooterItem });
    hData = _.extend(hData, { jsFooter : jsFooterItem });
  }
  
  return hData;
}


/**
 * exports controller
 */
exports.renderController = new renderController();

/**
 * export Renderer function
 */
exports.render = function(template, req, res, next, param) {
  var ctrl = new renderController();
  var headerDefaultParam  = ctrl.buildHeader();
  var footerDefaultParam  = ctrl.buildFooter();
  var defaultParam        = _.extend(headerDefaultParam, footerDefaultParam);
  
  logger.debug(_.join(' ', 'Routing a', req.method.toUpperCase(), 'HTTP Request to', req.originalUrl));
  
  var params = _.extend(param, defaultParam);
  res.render(template, params);  
}

/**
 * export a renderer no cache function
 */
exports.renderNoCache = function(req, res, data) {
  logger.debug(_.join(' ', 'Routing a', req.method.toUpperCase(), 'HTTP Request to', req.originalUrl));
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  res.send(data).end();  
}
 