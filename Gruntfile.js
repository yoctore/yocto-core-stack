/**
 * Gruntfile.js is used to configure or define tasks and load Grunt plugins.
 *
 * @class Gruntfile
 * @date 15/04/2015
 * @author Cédric Balard
 * @copyright Yocto SAS <http://www.yocto>
 */

 'use-strict';

/**
 * Use uglify with Grunt to minify all ".js" file in documentation
 * Use yuidoc to generate the docs
 *
 * @module Grunt file
 */
 module.exports = function(grunt) {
     grunt.initConfig( {
         pkg : grunt.file.readJSON('package.json'),

         /**
          * Jshint permit to flags suspicious usage in programs
          * @submodule jshint
          */
         jshint : {
             options: {
                 node:true,
                 yui:true,
             },
             all : [
                 'Gruntfile.js',
                 'index.js'
                 ]
         },

         /**
          * Yuidoc permit to generate the yuidoc of the Yocto Stack Generator
          *
          * @submodule yuidoc
          */
         yuidoc : {
             compile : {
                 name        : '<%= pkg.name %>',
                 description : '<%= pkg.description %>',
                 version     : '<%= pkg.version %>',
                 url         : '<%= pkg.homepage %>',
                 options     : {
                     paths  : '.',
                     outdir : 'documentation/src'
                 }
             },
         },

         /**
          * Copy permit to copy folder
          *
          * @submodule copy
          */
         copy: {
            main: {
                files: [
                    // clone documentation/src in documentation/dist
                    { expand    : true,
                      cwd       : 'documentation/src/',
                      src       : ['**'],
                      dest      : 'documentation/dist/'
                    }
                ],
            },
        },

        /**
         * Uglify permit to minify javascript file
         *
         * @submodule uglify
         */
         uglify : {
             api : {
                 src    : 'documentation/dist/api.js',
                 dest   : 'documentation/dist/api.js'
             },

             target : {
                 files : [ {
                     expand : true,
                     cwd    : 'documentation/dist/assets/js/',
                     src    : '**/*.js',
                     dest   : 'documentation/dist/assets/js/'
                 }]
             }
         }
     });

     // Load the plugins
     grunt.loadNpmTasks('grunt-contrib-jshint');
     grunt.loadNpmTasks('grunt-contrib-uglify');
     grunt.loadNpmTasks('grunt-contrib-yuidoc');
     grunt.loadNpmTasks('grunt-contrib-copy');

     grunt.registerTask('default', [ 'jshint', 'yuidoc', 'copy', 'uglify']);

 };
