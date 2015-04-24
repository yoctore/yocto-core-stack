'use-strict';

var confController = require('./ConfController.js');
var _              = require ('lodash');
var winston        = require('winston');

/**
 * Yocto Test config controller. Test the config controller oject
 *
 *
 * For more details on these dependencies read links below :
 * - Winston : https://github.com/flatiron/winston
 * - LodAsh : https://lodash.com/
 *
 *
 * @date : 24/04/2015
 * @author : Cédric BALARD <cedric@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 * @class ConfController
 */

var logger  = new (winston.Logger)( {
    transports : [
        new (winston.transports.Console)( {
            colorize : true
        }),
    ]
});


displayConf(confController.confFinal);

//Mofify parameters with the public method 'extendConf'
if ( confController.extendConf(   {
        'db' : {
            'port'     : "1000",
            'username' : 'Cédric'
        },
        'mailer' : {
            'toto' : 1000
        }

    })) {

        console.log("[+] success");
    }
    else {
        console.log("[-] fail");
    }


/**
* Display conf just for testing
* @param {[type]} array [description]
*/
function displayConf ( array ) {
    logger.info("|-----------------|");
    logger.info("|---DisplayConf---|");
    logger.info("|-----------------|");

    console.log(confController.config);


}
