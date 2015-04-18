/**
 * Dependencies
 * @see : http://underscorejs.org/
 * @see : http://epeli.github.io/underscore.string/
 * @author :  Mathieu ROBERT <mathieu@yocto.re>
 * @copyright : Yocto SAS, All right reserved 
 */

var config  = require('../../config/config');
var _       = require('underscore');
var _s      = require('underscore.string');
var logger  = require(config.yoctoModules('logger'));
var utils   = require(config.yoctoModules('utils'));

// mixin underscore and underscore.string to use the same scope
_.mixin(_s.exports());

/**
 * Default Db factory class
 */
var DbFactory = function() {};

/**
 * Default factory database object
 */
DbFactory.prototype.database        = {};
DbFactory.prototype.databaseLength  = 0;
DbFactory.prototype.currentModel;

/**
 * Default DbFactory type constants
 */
DbFactory.prototype.TYPE_AD                 = 'ad';
DbFactory.prototype.TYPE_CONSTANTS          = 'constants';
DbFactory.prototype.ERROR_TYPE              = 'error';
DbFactory.prototype.SUCCESS_TYPE            = 'success';
DbFactory.prototype.ASSOCIATE_METHOD        = 'associate';
DbFactory.prototype.INITIALIZE_METHOD       = 'initialize';
DbFactory.prototype.MAP_DATA_METHOD         = 'mapping';

/**
 * Default use Db function. Save Db Object into the current object
 */
DbFactory.prototype.useDb = function(database) {
  this.databaseLength = Object.keys(database).length;
  this.database       = database;
  
  logger.debug('Factory : all is ready');
  logger.debug(_.join(' ', 'Factory : contains [', this.databaseLength, ']', 'items.'));
  logger.debug(_.join(' ', 'Factory : items keys are [', Object.keys(this.database), ']'));
}

/**
 * Get How nb item factory use
 * @return (Integer), database item nb item
 */
DbFactory.prototype.getNbDbItem = function() {
  return this.databaseLength;
}

/**
 * Get default Models from rules
 * @param (String), cType, default model type to use
 * @param (String), type, needed type to use
 * @return (Sequelize Object), default table object
 */
DbFactory.prototype.getModels = function(cType, type) {
  var result    = {};
  var dbPrefix  = 'ad_'; 
  var $this     = this;  
  var cName     = type.toLowerCase();
  
  if (cType == this.TYPE_AD) {
    cName = _.join('', dbPrefix, type.toLowerCase()).toLowerCase();    
  }
  
  if (!(_.isUndefined(this.database)) && !(_.isNull(this.database))) {
    Object.keys(this.database).forEach(function(name) {
        if (cType == this.TYPE_AD) {
          if (_(name).startsWith(dbPrefix)) {
            if (name.toLowerCase() == cName) {
              $this.currentModel = cName;
              result = $this.database[cName];
            }
          }          
        } else {
          if (name.toLowerCase() == cName) {
            $this.currentModel = cName;
            result = $this.database[cName];
          }          
        }
    });  
  }
  
  return result;
}

/**
 * Get Ad Models from rules (Cf. BDD Schema)
 * @param (String), type, needed type to use
 * @return (Sequelize Object), default table object
 */
DbFactory.prototype.getAd = function(type) {
  var cDb = this.getModels(this.TYPE_AD, type);
  
  if (_.isEmpty(cDb)) {
    throw new Error(_.join(' ', 'Cannot get correct ad from type :', type));
  }
  
  return cDb;
}

/**
 * Get Logs from rules (Cf. BDD Schema)
 * @param (String), type, needed type to use
 * @return (Sequelize Object), default table object
 */
DbFactory.prototype.getLogs = function(type) {
  return this.getConstants(type);
}

/**
 * Get Constants from rules (Cf. BDD Schema)
 * @param (String), type, needed type to use
 * @return (Sequelize Object), default table object
 */
DbFactory.prototype.getConstants = function(type) {
  var cConstants = this.getModels(this.TYPE_CONSTANTS, type);
  
  if (_.isEmpty(cConstants)) {
    throw new Error(_.join(' ', 'Cannot get correct constant from type :', type));
  }  
  
  return cConstants;
}

/**
 * Get a status type from rules
 * @param (Boolean), true for success type of false for error type
 * @return (String), needed type
 */
DbFactory.prototype.getStatusType = function(success) {
  return (success ? this.SUCCESS_TYPE : this.ERROR_TYPE);
}

