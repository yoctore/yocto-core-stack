/* yocto-core-stack - Core package for Yoctopus tools. - V1.1.0 */
"use strict";function Core(a){this.logger=a,this.config=require("yocto-config")(this.logger),this.render=require("yocto-render")(this.logger),this.router=require("yocto-router")(this.logger),this.app=require("yocto-express")(this.config,this.logger),this.wantedModules=["express","render","router"],this.state=!1}var portScanner=require("portscanner"),_=require("lodash"),logger=require("yocto-logger"),path=require("path"),fs=require("fs"),Q=require("q"),utils=require("yocto-utils"),joi=require("joi");Core.prototype.initialize=function(a){this.logger.banner("[ Core.initialize ] - Initializing Core Stack > Enable module validators.");var b=Q.defer(),c=joi.array().required().min(1).items(joi.string().required().empty());a=a||[],a.push(this.wantedModules),a=_.flatten(a);var d=joi.validate(a,c);return _.isNull(d.error)?this.config.autoEnableValidators(d.value)?(this.wantedModules=d.value,b.resolve(d.value)):b.reject("Cannot enable validators on config package."):b.reject(["Cannot enable validators. Errors occured during schema validation :",d.error].join(" ")),b.promise},Core.prototype.setConfigPath=function(a){this.logger.banner("[ Core.setConfigPath ] - Initializing Core Stack > Setting config path.");var b=Q.defer();if(_.isString(a)&&!_.isEmpty(a))path.isAbsolute(a)||(a=path.normalize([process.cwd(),a].join("/"))),fs.stat(a,function(c,d){var e="Invalid config path given.";c||(d.isDirectory()?this.config.setConfigPath(a)||(e="Cannot set config path. config refused value.",c=!0):(e="Invalid config path given.",c=!0)),c?(this.logger.error(["[ Core.setConfigPath ] -",e].join(" ")),b.reject(e)):(this.logger.info("[ Core.setConfigPath ] - Config path was correctly set."),b.resolve())}.bind(this));else{var c="Invalid config path given. Must be a string and not empty";this.logger.error(["[ Core.setConfigPath ] -",c].join(" ")),b.reject(c)}return b.promise},Core.prototype.configure=function(){this.logger.banner(["[ Core.configure ] - Initializing Core Stack >","Starting middleware configuration."].join(" "));var a=Q.defer();return this.config.load().then(function(b){this.render.updateConfig(b.render)?(this.logger.info(["[ Core.configure - Update render config succced.","Add reference on app ]"].join(" ")),this.addOnApp("render",this.render)&&this.addOnApp("logger",this.logger)?this.app.configureWithoutLoad(this.config,!0).then(function(){this.router.useApp(this.app.getApp()),this.router.setRoutes(b.router.routes)?this.router.setEndPoint(b.router.controllers)?this.router.configure()?(this.state=!0,a.resolve()):a.reject("Cannot process router configuration. Errors occured."):a.reject("Invalid path given for routes controllers."):a.reject("Invalid path given for routes.")}.bind(this))["catch"](function(b){a.reject(b)}):a.reject("Cannot continue. Cannot add render on app.")):a.reject("Cannot update render config. Cannot process configure.")}.bind(this))["catch"](function(b){this.logger.error("[ Core.configure ] - Cannot load config. check your logs."),a.reject(b)}.bind(this)),a.promise},Core.prototype.isReady=function(){return this.app.isReady()&&this.state},Core.prototype.addOnApp=function(a,b){return!_.isString(a)||_.isEmpty(a)||_.isUndefined(b)||_.isNull(b)?(this.logger.warning(["[ Core.addOnApp ] - Cannot add property",a,"on current app. name must be a string and not empty.","value must be not undefined or null."].join(" ")),!1):(this.app.getApp().set(a,b),this.logger.debug(["[ Core.addOnApp ] - Add property",a,"with value :",utils.obj.inspect(b)].join(" ")),!0)},Core.prototype.start=function(){var a=Q.defer(),b="Cannot start app. Configure process seems to be not ready";if(this.isReady()){var c=this.app.getApp().get("port"),d=this.app.getApp().get("host"),e=this.app.getApp().get("env");this.logger.banner(["[ Core.start ] - Starting app :",this.app.getApp().get("app_name")].join(" ")),portScanner.checkPortStatus(c,d,function(f,g){"closed"===g?this.app.getApp().listen(c,function(){this.logger.info(["[ Core.start ] -",e.toUpperCase(),"mode is enabled."].join(" ")),this.logger.info(["[ Core.start ] - starting app on",[d,c].join(":")].join(" ")),this.logger.info("[ Core.start ] - To Kill your server following these command :"),this.logger.info("[ Core.start ] - No standalone usage : Press Ctrl-C to terminate"),this.logger.info("[ Core.start ] - On standalone usage : kill your process"),a.resolve()}.bind(this)):(b=["Cannot start your app. Port [",c,"] is already in use on [",d,"]"].join(" "),this.logger.error(["[ Core.start ] -",b].join(" ")),a.reject(b))}.bind(this))}else this.logger.error(["[ Core.start ] - ",b].join(" ")),a.reject(b);return a.promise},module.exports=function(a){return(_.isUndefined(a)||_.isNull(a))&&(logger.warning("[ Core.constructor ] - Invalid logger given. Use internal logger"),a=logger),new Core(a)};