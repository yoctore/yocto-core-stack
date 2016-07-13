/* yocto-core-stack - Core package for Yoctopus tools. - V1.3.5 */
"use strict";function CoreWrapper(){this.debug=!1,this.logger=logger,this.core={},this.modules=[],this.configPath="",this.env=process.env.NODE_ENV||"development"}var logger=require("yocto-logger"),configure=require("./modules/configure"),core=require("./modules/core"),Q=require("q"),path=require("path"),fs=require("fs"),_=require("lodash");CoreWrapper.prototype.init=function(){var a=Q.defer(),b=this;try{var c=path.normalize([process.cwd(),this.debug?"example/core.json":"core.json"].join("/"));c=JSON.parse(fs.readFileSync(c)),configure.init(c).then(function(c){if(b.configPath=c.config,_.has(c.env,b.env)){var d=c.env[b.env];logger.setLogLevel(d.logger.level),_.has(d.logger,"rotate")?logger.addDailyRotateTransport(d.logger.rotate.path,d.logger.rotate.name).then(function(){b.core=core(logger),a.resolve()},function(b){a.reject(b)}):a.resolve()}else a.reject("Environment vars is not defined cannot continue.")})["catch"](function(b){var c=["Config file is invalid :",b].join(" ");a.reject(c)})}catch(d){var e=["Cannot init core :",d.message].join(" ");a.reject(e)}return a.promise},CoreWrapper.prototype.isReady=function(){return _.isString(this.configPath)&&!_.isEmpty(this.configPath)&&_.isArray(this.modules)&&!_.isEmpty(this.core)},CoreWrapper.prototype.start=function(){var a=Q.defer(),b=this;if(this.isReady())try{this.core.initialize(this.modules).then(function(){b.core.setConfigPath(b.configPath).then(function(){b.core.configure().then(function(){b.core.start().then(function(){a.resolve()})["catch"](function(b){logger.error(["[ Core.stack.run ] - Cannot start app :",b].join(" ")),a.reject(b)})})["catch"](function(b){logger.error(["[ Core.stack.run ] - Cannot configure core process :",b].join(" ")),a.reject(b)})})["catch"](function(b){logger.error(["[ Core.stack.run ] - Cannot process config setting :",b].join(" ")),a.reject(b)})})["catch"](function(b){logger.error(["[ Core.stack.run ] - Cannot process intialize :",b].join(" ")),a.reject(b)})}catch(c){logger.error(["[ Core.stack.run ] - An general error occured :",c.message].join(" ")),a.reject(c.message)}else a.reject("[ Core.stack.run ] - Cannot start app. Stack is not ready.");return a.promise},CoreWrapper.prototype.getConfig=function(){var a=this.core.config;return a.config||{}},module.exports=new CoreWrapper;