/**
 * Get default extra params for db
 * @return (Object), extra params
 */
DbFactory.prototype.getDefaultExtra = function() {
  return { status : this.ERROR_TYPE, msg : '', data : {} };
} 

/**
 * Build default extra params from two object
 * @param (Object), extra, default params
 * @param (Object), newExtra, default extra params
 * @return (Object) return object processed
 */
DbFactory.prototype.buildExtra = function(extra, newExtra) {
  
  var newExtra = _.extend(extra, newExtra)
  
  if ((_.has(newExtra, 'status') && _.has(newExtra, 'msg'))) {
    if (newExtra.status == this.ERROR_TYPE) {
      logger.error(newExtra.msg);
    }
  }
  
  return newExtra;
}

/**
 * Default function to process requirement for database
 * @param (Function), callback to use
 * @param (String), rules to select the correct method
 */
DbFactory.prototype.processRequirements = function(callback, crules) {
  var $this = this;

  if ((!_.isNull(crules)) && (!_.isEmpty(crules)) && (crules == this.ASSOCIATE_METHOD || crules == this.INITIALIZE_METHOD || crules == this.MAP_DATA_METHOD)) {
    if (!(_.isUndefined(this.database)) && !(_.isNull(this.database))) {
    
      logger.info(_.join(' ', 'Database :', crules, 'Object ... [STARTED]'));
      
      _.every(this.database, function(model, key) {
  
        if ((!_.isUndefined(model) && _.has(model, 'options'))) {
          if (_.has(model.options, 'classMethods')) {
            var rules       = new Array();          
            
            if (crules == $this.ASSOCIATE_METHOD) {
              var associate   = _.has(model.options.classMethods, $this.ASSOCIATE_METHOD);
          
              
              var assObj = {
                cname     : $this.ASSOCIATE_METHOD,
                cdb       : $this.database,
                ckey      : key,
                cfunc     : (associate ? model.options.classMethods[$this.ASSOCIATE_METHOD] : null),
                ccallback : callback,
                cstatus   : {
                  type : $this.ASSOCIATE_METHOD,
                  name : key
                }              
              };
              
              rules.push(assObj);              
            }

            if (crules == $this.INITIALIZE_METHOD) {
              var initialize  = _.has(model.options.classMethods, $this.INITIALIZE_METHOD);
              
              var initObj = {
                cname     : $this.INITIALIZE_METHOD,
                cdb       : $this.database,
                ckey      : key,
                cfunc     : (initialize ? model.options.classMethods[$this.INITIALIZE_METHOD] : null),
                ccallback : callback,
                cstatus   : {
                  type : $this.INITIALIZE_METHOD,
                  name : key
                }              
              };
              
              rules.push(initObj);
            }
            
            if (crules == $this.MAP_DATA_METHOD) {
              var map  = _.has(model.options.classMethods, $this.MAP_DATA_METHOD);
              
              var mapObj = {
                cname     : $this.MAP_DATA_METHOD,
                cdb       : $this.database,
                ckey      : key,
                cfunc     : (map ? model.options.classMethods.mapping : null),
                ccallback : callback,
                cstatus   : {
                  type : $this.MAP_DATA_METHOD,
                  name : key
                }              
              };
              
              rules.push(mapObj);              
            }      

            _.every(rules, function(item) {
              if (!_.isNull(item.cfunc)) {
                $this.processSubRequirement(item.cname, item.cdb, item.cfunc, item.ckey, item.ccallback, item.cstatus);              
              } else {
                logger.debug(_.join(' ', 'Model => [', item.ckey, ']', "doesn't contains", item.cname, "method. Updating status ..."));
                callback(item.cstatus);
              }
              return true;
            });
  
            return true;
          }
        }  
      });
    }     
  }
}

/**
 * Default method to process sub requirement of required database init
 * @param (String), method name
 * @param (Object), database object name
 * @param (Function), function to call
 * @param (String), model name
 * @param (Function), callback to use
 * @param (Object), Status object to use for app update
 */
DbFactory.prototype.processSubRequirement = function(methodName, db, method, key, callback, status) {
  logger.debug(_.join(' ', 'Model => [', key, ']', 'contains', methodName , 'method. Processing ...'));    
  
  if (methodName == this.ASSOCIATE_METHOD || methodName == this.MAP_DATA_METHOD) {
    method(db, callback, status);    
  }
  if (methodName == this.INITIALIZE_METHOD) {
    method(callback, status);    
  }
}

