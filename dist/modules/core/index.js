/* yocto-core-stack - Core package for Yoctopus tools. - V3.0.1 */

"use strict";var portScanner=require("portscanner"),_=require("lodash"),logger=require("yocto-logger"),path=require("path"),fs=require("fs"),Q=require("q"),utils=require("yocto-utils"),joi=require("joi");function Core(e){this.logger=e,this.config=require("yocto-config")(this.logger),this.render=require("yocto-render")(this.logger),this.router=require("yocto-router")(this.logger),this.app=require("yocto-express")(this.config,this.logger),this.wantedModules=["express","render","router"],this.state=!1}Core.prototype.initialize=function(e){this.logger.banner("[ Core.initialize ] - Initializing Core Stack > Enable module validators.");var t=Q.defer(),r=joi.array().required().min(1).items(joi.string().required().empty());(e=e||[]).push(this.wantedModules),e=_.flatten(e);var o=joi.validate(e,r);return _.isNull(o.error)?this.config.autoEnableValidators(o.value)?(this.wantedModules=o.value,t.resolve(o.value)):t.reject("Cannot enable validators on config package."):t.reject(["Cannot enable validators. Errors occured during schema validation :",o.error].join(" ")),t.promise},Core.prototype.setConfigPath=function(e){this.logger.banner("[ Core.setConfigPath ] - Initializing Core Stack > Setting config path.");var t=Q.defer();if(_.isString(e)&&!_.isEmpty(e))path.isAbsolute(e)||(e=path.normalize([process.cwd(),e].join("/"))),fs.stat(e,function(r,o){var i="Invalid config path given.";r||(o.isDirectory()?this.config.setConfigPath(e)||(i="Cannot set config path. config refused value.",r=!0):(i="Invalid config path given.",r=!0)),r?(this.logger.error(["[ Core.setConfigPath ] -",i].join(" ")),t.reject(i)):(this.logger.info("[ Core.setConfigPath ] - Config path was correctly set."),t.resolve())}.bind(this));else{var r="Invalid config path given. Must be a string and not empty";this.logger.error(["[ Core.setConfigPath ] -",r].join(" ")),t.reject(r)}return t.promise},Core.prototype.configure=function(){this.logger.banner(["[ Core.configure ] - Initializing Core Stack >","Starting middleware configuration."].join(" "));var e=Q.defer();return this.config.load().then(function(t){this.render.updateConfig(t.render)?(this.logger.info(["[ Core.configure - Update render config succced.","Add reference on app ]"].join(" ")),this.addOnApp("render",this.render)&&this.addOnApp("logger",this.logger)&&this.addOnApp("config",this.config)?this.app.configureWithoutLoad(this.config,!0).then(function(){this.router.useApp(this.app.getApp()),this.router.setRoutes(t.router.routes)?this.router.setEndPoint(t.router.controllers)?this.router.configure()?(this.state=!0,e.resolve()):e.reject("Cannot process router configuration. Errors occured."):e.reject("Invalid path given for routes controllers."):e.reject("Invalid path given for routes.")}.bind(this)).catch(function(t){e.reject(t)}):e.reject("Cannot continue. Cannot add render on app.")):e.reject("Cannot update render config. Cannot process configure.")}.bind(this)).catch(function(t){this.logger.error("[ Core.configure ] - Cannot load config. check your logs."),e.reject(t)}.bind(this)),e.promise},Core.prototype.isReady=function(){return this.app.isReady()&&this.state},Core.prototype.addOnApp=function(e,t){return!_.isString(e)||_.isEmpty(e)||_.isUndefined(t)||_.isNull(t)?(this.logger.warning(["[ Core.addOnApp ] - Cannot add property",e,"on current app. name must be a string and not empty.","value must be not undefined or null."].join(" ")),!1):(this.app.getApp().set(e,t),this.logger.debug(["[ Core.addOnApp ] - Add property",e,"with value :",utils.obj.inspect(_.omit(t,["logger","schema","schemaList"]))].join(" ")),!0)},Core.prototype.useOnApp=function(e){return!(!this.isReady()||!_.isFunction(e))&&(this.app.getApp().use(e),!0)},Core.prototype.isMultipleInstances=function(){return _.has(process.env,"instances")&&_.has(process.env,"NODE_APP_INSTANCE")},Core.prototype.start=function(){var e=Q.defer(),t="Cannot start app. Configure process seems to be not ready";if(this.isReady()){var r=this.app.getApp().get("port"),o=this.app.getApp().get("host"),i=this.app.getApp().get("env");this.logger.banner(["[ Core.start ] - Starting app :",this.app.getApp().get("app_name")].join(" ")),portScanner.checkPortStatus(r,o,function(n,s){this.isMultipleInstances()||"closed"===s?(this.isMultipleInstances()&&this.logger.info(["[ Core.start ] - Application [",this.app.getApp().get("app_name"),"] start on cluster mode with [",process.env.instances||0,"] instances. Current instance is [",process.env.NODE_APP_INSTANCE||0,"]"].join(" ")),this.app.getApp().listen(r,function(){this.logger.info(["[ Core.start ] -",i.toUpperCase(),"mode is enabled."].join(" ")),this.logger.info(["[ Core.start ] - starting app on",["127.0.0.1",r].join(":")].join(" ")),this.logger.info("[ Core.start ] - To Kill your server following these command :"),this.logger.info("[ Core.start ] - No standalone usage : Press Ctrl-C to terminate"),this.logger.info("[ Core.start ] - On standalone usage : kill your process"),e.resolve()}.bind(this))):(t=["Cannot start your app. Port [",r,"] is already in use on [",o,"]"].join(" "),this.logger.error(["[ Core.start ] -",t].join(" ")),e.reject(t))}.bind(this))}else this.logger.error(["[ Core.start ] - ",t].join(" ")),e.reject(t);return e.promise},module.exports=function(e){return(_.isUndefined(e)||_.isNull(e))&&(logger.warning("[ Core.constructor ] - Invalid logger given. Use internal logger"),e=logger),new Core(e)};