/**
 * @module Sankaku
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 2014/06/20 - 11:55
 *
 * Copyright (c) 2011-2014 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * delaunay
 * original: https://github.com/ironwallaby/delaunay
 *
 * canvas-toBlob.js
 * A canvas.toBlob() implementation.
 * 2011-07-13
 *
 * By Eli Grey, http://eligrey.com and Devin Samarin, https://github.com/eboyjr
 * License: X11/MIT
 *   See LICENSE.md
 * @source http://purl.eligrey.com/github/canvas-toBlob.js/blob/master/canvas-toBlob.js
 *
 * FileSaver.js
 * A saveAs() FileSaver implementation.
 * 2014-05-27
 *
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 * @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js
 *
 * hosted on
 * https://github.com/taikiken/sankaku.js
 */
var Sankaku = {};
/**
 * @for Sankaku
 * @const version
 * @static
 * @type {string}
 */
Sankaku.version = "0.2.12";

// polyfill
( function ( self ){
    "use strict";

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

    // Date.now
    if ( !Date.now ) {
        Date.now = function now() {
            return new Date().getTime();
        };
    }

    ( function() {
        // requestAnimationFrame
        // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
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

        // Object.create
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
        if (!Object.create) {
            Object.create = (function(){
                function F(){}

                return function(o){
                    if (arguments.length !== 1) {
                        throw new Error('Object.create implementation only accepts one parameter.');
                    }
                    F.prototype = o;
                    return new F();
                };
            })();
        }

        // Array.isArray
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
        if(!Array.isArray) {
            Array.isArray = function (vArg) {
                return Object.prototype.toString.call(vArg) === "[object Array]";
            };
        }

        // Array.indexOf
        // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function (searchElement , fromIndex) {
                var i,
                    pivot = (fromIndex) ? fromIndex : 0,
                    length;

                if (!this) {
                    throw new TypeError();
                }

                length = this.length;

                if (length === 0 || pivot >= length) {
                    return -1;
                }

                if (pivot < 0) {
                    pivot = length - Math.abs(pivot);
                }

                for (i = pivot; i < length; i++) {
                    if (this[i] === searchElement) {
                        return i;
                    }
                }
                return -1;
            };
        }

        // Array.forEach
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
        if (!Array.prototype.forEach) {
            Array.prototype.forEach = function (fn, scope) {
                var i, len;
                for (i = 0, len = this.length; i < len; ++i) {
                    if (i in this) {
                        fn.call(scope, this[i], i, this);
                    }
                }
            };
        }

        // Function.prototype.bind
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
        if (!Function.prototype.bind) {
            Function.prototype.bind = function (oThis) {
                if (typeof this !== "function") {
                    // closest thing possible to the ECMAScript 5 internal IsCallable function
                    throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                }

                var aArgs = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    fNOP = function () {},
                    fBound = function () {
                        return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
                    };

                fNOP.prototype = this.prototype;
                fBound.prototype = new fNOP();

                return fBound;
            };
        }

        // trim
        // three.js
        String.prototype.trim = String.prototype.trim || function () {

            return this.replace( /^\s+|\s+$/g, '' );

        };

        // getUserMedia
        navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        // URL
        window.URL = window.URL ||
            window.webkitURL ||
            window.mozURL ||
            window.msURL;
    }());

}( window.self ) );

( function ( window ){
    "use strict";
    var Sankaku = window.Sankaku;

    /**
     * 継承に使用します
     * @for Sankaku
     * @method extend
     * @static
     * @param {Function} P 親クラス
     * @param {Function} C 子クラス
     */
    Sankaku.extend = function ( P, C ) {
        C.prototype = Object.create( P.prototype );
        C.prototype.constructor = C;
    };

}( window ) );

/*! canvas-toBlob.js
 * A canvas.toBlob() implementation.
 * 2011-07-13
 *
 * By Eli Grey, http://eligrey.com and Devin Samarin, https://github.com/eboyjr
 * License: X11/MIT
 *   See LICENSE.md
 */

/* global self */
/* jslint bitwise: true, regexp: true, confusion: true, vars: true, white: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/canvas-toBlob.js/blob/master/canvas-toBlob.js */

(function(view) {
    "use strict";
    var Uint8Array = view.Uint8Array,
        HTMLCanvasElement = view.HTMLCanvasElement,
        is_base64_regex = /\s*;\s*base64\s*(?:;|$)/i,
        base64_ranks,
        decode_base64 = function( base64 ) {
            var len = base64.length,
                buffer = new Uint8Array(len / 4 * 3 | 0),
                i = 0,
                outptr = 0,
                last = [0, 0],
                state = 0,
                save = 0,
                rank,
                code,
                undef;

            while ( len-- ) {

                code = base64.charCodeAt(i++);
                rank = base64_ranks[code-43];

                if (rank !== 255 && rank !== undef) {

                    last[1] = last[0];
                    last[0] = code;
                    save = (save << 6) | rank;
                    state++;

                    if (state === 4) {

                        buffer[outptr++] = save >>> 16;

                        if ( last[1] !== 61 ) {
                            /* padding character */
                            buffer[outptr++] = save >>> 8;
                        }

                        if ( last[0] !== 61 ) {
                            /* padding character */
                            buffer[outptr++] = save;
                        }

                        state = 0;
                    }
                }
            }
            // 2/3 chance there's going to be some null bytes at the end, but that
            // doesn't really matter with most image formats.
            // If it somehow matters for you, truncate the buffer up outptr.
            return buffer.buffer;
        };

    if ( Uint8Array ) {

        base64_ranks = new Uint8Array( [
            62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1,
            -1, -1,  0, -1, -1, -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9,
            10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
            -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
            36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
        ] );
    }

    if ( HTMLCanvasElement && !HTMLCanvasElement.prototype.toBlob ) {

        HTMLCanvasElement.prototype.toBlob = function( callback, type /*, ...args*/) {

            if (!type) {

                type = "image/png";
            }

            if ( !!this.mozGetAsFile ) {

                callback( this.mozGetAsFile( "canvas", type ) );
                return;
            }

            var args = Array.prototype.slice.call(arguments, 1),
                dataURI = this.toDataURL.apply(this, args),
                header_end = dataURI.indexOf(","),
                data = dataURI.substring(header_end + 1),
                is_base64 = is_base64_regex.test(dataURI.substring(0, header_end)),
                blob;

            if ( Blob.fake ) {
                // no reason to decode a data: URI that's just going to become a data URI again
                blob = new Blob();

                if ( is_base64 ) {

                    blob.encoding = "base64";
                } else {

                    blob.encoding = "URI";
                }

                blob.data = data;
                blob.size = data.length;

            } else if ( Uint8Array ) {

                if ( is_base64 ) {

                    blob = new Blob( [ new Uint8Array( decode_base64( data ) ) ], { type: type } );
                } else {

                    blob = new Blob( [ new Uint8Array( decodeURIComponent( data ) ) ], { type: type } );
                }
            }
            callback(blob);
        };
    }
}(self));