/**
 * Get Enum list of database model
 * @param (String), rules to use
 * @return (Array), results
 */
DbFactory.prototype.getEnumListFromRules = function(rules) {
  var $this  = this; 
  var crules = new Array();
  var result = new Array();
  
  if (_.isArray(rules)) {
    crules = rules;
  }
  if (_.isString(rules)) {
    crules.push(rules);
  }
  
  if (!(_.isUndefined(this.database)) && !(_.isNull(this.database)) && !_.isEmpty(crules)) {
    _.each(crules, function(rule) {
      Object.keys($this.database).forEach(function(name) {        
        if (name.toLowerCase() == rule.toLowerCase()) {
          var obj = $this.database[name];
          
          if ((!_.isUndefined(obj)) && _.has(obj, 'options')) {
            if (_.has(obj.options, 'classMethods')) {
              if (_.has(obj.options.classMethods, 'getEnumValues')) {
                result = obj.options.classMethods.getEnumValues($this, name.toLowerCase());
              }
            }
          }
        }
      });
    });
  }
  
  return result;
}

/**
 * Get List of filter from specific rules
 * @param (Mixed), for enum rules
 * @param (String), default filter rules to load
 * @return (Object), filters
 */
DbFactory.prototype.getFilterFromRules = function(aRules, fRules) {
  var filters = utils.loadFilterDbJson(fRules);
  var enums   = this.getEnumListFromRules(aRules);
  var $this   = this;
  
  if (_.has(filters, 'filter')) {
    var datas = filters.filter;   
    var flist = utils.loadFilterDbJson('list');
    
    if (!_.isEmpty(flist) && _.has(flist, 'list')) {
      flist = flist.list;
      
      for (var i = 0; i < datas.length; i++) {
        _.every(flist, function(list) {
          
          if (_.has(list, 'reference') && !_.isNull(list.reference) && _.has(list, 'values') && !_.isNull(list.values) && _.isArray(list.values)) {
            if (list.reference == datas[i].values) {
              
              // generate Date
              if (_.has(list, 'dynamic_date') && _.has(list, 'min') && _.has(list, 'max') && _.has(list, 'prefix_min') && _.has(list, 'prefix_max') && _.has(list, 'reverse')) {
                datas[i].values = utils.generateSearchDateList(list.min, list.max, list.prefix_min, list.prefix_max, list.reverse);
              } else {
                datas[i].values = list.values;
              }            
            }
          }
          
          return true;
        });
        
        if (_.has(datas[i], 'internal')) {
          _.every(enums, function(aenum) {
            if (datas[i].internal == aenum.key) {
              var assign = aenum.values;

              if (_.has(datas[i], 'exclude')) {
                if (_.isArray(datas[i].exclude)) {
                  datas[i].exclude = _.map(datas[i].exclude, function(s) {
                    return s.toLowerCase();
                  });
                                    
                  if (_.has(aenum, 'values')) {
                    assign = _.difference(aenum.values, datas[i].exclude);
                  }
                }
              }
              datas[i].values = assign;
              delete datas[i].interval;
            }
            
            return true;
          });
        }
      }             
    }
    
    filters.filter = datas;     
  }
  
  return filters;
}

/**
 * Get list of item for a part of form from specific rules
 * @param (Mixed), for enum rules
 * @param (String), default filter rules to load
 * @return (Object), filters
 */
