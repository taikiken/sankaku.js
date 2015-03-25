/**
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 2015/03/16 - 14:02
 *
 * Copyright (c) 2011-@@year inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * Polyfill
 *
 * @build: @@buildTime
 * @version: @@version
 */
/*jshint bitwise: false*/
( function ( window ){
  "use strict";
  var
    document = window.document,
    _max = Math.max,
    _abs = Math.abs,
    self = window.self;

  // Date.now
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Date/now
  if ( !Date.now ) {

    Date.now = function now() {

      return new Date().getTime();
    };
  }

  // requestAnimationFrame
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
  ( function (){
    var lastTime = 0;
    var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

    for ( var x = 0; x < vendors.length && !self.requestAnimationFrame; ++ x ) {

      self.requestAnimationFrame = self[ vendors[ x ] + 'RequestAnimationFrame' ];
      self.cancelAnimationFrame = self[ vendors[ x ] + 'CancelAnimationFrame' ] || self[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
    }

    if ( self.requestAnimationFrame === undefined && self.setTimeout !== undefined ) {

      self.requestAnimationFrame = function ( callback ) {

        var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
        var id = self.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );

        lastTime = currTime + timeToCall;

        return id;
      };

    }

    if( self.cancelAnimationFrame === undefined && self.clearTimeout !== undefined ) {

      self.cancelAnimationFrame = function ( id ) { self.clearTimeout( id ); };
    }

  }() );

  // Object.create
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
  if ( typeof Object.create !== 'function' ) {

    Object.create = ( function() {

      var Temp = function() {};

      return function ( prototype ) {

        if ( arguments.length > 1 ) {

          throw Error('Second argument not supported');
        }

        if ( typeof prototype !== 'object' ) {

          throw TypeError('Argument must be an object');
        }

        Temp.prototype = prototype;

        var result = new Temp();
        Temp.prototype = null;

        return result;
      };
    })();
  }

  // Array.isArray
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
  if ( !Array.isArray ) {

    Array.isArray = function( arg ) {

      return Object.prototype.toString.call( arg ) === '[object Array]';
    };
  }

  // Array.indexOf
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
  // Production steps of ECMA-262, Edition 5, 15.4.4.14
  // Reference: http://es5.github.io/#x15.4.4.14
  if ( !Array.prototype.indexOf ) {

    Array.prototype.indexOf = function( searchElement, fromIndex ) {

      var k;

      // 1. Let O be the result of calling ToObject passing
      //    the this value as the argument.
      if ( this === null || typeof this === "undefined" ) {
        throw new TypeError('"this" is null or not defined');
      }

      var O = Object(this);

      // 2. Let lenValue be the result of calling the Get
      //    internal method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0;

      // 4. If len is 0, return -1.
      if ( len === 0 ) {

        return -1;
      }

      // 5. If argument fromIndex was passed let n be
      //    ToInteger(fromIndex); else let n be 0.
      var n = +fromIndex || 0;

      if ( _abs( n ) === Infinity ) {

        n = 0;
      }

      // 6. If n >= len, return -1.
      if ( n >= len ) {

        return -1;
      }

      // 7. If n >= 0, then Let k be n.
      // 8. Else, n<0, Let k be len - abs(n).
      //    If k is less than 0, then let k be 0.
      k = _max( n >= 0 ? n : len - _abs( n ), 0 );

      // 9. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the
        //    HasProperty internal method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        //    i.  Let elementK be the result of calling the Get
        //        internal method of O with the argument ToString(k).
        //   ii.  Let same be the result of applying the
        //        Strict Equality Comparison Algorithm to
        //        searchElement and elementK.
        //  iii.  If same is true, return k.
        if ( k in O && O[ k ] === searchElement ) {

          return k;
        }

        k++;
      }

      return -1;
    };
  }

  // Array.forEach
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
  // Production steps of ECMA-262, Edition 5, 15.4.4.18
  // Reference: http://es5.github.io/#x15.4.4.18
  if (!Array.prototype.forEach) {

    Array.prototype.forEach = function(callback, thisArg) {

      var T, k;

      //if (this == null) {
      if ( this === null || typeof this === "undefined" ) {
        throw new TypeError(' this is null or not defined');
      }

      // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
      var O = Object(this);

      // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0;

      // 4. If IsCallable(callback) is false, throw a TypeError exception.
      // See: http://es5.github.com/#x9.11
      if (typeof callback !== "function") {
        throw new TypeError(callback + ' is not a function');
      }

      // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
      if (arguments.length > 1) {
        T = thisArg;
      }

      // 6. Let k be 0
      k = 0;

      // 7. Repeat, while k < len
      while (k < len) {

        var kValue;

        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        if (k in O) {

          // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
          kValue = O[k];

          // ii. Call the Call internal method of callback with T as the this value and
          // argument list containing kValue, k, and O.
          callback.call(T, kValue, k, O);
        }
        // d. Increase k by 1.
        k++;
      }
      // 8. return undefined
    };
  }

  // Function.prototype.bind
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
  if ( !Function.prototype.bind ) {

    Function.prototype.bind = function ( oThis ) {

      if ( typeof this !== "function" ) {
        // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError( "Function.prototype.bind - what is trying to be bound is not callable" );
      }

      var aArgs = Array.prototype.slice.call( arguments, 1 ),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {

          return fToBind.apply( this instanceof fNOP && oThis ? this : oThis, aArgs.concat( Array.prototype.slice.call( arguments ) ) );
        };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
  }

  // String.prototype.trim
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String/trim
  if ( !String.prototype.trim ) {
    ( function() {
      // Make sure we trim BOM and NBSP
      var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

      String.prototype.trim = function() {

        return this.replace( rtrim, '' );
      };
    } )();
  }

  // navigator.getUserMedia
  // https://developer.mozilla.org/ja/docs/Web/API/Navigator/getUserMedia
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;


  // window.URL
  window.URL = window.URL ||
    window.webkitURL ||
    window.mozURL ||
    window.msURL;

  // console
  if ( !self.console ) {

    self.console = {

      info: function (){},
      log: function  (){},
      debug: function (){},
      warn: function (){},
      error: function (){},
      table: function (){}

    };
  }

}( window ) );