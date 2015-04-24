'use-strict';

var path     = require('path');
var _        = require('lodash');
var winston  = require('winston');


 /**
   * IS the absoluth path of the project
   *
   * @property ROOT_PATH
   */
 var ROOT_PATH = path.normalize(__dirname + '/../..');

/**
  * Contains all parameters for system configuration
  *
  * @property allFile
  */
var allFile = require(path.join( ROOT_PATH , 'Test/testConfig/config/all.js'));

/**
  * Contains all parameters for common application configuration
  *
  * @property commonConfFile
  */
var commonConfFile = require(path.join( ROOT_PATH , 'Test/testConfig/config/common.json'));

/**
  * Contains all policies for checking new configuration
  *
  * @property policies
  */
var policies = require(path.join( ROOT_PATH , 'Test/testConfig/config/policies.json'));

/**
  * Object that permit to log information
  *
  * @property logger
  */
var logger  = new (winston.Logger)( {
    transports : [
        new (winston.transports.Console)( {
            colorize : true
        }),
    ]
});


/**
 * Yocto config controller. Manage your configuration in correlation with the NODE_ENV variable.
 *
 *
 *
 * For more details on these dependencies read links below :
 * - Winston : https://github.com/flatiron/winston
 * - LodAsh : https://lodash.com/
 * - path : https://nodejs.org/api/path.html
 *
 *
 * @date : 24/04/2015
 * @author : Cédric BALARD <cedric@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 * @class ConfController
 */
function ConfController() {
    //Save the context
    var context = this;

    /**
     * Create the main object that will contain all configuration
     *
     * @type {Object}
     */
    this.config = {};

    /**
    * Prepocess run process with the configuration file based on "process.env.NODE_ENV"
    *
    * @method preProcessConf
    * @param {String} mode type of configuration (Eg. 'developpement', 'staging', 'production')
    * @throw error config file
    */
    var preProcessConf = function() {
        try {
            var pathConf = path.join( ROOT_PATH , 'Test/testConfig/config', (process.env.NODE_ENV+'.json'));
            processConf(pathConf);
        } catch (e) {
            throw new Error ('Config file not found at : ' +  pathConf + '\n' +e );
        }
    };

    /**
    * Check if all new data is good with @function{checkDataIntegrity}
    * If it's okay, we merge the new data into commonFile.js
    *
    * @metho processConf
    * @param {[String]} path Path of file configuration
    */
    var processConf = function ( path ) {
        try {
            var file = require ( path );

            if ( context.checkDataIntegrity(file) ) {
                logger.info( '[+] data checking success');

                //Instanciate the main config
                context.config = _.merge( commonConfFile, file );

                // now importOject all.js and add it into 'config' in the subObject named 'sys'
                var sys = { 'sys' : allFile };
                _.assign( context.config, sys );
            }
            else  {
                logger.info( '[-] data checking fail' );
            }
        } catch (e) {
            throw new Error ( ' ProcessConf() error ' + e );
        }
    };

    /**
     * Read policies.json and compare all type with the given file
     *
     * @method checkDataIntegrity
     * @param {[type]} file [description]
     */
    this.checkDataIntegrity = function ( file ) {
        console.log('-------checkDataIntegrity-------');
        var listError = [];

        //Read each line in policies.json
        _.forEach(policies.policies, function (value, key) {
            var tab     = _.words(key, /[^, , \.]+/g) ;
            var fileTmp = file;

            //Get the value of the given object (eg. key)
            _.forEach( tab, function (val) {
                fileTmp = ( _.at(fileTmp, val ) );
                fileTmp = _.first(fileTmp);
            });

            //If is not undefined we check type of the new parameter
            if (! _.isUndefined(fileTmp) ) {
                listError.push( checkIfType(value, fileTmp, key ) );
            }
        });

        //remove all null value
        listError = _.compact(listError);

        if ( _.isEmpty(listError) ) {
            logger.info( 'all data is correct, we can merge data');
            return true;
        }
        else {
            logger.error( ' Error : ' + listError.length + ' parameter(s) isn\'t (aren\'t) conform \n' +
                          _(listError).join('\n')    );
            return false;
        }

    };

    /**
     * Check type of 'param' for a given type
     * @param {String} type        Desired type
     * @param {Object} param       The object to test
     * @param {Sting} paramString Name of the obejc to check
     * @return
     */
    var checkIfType =  function( type, param, paramString) {
        logger.info( 'Analyse type :', type ,', paramString :', paramString,'param : ', param);

        if( type == 'string') {
            if ( _.isString( param ) ) {
                return null;
            }
        }
        else if( type == 'boolean' ) {
            if ( _.isBoolean( param ) ) {
                return null;
            }
        }
        else if( type == 'number' ) {
            if ( _.isNumber( param ) ) {
                return null;
            }
            else if ( _.isString( param ) ) {
                if (! _.isNaN( _.parseInt(param) ) ) {
                    return null;
                }
            }
        }
        return paramString + ' : should be a ' + type ;
    };

    //Run all the process to create the object
    preProcessConf();
}

/**
 * Permit to update configuration dynamiclly
 *
 * @param {[type]} dataToExtend New parameters
 */
ConfController.prototype.extendConf = function( dataToExtend) {

    // Check if all data match with all policies
    if ( this.checkDataIntegrity(dataToExtend) ){
        _.merge( this.config, dataToExtend );
        return true;
    }
    return false;
};

/**
 * Export the ConfController
 */
module.exports = new (ConfController)();
