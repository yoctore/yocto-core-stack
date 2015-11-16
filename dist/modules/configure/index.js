/* yocto-core-stack - Core package for Yoctopus tools. - V1.1.8 */
"use strict";function Configure(){this.rules={}}var Q=require("q"),joi=require("joi"),_=require("lodash");Configure.prototype.init=function(a){var b=Q.defer(),c={logger:joi.object().keys({level:joi.string()["default"]("debug").allow(["debug","versobe","warning","error","info"]),rotate:joi.object().keys({path:joi.string().required().empty(),name:joi.string().required().empty()})["default"]({enable:!1,path:""}).allow(["path","name"])}).allow(["level","rotate"])["default"]({level:"debug"})},d=joi.object().keys({modules:joi.array().items(joi.string().required().empty())["default"]([]),config:joi.string().required().empty(),env:joi.object().keys({development:joi.object().required().keys(c),staging:joi.object().required().keys(c),production:joi.object().required().keys(c)}).allow(["development","staging","production"])}).allow(["modules","config","env"]),e=joi.validate(a,d);return _.isNull(e.error)?(this.rules=e.value,b.resolve(e.value)):b.reject(e.error),b.promise},module.exports=new Configure;