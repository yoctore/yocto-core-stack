'use-strict';

var path     = require('path');
var _        = require('lodash');
var logger   = require('yocto-logger');
var Joi      = require('joi');

 /**
   * Is the absoluth path of the project
   *
   * @property ROOT_PATH
   * @type String
   */
 var ROOT_PATH = path.normalize(__dirname + '/../..');



/**
 * Yocto config controller. <br/>
 * Manage your configuration in correlation with the NODE_ENV variable.
 *
 * For more details on these dependencies read links below :
 * - yocto-logger : lab.yocto.digital:yocto-node-modules/yocto-logger.git
 * - LodAsh : https://lodash.com/
 * - path : https://nodejs.org/api/path.html
 * - Joi : https://github.com/hapijs/joi
 *
 *
 * @date : 24/04/2015
 * @author : Cédric BALARD <cedric@yocto.re>
 * @copyright : Yocto SAS, All right reserved
 * @class ConfController
 */
function ConfController() {

    /**
      * Save the context for constructor
      *
      * @property context
      * @type Object
      */
     var context = this;

    /**
      * Contains all parameters for system configuration
      *
      * @property allFile
      * @type Object
      */
      this.allFile = require(path.join( ROOT_PATH , 'Test/testConfig/config/all.js'));


    /**
      * Contains all parameters for common application configuration
      *
      * @property commonConfFile
      * @type Object
      */
    this.commonConfFile = require(path.join( ROOT_PATH , 'Test/testConfig/config/common.json'));

    /**
     * Create the main object that will contain all final configuration
     *
     * @property {Object} config
     */
    this.config = {};

    /**
    * Prepocess run process with the configuration file based on "process.env.NODE_ENV"
    *
    * @method preProcessConf
    * @throw error config file
    */
    var preProcessConf = function() {
        try {
            //Construct path of the configuration file
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
    * @method processConf
    * @param {String} path Path of the Json configuration file
    */
    var processConf = function ( path ) {
        try {
            //load json file (<environement>.json and all.json)
            var file = require ( path );

            //Check if data is conform
            if ( context.checkDataIntegrity(file) ) {
                logger.info( '[+] data checking success, configuration change');

                //Instanciate the main config
                context.config = _.merge( this.commonConfFile, file );

                // now importOject all.js and add it into 'config' in the subObject named 'sys'
                var sys = { 'sys' : this.allFile };
                _.assign( context.config, sys );
            }
            else  {
                logger.info( '[-] data checking fail, configuration don\'t change' );
            }
        } catch (e) {
            throw new Error ( ' ProcessConf() error ' + e );
        }
    };


    /**
     * Read policies.json and compare all type with the given file
     *
     * @method checkDataIntegrity
     * @param {Object} dataToExtend JSon file of node environement
     * @return {Boolean} true if all data as the good type, false otherwise
     */
    this.checkDataIntegrity = function ( dataToExtend ) {

        // define all rules for verification
        var schema = Joi.object().min(1).keys({
            app : Joi.object().keys({
                name            : Joi.string(),
                adminTimeOut    : Joi.number()
            }),
            db  : Joi.object().keys({
                name        : Joi.string(),
                username    : Joi.string(),
                host        : Joi.string(),
                port        : Joi.number()
            }),
            mailer : Joi.object().keys({
                adminAddress    : Joi.string(),
                host            : Joi.string(),
                port            : Joi.number()
            }),
            express : Joi.object().keys({
                vhost : Joi.object().keys({
                    http : Joi.object().keys({
                        redirect : Joi.object().keys({
                            port    : Joi.number()
                        }),
                    }),
                    subdomains  : Joi.boolean()
                }),
            }),
        });

        //run the process of joi validation
        var result = Joi.validate(dataToExtend, schema, {
            abortEarly      : false ,
            allowUnknown    : true
        });

        //check if have error on validating
        if ( (! _.isEmpty(result)) && (!_.isEmpty(result.error)) ) {
            logger.warning(result.error.details.length + ' error found when trying to load the new configuration');

            //Log each error
            _.forEach(result.error.details, function(val)
            {
                logger.warning(  val.message + ' at ' + val.path );
            });
            return false;
        }
        else {
            logger.info(' no error found when trying to load the new configuration');
            return true;
        }
    };

    //Run all the process to create the object
    preProcessConf();
}

/**
 * Permit to update configuration dynamiclly
 *
 * @method extendConf
 * @param {Object} dataToExtend New parameters to modify
 * @return {Boolean} true if configuration has changed, and false otherwise
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
