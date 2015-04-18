/**
 * Dependencies
 * @documentation : http://sequelizejs.com/
 * @see : https://www.npmjs.org/package/path
 * @see : https://www.npmjs.org/package/lodash
 * @copyright : Yocto SAS, All right reserved
 */
 
var config      = require('./config');
var path        = require('path');
var logger      = require(config.yoctoModules('logger'));
var _           = require('underscore');
var _s          = require('underscore.string'); 
var fs          = require('fs');
var dbFactory   = require(config.yoctoModules('dbfactory'));

var constants   = config.constants;
var db          = {};

//var factory     = require(config.yoctoModules('factory'));

// mixin underscore js ans underscore.string js to use the same namespace
_.mixin(_s.exports());

/**
 * Create Db Object
 */
var Sequelize = require('sequelize')
  , sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, {
    dialect               : config.db.type,
    port                  : config.db.port,
    host                  : config.db.host,
    charset               : config.db.charset,
    collate               : config.db.collate,
    logging               : ((config.db.logging) ? console.log : config.db.logging),
    syncOnAssociation     : config.db.syncOnAssociation,
    maxConcurrentQueries  : config.db.maxConcurrentQueries,         
    pool                  : {
      minConnections  : config.db.poolMinConnections,
      maxConnections  : config.db.poolMaxConnections,
      maxIdleTime     : config.db.poolMaxIdleTime      
    },
    timezone : config.db.timezone         
  });

logger.banner('Initializing Database ...');
logger.info('Database : Loading Object ... [STARTING]');

fs.readdirSync(constants.MODELS_DIRECTORY)
  .filter(function(file) {
    return ((file.indexOf('.') !== 0) && (file != 'index.js') && (file.slice(-3) == '.js'));
  })
  .forEach(function(file) {
    logger.debug(_.join(' ', 'Loading model =>', file));
    var model       = sequelize.import(path.join(constants.MODELS_DIRECTORY, file));
    db[model.name]  = model;
  });

logger.info('Database : Loading Object ... [COMPLETE]');

logger.info('Database : Initializing and Building Factory ... [STARTING]');
dbFactory.useDb(db);
logger.info('Database : Initializing and Building Factory ... [COMPLETE]');

/**
 * Export the current data into main app module
 */
module.exports = {
  instance  : sequelize,
  require   : Sequelize,
  factory   : dbFactory 
};