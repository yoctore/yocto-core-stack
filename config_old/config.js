/**
 * Dependencies
 * @documentation : https://lodash.com/
 * @see : https://www.npmjs.org/package/lodash
 * @author :  Mathieu ROBERT <mathieu@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 */
var lodash = require('lodash');

// combines the two objects
module.exports = lodash.assign(

  // load general config
  require (__dirname + '/env/all.js'),

  // load correct env config file
  require (__dirname + '/env/' + process.env.NODE_ENV + '.js')  || {}
);