DbFactory.prototype.getFormFromRules = function(aRules, fRules) { 
  
  var filters = utils.loadFormDbJson(fRules);
  var enums   = this.getEnumListFromRules(aRules);  
  var datas   = new Array();

  if (_.has(filters, 'items') && _.isArray(filters.items)) {
    _.each(filters.items, function(item) {
        datas.push(item);
        
        for (var i = 0; i < datas.length; i++) {
          if (_.has(datas[i], 'internal')) {
            _.every(enums, function(aenum) {
                                          
              if (datas[i].internal == aenum.key) {
                var exclude = false;
                // Exclude item form form rules
                if (_.has(datas[i], 'exclude')) {
                  if (_.isArray(datas[i].exclude)) {
                    datas[i].exclude = _.map(datas[i].exclude, function(s) {
                      return s.toLowerCase();
                    });
                                      
                    if (_.has(aenum, 'values')) {
                      datas[i].values = _.difference(aenum.values, datas[i].exclude);
                      exclude = true;
                    }
                  }
                }

                // re assign values
                if (_.has(datas[i], 'values')) {
                  delete datas[i].internal;         
                  datas[i].values = (!exclude ? aenum.values : datas[i].values);

                  return false;  
                }
              }
              return true;
            });
          }
                              
          if (_.has(datas[i], 'custom')) {
            if (datas[i].custom == 'date') {
              if (_.has(datas[i], 'max')) {
                var d = new Date();
                datas[i].max = d.getFullYear();
              }
            }
            
            if (datas[i].custom == 'job-category') {
              var flist = utils.loadFilterDbJson('list');
               
              if (!_.isEmpty(flist) && _.has(flist, 'list')) {
                flist = flist.list;
                
                _.every(flist, function(list) {
                 
                  if (_.has(list, 'reference') && !_.isNull(list.reference) && _.has(list, 'values') && !_.isNull(list.values) && _.isArray(list.values) && !_.isEmpty(list.values)) {
                    if (list.reference == datas[i].custom) {
                      datas[i].values = list.values;
                      return false;    
                    } 
                  }
                                  
                  return true; 
                }); 
              }
            }                        
          }
        }
    });
  }
  
  return datas;
}
/**
 * Get Default filter object to send
 * @param (String), the default label to use
 * @param (String), the default type to use
 * @param (String), the default name to use
 * @param (Array), the default values to use
 * @param (String), the default placeholder to use
 * @param (String), the default sql type  to use
 * @param (String), the default sql conditions to use 
 * @return (Object), the default filter object
 */
DbFactory.prototype.getDefaultFilterObject = function(label, type, name, values, placeholder, sqlType, sqlCondition) {
  var obj   = {};
  
  if (!_.isUndefined(type) && !_.isUndefined(name) && !_.isUndefined(values) && !_.isUndefined(placeholder) && !_.isUndefined(sqlType) && !_.isUndefined(sqlCondition)) {
    if (!_.isNull(type) && !_.isNull(name) && !_.isNull(values) && !_.isNull(placeholder) && !_.isNull(sqlType) && !_.isNull(sqlCondition)) {
      if (_.isString(type) && _.isString(name) && _.isArray(values) && _.isString(placeholder) && _.isString(sqlType) && _.isString(sqlCondition)) {
        if (!_.isEmpty(type) && !_.isEmpty(name) && !_.isEmpty(placeholder) && !_.isEmpty(sqlType) && !_.isEmpty(sqlCondition)) {      
          
          obj = {
            label       : label, 
            type        : type, 
            name        : name, 
            values      : values,
            placeholder : placeholder, 
            sql : {
              type  : sqlType,
              rules : sqlCondition        
            }
          }
        }
      }
    }
  }
    
  return _.extend({}, obj);
}

/**
 * Default function to build a custom message for validate call on model
 * @param (Object), e, current error from validate call
 * @param (String), correct message to string format
 */
DbFactory.prototype.buildValidationErrors = function(e) {
  var err = new Array();
  
  if (!_.isUndefined(e)) {
    if (_.has(e, 'errors')) {
      if (_.isArray(e.errors)) {
        if (e.errors.length == 1) {
          var error = _.first(e.errors);

          if (_.has(error, 'message')) {
             err.push(error.message); 
          }
        } else {
          _.each(e.errors, function(error) {
            if (_.has(error, 'message')) {
              err.push(error.message);
            }
          });
        }
      }
    }
  }
  
  return _.toSentence(err, ' | ', ' | ');
}

/**
 * Build correct where list for search
 * @param (Object), filter object to process
 * @return (Array), array of item to process
 */
