'use-strict';
var logger      = require('yocto-logger');
var Joi         = require('joi');
var commonFile  = require('./config/common.json');
var _           = require('lodash');

var devFile  = require('./config/developpement.json');



var objA = {
    app : {
        name  : "toto"
    }
};
var objB = {
    db : {
        port     : "1000",
        username :100
    },
    mailer : {
        toto : 1000
    }
};



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
            redirect : Joi.object().keys({
                port    : Joi.number()
            }),
            subdomains  : Joi.boolean()
        }),
    }),
});

var result = Joi.validate(objB, schema, {
    abortEarly      : false ,
    allowUnknown    : true
});

console.log(result);

if ( (! _.isEmpty(result)) && (!_.isEmpty(result.error)) ) {

    logger.warning(result.error.details.length + ' error found when trying to load the new configuration');

    _.forEach(result.error.details, function(val)
    {
        logger.warning(  val.message + ' at ' + val.path );
    });
    return false;
}
else {
    logger.info(' no error found error found when trying to load the new configuration');
    return true;
}
