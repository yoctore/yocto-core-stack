'use-strict';

var _       = require('underscore');
var us      = require('underscore.string');
var lodash  = require('lodash');


// File dbfactory.js

//methode join
console.log( us.join(' ', 'test', 'librairie', 'lodash') );
console.log( lodash(['test', 'librairie', 'lodash']).join(' ') );

//methode is null
console.log( 'isNull ? ' + _.isNull(null));
console.log( 'isNull ? ' + lodash.isNull(null));

//methode isUndefined
console.log( 'isUndefined ? ' + _.isUndefined(null));
console.log( 'isUndefined ? ' + lodash.isUndefined(null));

//methode startsWith
console.log('startsWith ? ' + us.startsWith(".vimrc", "vim", 1) ) ;
console.log('startsWith ? ' + lodash.startsWith(".vimrc", "vim", 1) ) ;

//methode isEmpty
console.log('isEmpty ? ' + _.isEmpty('a') ) ;
console.log('isEmpty ? ' + lodash.isEmpty('a') ) ;

//methode extend
console.log('extend ? ' + _.extend({name: 'moe'}, {age: 50}));
console.log('extend ? ' + lodash.extend({name: 'moe'}, {age: 50}));

//methode has
console.log('has ? ' + _.has({a: 1, b: 2, c: 3}, "b"));
console.log('has ? ' + lodash.has({a: 1, b: 2, c: 3}, "b"));

//methode every et identity
console.log('every ? ' +_.every([true, 1, null, 'yes'], _.identity));
console.log('every ? ' + lodash.every([true, 1, null, 'yes'], lodash.identity));

//methode toSentences
console.log('toSentences ? ' +us.toSentence(["jQuery", "Mootools", "Prototype"]));
console.log('[!] toSentences ? not defined in lodash');

//methode Clean
console.log('clean ? ' +us.clean(['   test    comparaison librairires   .']));
console.log('[!] clean ? not defined in lodash');

//methode toNumber
console.log('toNumber ? ' + us.toNumber("3.54", 1));
console.log('[!] toNumber ? not defined in lodash, "parseInt" is defined');

// methode isNumber
console.log('isNumber ? ' +_.isNumber(1));
console.log('isNumber ? ' + lodash.isNumber(1));

//methode is NaN
console.log('isNaN ? ' +_.isNaN(1));
console.log('isNaN ? ' + lodash.isNaN(1));

//methode flatten
console.log('flatten ? ' +_.flatten([1, [2, 3, [4]]]));
console.log('flatten ? ' + lodash.flatten([1, [2, 3, [4]]]));

//methode words
console.log('words ? ' + us.words("www.yocto.re", ".") );
console.log('words ? ' + lodash.words("www.yocto.re", /[^,\.]+/g) );
