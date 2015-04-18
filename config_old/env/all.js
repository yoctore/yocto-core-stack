/**
 * Dependencies
 * @documentation : https://www.npmjs.org/package/path
 * @author :  Mathieu ROBERT <mathieu@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 */
var path = require('path');

/**
 * Setting up the current general constant
 */
var gSystem = {
  DEV_MODE              : 'development',
  PROD_MODE             : 'production',
  STAG_MODE             : 'staging',  
  SYSTEM_PORT           : process.env.NODE_PORT || 3000,
  ROOT_PATH             : path.normalize(__dirname + '/../..'),
  APP_NAME              : 'bazarmu',
}
 
/**
 * Setting up general constant to use in app
 */
var globals = {

  // General const
  ENV                   : (process.env.NODE_ENV = process.env.NODE_ENV || gSystem.DEV_MODE),
  PORT                  : gSystem.SYSTEM_PORT,
  DEV_MODE              : gSystem.DEV_MODE,
  PROD_MODE             : gSystem.PROD_MODE,
  STAG_MODE             : gSystem.STAG_MODE,  
  APP_NAME              : gSystem.APP_NAME,
  
  // MVC Directory path
  MODELS_DIRECTORY      : gSystem.ROOT_PATH + '/app/models',
  CONTROLLERS_DIRECTORY : gSystem.ROOT_PATH + '/app/controllers',
  VIEWS_DIRECTORY       : gSystem.ROOT_PATH + '/app/views',
  
  // Public Path
  PUBLIC_DIRECTORY      : gSystem.ROOT_PATH + '/public',

  // Assets Path
  ICONS_DIRECTORY        : gSystem.ROOT_PATH + '/public/icons',  
  // Default key for encryption
  ENCRYPT_KEY           : new Buffer('6e67ae372ad6d85cfad1abc366823e28', 'hex')
};

/**
 * Export the current data into main app module
 */
module.exports =  {
  constants : globals,
  yoctoModules : function(name) {
    return (gSystem.ROOT_PATH + '/yocto_modules/' + name + '/' + name);
  }
};