DbFactory.prototype.buildWhereForQuery = function(filters) {
  var wheres    = new Array();
  var andKeys   = null;
  var andValues = new Array();
  var orKeys    = null;
  var orValues  = new Array();
  var keys      = null;
  var values    = new Array();  

  /**
   * Default function to clean words (html entities, space)
   * @param (Array), list of item
   * @return (Array), item clean
   */ 
  function cleanWords(values) {
    return _.map(values, function(citem) {
      // cleaning words / strip tags for html
      // already process on view process here to prevent data injection

      // default process single item internal function
      function cprocess(value) {
        value = _.clean(value);
        value = _.trim(value);        
        value = _(value).stripTags();
        
        // convert item to number type
        var nvalue = _.toNumber(value);

        // if is a valid number process it to number for sequelize, otherwise keep it to current type                        
        if (_.isNumber(nvalue) && !_.isNaN(nvalue)) {
          return nvalue;  
        } else {
          return value;
        }
      }
      
      // if array we need to loop 
      if (_.isArray(citem)) {
        _.each(citem, function(item, key) {
          item[key] = cprocess(item);
        })
      } else {
        citem = cprocess(citem);
      }

      // return
      return citem;
    });
  }

  /**
   * Clean Number format to correct format (10 000 <=> 10000, 3 Guests => 3, ect)
   * Remove all space and string on item. Check filtered list for more details
   * @param (Array), keys, lists of keys
   * @param (Array), values, lists of values
   * @return (Array), array of values processed
   */
  function cleanNumberRules(keys, values) {
    var itemToCleanForBdd = ['price', 'mileage', 'model_year', 'engine_size', 'nb_bedrooms', 'nb_guests', 'weekly_rent_price_min', 'weekly_rent_price_max']; 
    
    // parse items
    for (var i = 0; i < keys.length; i++) {
      var toProcess = keys[i];
      
      toProcess = toProcess.replace(/[\s<=>?]/g, '');

      // check if item is contains on
      if (_.contains(itemToCleanForBdd, toProcess)) {
        if (!_.isUndefined(values[i]) && !_.isNull(values[i]) && _.isString(values[i])) {
          values[i] = values[i].replace(/[\s\D]/g, '');
        }
      }
    }
    
    // return
    return values;      
  }

  // process and filter
  if (_.has(filters, 'and')) {
    if (_.has(filters.and, 'keys') && _.has(filters.and, 'values')) {
      if (_.isArray(filters.and.keys) && !_.isEmpty(filters.and.keys) && _.isArray(filters.and.values) && !_.isEmpty(filters.and.values)) {
        andKeys     =  _.toSentence(filters.and.keys, ' AND ', ' AND ');

        // clean item
        andValues   = cleanNumberRules(filters.and.keys, filters.and.values);        
        andValues   = cleanWords(andValues);

        // flatten item to transform array of array to an unique array @see underscore docs
        andValues   = _.flatten(andValues);
      }
    }
  }

  // process or filter
  if (_.has(filters, 'or')) {
    if (_.has(filters.or, 'keys') && _.has(filters.or, 'values')) {
      if (_.isArray(filters.or.keys) && !_.isEmpty(filters.or.keys) && _.isArray(filters.or.values) && !_.isEmpty(filters.or.values)) {
        orKeys    =  _.toSentence(filters.or.keys, ' OR ', ' OR ');
        orValues  = cleanWords(filters.or.values);
      }
    }
  }

  // Tricks for search filters
  // need to build query like ( ( block1 LIKE %value% AND block2 LIKE %value%) OR ( block1bis LIKE %value% AND block2bis LIKE %value%) )
  var kvalues = new Array();
  var fkeys   = null;

  if (_.has(filters, 'keywords')) {
    if (!_.isEmpty(filters.keywords)) {
      
      var kkwords = [];
      var kkeys   = [];
      
      var keywords = cleanWords([ filters.keywords ]);
      keywords = _.words(keywords);
      
      // build keywords rules with new search
      _.each(keywords, function(keyword) {
        // ignore little word ??? full search TEXT ??
        var pkword  = _.join('', '%', keyword, '%');
        var pattern = '(title_ad LIKE ? OR description LIKE ?)';
        
        kvalues.push(pkword);
        kvalues.push(pkword);
        kkeys.push(pattern);
      });
      
      kkeys = _.toSentence(kkeys, ' OR ', ' OR ')
      fkeys = _.join('', '(', kkeys, ')');
    }    
  }
  
  // build correct where list
  if (!_.isNull(orKeys) && !_.isNull(andKeys)) {
    keys = _.join(' ', orKeys, 'AND', andKeys);
    values.push(orValues);
    values.push(andValues);    
  } else {
    keys    = andKeys;
    values  = andValues;
  }

  // build keys 
  if (!_.isNull(keys) && !_.isEmpty(keys) && !_.isNull(fkeys) && !_.isEmpty(fkeys)) {
    keys = _.join(' ', keys, 'AND', fkeys);
    values.push(kvalues);        
  }

  // process return
  if (!_.isNull(keys) && !_.isNull(values)) {
    wheres.push(keys);
    wheres.push(values);
    wheres  = _.flatten(wheres);      
    return wheres;
  }

  return filters;
}

/**
 * Expose Db Factory
 */
module.exports = new DbFactory();         