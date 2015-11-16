## Overview

This module is a part of yocto node modules for NodeJS.

Please see [our NPM repository](https://www.npmjs.com/~yocto) for complete list of available tools (completed day after day).

This module manage init / start our node core stack based on :

- [yocto-config](https://www.npmjs.com/package/yocto-config)
- [yocto-express](https://www.npmjs.com/package/yocto-express)
- [yocto-render](https://www.npmjs.com/package/yocto-render)
- [yocto-router](https://www.npmjs.com/package/yocto-router)

This module is core module of our tools : **YoctopusJs**

## Read this before any usage

- [yocto-config](https://www.npmjs.com/package/yocto-config) readme
- [yocto-express](https://www.npmjs.com/package/yocto-express) readme 
- [yocto-render](https://www.npmjs.com/package/yocto-render) readme 
- [yocto-router](https://www.npmjs.com/package/yocto-router) readme 

## How to use

First you need to setup a `core.json` config file at `process.cwd()` path.

This file must have this structure : 

```javascript
{
  "config" : "YOUR_CONFIG_PATH_HERE",
  "env" : {
    "development" : {
      "logger" : {
        "rotate" : {
          "path" : "YOUR_LOG_PATH_HERE",
          "name" : "YOUR_LOG_FILE_NAME_HERE"
        }
      }
    },
    "staging" : {
      "logger" : {
        "rotate" : {
          "path" : "YOUR_LOG_PATH_HERE",
          "name" : "YOUR_LOG_FILE_NAME_HERE"
        }
      }
    }, 
    "production" : {
      "logger" : {
        "rotate" : {
          "path" : "YOUR_LOG_PATH_HERE",
          "name" : "YOUR_LOG_FILE_NAME_HERE"
        }
      }
    }
  }
}
```

And start your app like example below : 

```javascript
var logger    = require('yocto-logger');
var core      = require('yocto-core-stack');

// set debug to true if needed
core.debug = true;

// Init your app first
core.init().then(function () {
  // Init succeed start your app
  core.start().then(function () {

  /********************************************
   *              YOUR CODE HERE              *
   *******************************************/

  }).catch(function (error) {
    // error process
  })
}).catch(function (error) {
  // error process
});
```

## How to add external middleware on current app

It's simple juste use an utility method for that : 

```javascript
// your middleware
var YOUR_MIDDLEWARE = function(){} ...
// add it
core.useOnApp(YOUR_MIDDLEWARE);
```

## Yocto Stack Generator

You can also use our yeoman generator to generate an app automatically.

For this see [yoctopus-generator](https://www.npmjs.com/package/generator-yoctopus) FAQ 



