/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/12 - 16:17
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * inspired by three.js / http://threejs.org and CreateJS / http://createjs.com/
 */

var inazumatv = {};

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

// ==================================
//  Top Level function
// ==================================

( function ( inazumatv, self ){
    "use strict";

    var _rand = Math.random,
        _floor = Math.floor,
        _max = Math.max;

    /**
     * Top Level
     * 継承に使用します
     * @for inazumatv
     * @method extend
     * @param {Function} P 親クラス
     * @param {Function} C 子クラス
     */
    inazumatv.extend = function ( P, C ) {
        C.prototype = Object.create( P.prototype );
        C.prototype.constructor = C;
    };

    /**
     * Top Level
     * 数値チェック
     * @for inazumatv
     * @method isNumeric
     * @param {*} obj
     * @returns {boolean} true: Number, false: not Number
     */
    function isNumeric ( obj ) {
        return !isNaN( parseFloat( obj ) ) && isFinite( obj );
    }
    inazumatv.isNumeric = isNumeric;

    /**
     * Top Level
     * 範囲指定乱数生成
     * @for inazumatv
     * @method random
     * @param {Number} min 最小値
     * @param {Number} [max] 最大値 optional
     * @returns {Number} min ~ max 間の乱数(Float)を発生させます
     */
    inazumatv.random = function ( min, max ) {
        if ( !isNumeric( max ) ) {
            // max が無い場合は 0 ~ min の範囲
            max = min;
            min = 0;
        }

        return min + _floor( _rand() * ( max - min + 1 ) );
    };

    /**
     * Top Level
     * 配列内の最大数値を返します
     * @for inazumatv
     * @method maxValue
     * @param {Array} arr 検証対象の配列、内部は全部数値 [Number, [Number]]
     * @returns {number} 配列内の最大数値を返します
     */
    inazumatv.maxValue = function ( arr ){
        return _max.apply( null, arr );
    };

    /**
     * Top Level
     * log 出力を抑制します。<br>
     * <strong>注意</strong> 実行後にログ出力を行うことはできません。
     *
     * @for inazumatv
     * @method logAbort
     */
    inazumatv.logAbort = function (){
        self.console = {
            info: function (){},
            log: function  (){},
            debug: function (){},
            warn: function (){},
            error: function (){},
            table: function (){}
        };
    };

    // http://bost.ocks.org/mike/shuffle/
    /**
     * 配列をシャッフルします
     * @for inazumatv
     * @method shuffle
     * @param {array} array
     * @returns {Array}
     */
    function shuffle( array ) {
        var copy = [], n = array.length, i;

        // While there remain elements to shuffle…
        while ( n ) {

            // Pick a remaining element…
            i = _floor( _rand() * array.length );

            // If not already shuffled, move it to the new array.
            if ( i in array ) {

                copy.push( array[ i ] );
                delete array[ i ];
                --n;
            }
        }

        return copy;
    }
    inazumatv.shuffle = shuffle;

}( inazumatv, window.self ) );
/**
 * @module inazumatv
 */
(function( inazumatv ) {
    "use strict";

    /**
     * Static class holding library specific information such as the version and buildDate of
     * the library.
     * @class inazumatv
     **/
    var s = inazumatv.build = inazumatv.build || {};

    /**
     * The version string for this release.
     * @property version
     * @type String
     * @static
     **/
    s.version = /*version*/"0.9.1"; // injected by build process

    /**
     * The build date for this release in UTC format.
     * @property buildDate
     * @type String
     * @static
     **/
    s.buildDate = /*date*/"Thu, 19 Jun 2014 07:02:04 GMT"; // injected by build process

})( this.inazumatv );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/12 - 17:25
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( window, inazumatv ){
    "use strict";
    var navigator = window.navigator,
        _ua = navigator.userAgent,

        _ie6 = !!_ua.match(/msie [6]/i),
        _ie7 = !!_ua.match(/msie [7]/i),
        _ie8 = !!_ua.match(/msie [8]/i),
        _ie9 = !!_ua.match(/msie [9]/i),
        _ie10 = !!_ua.match(/msie [10]/i),
        _ie11 = !!_ua.match(/trident\/[7]/i) && !!_ua.match(/rv:[11]/i),
        _ie = !!_ua.match(/msie/i) || _ie11,
        _legacy = _ie6 || _ie7|| _ie8,

        _ipad = !!_ua.match(/ipad/i),
        _ipod = !!_ua.match(/ipod/i),
        _iphone = !!_ua.match(/iphone/i) && !_ipad && !_ipod,
        _ios = _ipad || _ipod || _iphone,

        _android = !!_ua.match(/android/i),
        _mobile = _ios || _android,

        _chrome = !!_ua.match(/chrome/i),
        _firefox = !!_ua.match(/firefox/i),
        _safari = !!_ua.match(/safari/i),
        _android_standard = _android && _safari && !!_ua.match(/version/i),

        _touch = typeof window.ontouchstart !== "undefined",

        _fullScreen = typeof navigator.standalone !== "undefined" ? navigator.standalone : false,

        _android_phone = false,
        _android_tablet = false,
        _ios_version = -1,
        _safari_version = -1,

        _safari_versions = [ -1, 0, 0 ],
        _ios_versions,

        _android_version = -1,
        _android_versions,

        _chrome_version = -1,

        _canvas = !!window.CanvasRenderingContext2D
        ;

    if ( _android ) {
        _android_phone = !!_ua.match(/mobile/i);

        if ( !_android_phone ) {
            _android_tablet = true;
        }
    }

    if ( _android_standard ) {
        _chrome = false;
        _safari = false;
    }

    if ( _chrome ) {
        _safari = false;
    }
    // private
    // iOS version
    // http://stackoverflow.com/questions/8348139/detect-_ios-version-less-than-5-with-javascript
    /**
     * iOS version detection
     * @for Browser
     * @method _iosVersion
     * @returns {Array} iOS version 配列 3桁
     * @private
     */
    function _iosVersion () {
        var v, versions = [ -1, 0, 0 ];
        if ( _ios ) {
            // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
            v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
            versions = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
            _ios_version = parseFloat( versions[ 0 ] + "." + versions[ 1 ] + versions[ 2 ] );
        }

        return versions;
    }
    _ios_versions = _iosVersion();

    /**
     * Android version detection
     * @for Browser
     * @method _androidVersion
     * @returns {Array} Android version 配列 3桁
     * @private
     */
    function _androidVersion () {
        var v, versions = [ -1, 0, 0 ];
        if ( _android ) {
            v = (navigator.appVersion).match(/Android (\d+)\.(\d+)\.?(\d+)?/);
            versions = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
            _android_version = parseFloat( versions[ 0 ] + "." + versions[ 1 ] + versions[ 2 ] );
        }

        return versions;
    }
    _android_versions = _androidVersion();

    // Safari version
    /**
     * Safari version detection
     * @returns {Array} Safari version 配列 2桁~3桁
     * @private
     */
    function _safariVersion () {
        var v, versions;

        v = (navigator.appVersion).match(/Version\/(\d+)\.(\d+)\.?(\d+)?/);
        versions = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
        _safari_version = parseFloat( versions[ 0 ] + "." + versions[ 1 ] + versions[ 2 ] );
        return versions;
    }

    if ( _safari && !_mobile ) {
        // not _mobile and _safari
        _safari_versions = _safariVersion();
    }

    function _chromeVersion () {
        var v, versions;

        v = (navigator.appVersion).match(/Chrome\/(\d+)\.(\d+)\.(\d+)\.?(\d+)?/);
        versions = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3], 10), parseInt(v[4], 10)];
        return versions.join( "." );
    }

    if (_chrome ) {
        _chrome_version = _chromeVersion();
    }

    /**
     * Browser 情報を管理します
     * @class Browser
     * @constructor
     */
    var Browser = function () {
        throw "Browser cannot be instantiated";
    };

    /**
     *
     * @type {{iOS: {is: Function, number: Function, major: Function, version: Function}, Android: {is: Function, number: Function, major: Function, version: Function}, IE: {is: Function, version: Function}, Chrome: {is: Function}, Safari: {is: Function}, Firefox: {is: Function}, _ie: Function, _ie6: Function, _ie7: Function, _ie8: Function, _ie9: Function, _ie10: Function, _ie11: Function, _chrome: Function, _firefox: Function, _safari: Function, _legacy: Function, _mobile: Function, _ios: Function, _ios_version: Function, _android_version: Function, _android_version_major: Function, _android_version_num: Function, _android: Function, _iphone: Function, _ipad: Function, _ipod: Function, hideURLBar: Function}}
     */
    Browser = {
        // new version
        /**
         * iOS に関する情報
         * @for Browser
         * @property iOS
         * @type Object
         * @static
         */
        iOS: {
            /**
             * @for Browser.iOS
             * @method is
             * @returns {boolean} iOS か否かを返します
             * @static
             */
            is: function (){
                return _ios;
            },
            /**
             * @for Browser.iOS
             * @method number
             * @returns {Array} iOS version number を返します [ major, minor, build ]
             * @static
             */
            number: function (){
                return _ios_versions;
            },
            /**
             * @for Browser.iOS
             * @method major
             * @returns {Number} iOS major version number を返します
             * @static
             */
            major: function (){
                return _ios_versions[ 0 ];
            },
            /**
             * @for Browser.iOS
             * @method version
             * @returns {Number} iOS version を返します 9.99
             * @static
             */
            version: function (){
                return _ios_version;
            },
            /**
             * @for Browser.iOS
             * @method iPhone
             * @returns {Boolean} iPhone か否かを返します
             * @static
             */
            iPhone: function (){
                return _iphone;
            },
            /**
             * @for Browser.iOS
             * @method iPad
             * @returns {Boolean} iPad か否かを返します
             * @static
             */
            iPad: function (){
                return _ipad;
            },
            /**
             * @for Browser.iOS
             * @method iPod
             * @returns {Boolean} iPod か否かを返します
             * @static
             */
            iPod: function (){
                return _ipod;
            },
            /**
             * @for Browser.iOS
             * @method fullScreen
             * @returns {boolean} standalone mode か否かを返します
             * @static
             */
            fullScreen: function (){
                return _fullScreen;
            }
        },
        /**
         * Android に関する情報
         * @for Browser
         * @property Android
         * @type Object
         * @static
         */
        Android: {
            /**
             * @for Browser.Android
             * @method is
             * @returns {boolean} Android か否かを返します
             * @static
             */
            is: function (){
                return _android;
            },
            /**
             * @for Browser.Android
             * @method number
             * @returns {Array} Android version number を返します [ major, minor, build ]
             * @static
             */
            number: function (){
                return _android_versions;
            },
            /**
             * @for Browser.Android
             * @method major
             * @returns {Number} Android major version number を返します
             * @static
             */
            major: function (){
                return _android_versions[ 0 ];
            },
            /**
             * @for Browser.Android
             * @method version
             * @returns {Number} Android version を返します 9.99
             * @static
             */
            version: function (){
                return _android_version;
            },
            /**
             * @for Browser.Android
             * @method phone
             * @returns {boolean} Android Phone か否かを返します
             * @static
             */
            phone: function (){
                return _android_phone;
            },
            /**
             * @for Browser.Android
             * @method tablet
             * @returns {boolean} Android Tablet か否かを返します
             * @static
             */
            tablet: function (){
                return _android_tablet;
            },
            /**
             * @for Browser.Android
             * @method standard
             * @returns {boolean} Android standard Browser か否かを返します
             * @static
             */
            standard: function () {
                return _android_standard;
            }
        },
        /**
         * IE に関する情報
         * @for Browser
         * @property IE
         * @type Object
         * @static
         */
        IE: {
            /**
             * @for Browser.IE
             * @method is
             * @returns {boolean} IE か否かを返します
             * @static
             */
            is: function (){
                return _ie;
            },
            /**
             * @for Browser.IE
             * @method is6
             * @returns {boolean} IE 6 か否かを返します
             */
            is6: function (){
                return _ie6;
            },
            /**
             * @for Browser.IE
             * @method is7
             * @returns {boolean} IE 7 か否かを返します
             */
            is7: function (){
                return _ie7;
            },
            /**
             * @for Browser.IE
             * @method is8
             * @returns {boolean} IE 8 か否かを返します
             */
            is8: function (){
                return _ie8;
            },
            /**
             * @for Browser.IE
             * @method is9
             * @returns {boolean} IE 9 か否かを返します
             */
            is9: function (){
                return _ie9;
            },
            /**
             * @for Browser.IE
             * @method is10
             * @returns {boolean} IE 10 か否かを返します
             */
            is10: function (){
                return _ie10;
            },
            /**
             * @for Browser.IE
             * @method is11
             * @returns {boolean} IE 11 か否かを返します
             */
            is11: function (){
                return _ie11;
            },
            /**
             * @for Browser.IE
             * @method _legacy
             * @returns {boolean} IE 6 or 7 or 8 か否かを返します
             */
            legacy: function (){
                return _legacy;
            },
            /**
             * @for Browser.IE
             * @method version
             * @returns {Number} IE version を返します int 6 ~ 11, IE 6 ~ IE 11 でない場合は -1 を返します
             * @static
             */
            version: function (){
                var v = -1;
                if ( _ie11 ) {
                    v = 11;
                } else if ( _ie10 ) {
                    v = 10;
                } else if ( _ie9 ) {
                    v = 9;
                } else if ( _ie8 ) {
                    v = 8;
                } else if ( _ie7 ) {
                    v = 7;
                } else if ( _ie6 ) {
                    v = 6;
                }
                return v;
            }
        },
        /**
         * Chrome に関する情報
         * @for Browser
         * @property Chrome
         * @type Object
         * @static
         */
        Chrome: {
            /**
             * @for Browser.Chrome
             * @method is
             * @returns {boolean} Chrome か否かを返します
             * @static
             */
            is: function (){
                return _chrome;
            },
            /**
             * @for Browser.Chrome
             * @method version
             * @returns {string}
             */
            version: function () {
                return _chrome_version;
            }
        },
        /**
         * Safari に関する情報
         * @for Browser
         * @property Safari
         * @type Object
         * @static
         */
        Safari: {
            /**
             * @for Browser.Safari
             * @method is
             * @returns {boolean} Safari か否かを返します
             * @static
             */
            is: function (){
                return _safari;
            },
            /**
             * @for Browser.Safari
             * @method number
             * @returns {Array} Safari version number を返します [ major, minor, build ]
             * @static
             */
            number: function (){
                return _safari_versions;
            },
            /**
             * @for Browser.Safari
             * @method major
             * @returns {Number} Safari major version number を返します
             * @static
             */
            major: function (){
                return _safari_versions[ 0 ];
            },
            /**
             * @for Browser.Safari
             * @method version
             * @returns {Number} Safari version を返します 9.99
             * @static
             */
            version: function (){
                return _safari_version;
            }
        },
        /**
         * Firefox に関する情報
         * @for Browser
         * @property Firefox
         * @type Object
         * @static
         */
        Firefox: {
            /**
             * @for Browser.Firefox
             * @method is
             * @returns {boolean} Firefox か否かを返します
             * @static
             */
            is: function (){
                return _firefox;
            }
        },
        /**
         * Touch action に関する情報
         * @for Browser
         * @property Touch
         * @type Object
         * @static
         */
        Touch: {
            /**
             * @for Browser.Touch
             * @method is
             * @returns {boolean} Touch 可能か否かを返します
             * @static
             */
            is: function (){
                return _touch;
            }
        },
        /**
         * Mobile action に関する情報
         * @for Browser
         * @property Mobile
         * @type Object
         * @static
         */
        Mobile: {
            /**
             * @for Browser.Mobile
             * @method is
             * @returns {boolean} mobile(smart phone) か否かを返します
             * @static
             */
            is: function (){
                return _mobile;
            },
            /**
             * iPhone, Android phone. URL bar 下へスクロールさせます。<br>
             * window.onload 後に実行します。<br>
             * iOS 7 mobile Safari, Android Chrome and iOS Chrome では動作しません。
             *
             *     function onLoad () {
             *          window.removeEventListener( "load", onLoad );
             *          Browser.Mobile.hideURLBar();
             *     }
             *     window.addEventListener( "load", onLoad, false );
             *
             * @for Browser.Mobile
             * @method hideURLBar
             * @static
             */
            hideURLBar : function (){
                setTimeout( function (){ scrollBy( 0, 1 ); }, 0);
            },
            /**
             * @for Browser.Mobile
             * @method phone
             * @returns {boolean} Smart Phone(include iPod)か否かを返します
             * @static
             */
            phone: function (){
                return _ipod || _iphone || _android_phone;
            },
            /**
             * @for Browser.Mobile
             * @method tablet
             * @returns {boolean} tablet か否かを返します
             * @static
             */
            tablet: function (){
                return _ipad || _android_tablet;
            }
        },
        /**
         * Canvas に関する情報
         * @for Browser
         * @property Canvas
         * @type Object
         * @static
         */
        Canvas: {
            /**
             * @for Browser.Canvas
             * @method is
             * @returns {boolean} canvas 2D が使用可能か否かを返します
             * @static
             */
            is: function (){
                return _canvas;
            },
            /**
             * @for Browser.Canvas
             * @method webgl
             * @returns {boolean} canvas webgl 使用可能か否かを返します
             * @static
             */
            webgl: function (){
                if ( !_canvas ) {
                    return false;
                }

                try {
                    return !!window.WebGLRenderingContext && !!document.createElement( 'canvas' ).getContext( 'experimental-webgl' );
                } catch( e ) {
                    return false;
                }
            }
        }
    };

    inazumatv.Browser = Browser;

    // below for compatibility to older version of inazumatv.util
    inazumatv.browser = Browser;
}( window, this.inazumatv || {} ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/13 - 13:57
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( window, inazumatv ){
    "use strict";
    var document = window.document;

    /**
     * @class CookieUtil
     * @constructor
     * @static
     */
    var CookieUtil = function () {
        throw "CookieUtil cannot be instantiated";
    };

    /**
     *
     * @type {{getItem: Function, setItem: Function, removeItem: Function, hasItem: Function, keys: Function}}
     * https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
     */
    CookieUtil = {
        /**
         * Cookie 取得
         * @for CookieUtil
         * @method getItem
         * @param {String} sKey
         * @returns {string|null} Cookie 値を返します。取得できない場合はnullを返します。
         * @static
         */
        getItem: function (sKey) {
            return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        },
        /**
         * Cookie 保存
         * @for CookieUtil
         * @method setItem
         * @param {String} sKey Cookie key
         * @param {String} sValue Cookie value
         * @param {String} [vEnd] Cookie 期限, [ second, Date.toUTCString ]
         * @param {String} [sPath] Cookie path
         * @param {String} [sDomain] Cookie Domain
         * @param {String} [bSecure] Cookie secure
         * @returns {boolean} 保存に成功したかの真偽値を返します
         * @static
         */
        setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
            if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
            var sExpires = "";
            if (vEnd) {
                switch (vEnd.constructor) {
                    case Number:
                        sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                        break;
                    case String:
                        sExpires = "; expires=" + vEnd;
                        break;
                    case Date:
                        sExpires = "; expires=" + vEnd.toUTCString();
                        break;
                }
            }
            document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
            return true;
        },
        /**
         * Cookie 削除
         * @for CookieUtil
         * @method removeItem
         * @param {String} sKey Cookie key
         * @param {String} [sPath] Cookie path
         * @param {String} [sDomain] Cookie Domain
         * @returns {boolean} 削除に成功したかの真偽値を返します
         * @static
         */
        removeItem: function (sKey, sPath, sDomain) {
            if (!sKey || !this.hasItem(sKey)) { return false; }
            document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
            return true;
        },
        /**
         * Cookie Key が存在するかを調べる
         * @for CookieUtil
         * @method hasItem
         * @param sKey Cookie key
         * @returns {boolean} true / false
         * @static
         */
        hasItem: function (sKey) {
            return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
        },
        /**
         * Cookie key 列挙
         * @for CookieUtil
         * @method keys
         * @returns {Array} Cookie key 配列を返します
         * @static
         */
        keys: /* optional method: you can safely remove it! */ function () {
            var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
            for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
            return aKeys;
        }
    };

    inazumatv.CookieUtil = CookieUtil;
}( window, this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/13 - 14:26
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( window, inazumatv ){
    "use strict";

    // EventDispatcher class from EaselJS.
    // Copyright (c) 2010 gskinner.com, inc.
    // http://createjs.com/
    /**
     * The EventDispatcher provides methods for managing prioritized queues of event listeners and dispatching events. All
     * {{#crossLink "DisplayObject"}}{{/crossLink}} classes dispatch events, as well as some of the utilities like {{#crossLink "Ticker"}}{{/crossLink}}.
     *
     * You can either extend this class or mix its methods into an existing prototype or instance by using the
     * EventDispatcher {{#crossLink "EventDispatcher/initialize"}}{{/crossLink}} method.
     *
     * <h4>Example</h4>
     * Add EventDispatcher capabilities to the "MyClass" class.
     *
     *      EventDispatcher.initialize(MyClass.prototype);
     *
     * Add an event (see {{#crossLink "EventDispatcher/addEventListener"}}{{/crossLink}}).
     *
     *      instance.addEventListener("eventName", handlerMethod);
     *      function handlerMethod(event) {
     *          console.log(event.target + " Was Clicked");
     *      }
     *
     * <b>Maintaining proper scope</b><br />
     * When using EventDispatcher in a class, you may need to use <code>Function.bind</code> or another approach to
     * maintain you method scope. Note that Function.bind is not supported in some older browsers.
     *
     *      instance.addEventListener("click", handleClick.bind(this));
     *      function handleClick(event) {
     *          console.log("Method called in scope: " + this);
     *      }
     *
     * Please note that currently, EventDispatcher does not support event priority or bubbling. Future versions may add
     * support for one or both of these features.
     *
     * @class EventDispatcher
     * @constructor
     **/
    var EventDispatcher = function() {
        this.initialize();
    };

    var p = EventDispatcher.prototype;

    p.constructor = inazumatv.EventDispatcher;

    /**
     * Static initializer to mix in EventDispatcher methods.
     * @method initialize
     * @static
     * @param {Object} [target] The target object to inject EventDispatcher methods into. This can be an instance or a
     * prototype.
     **/
    EventDispatcher.initialize = function(target) {
        target.addEventListener = p.addEventListener;
        target.removeEventListener = p.removeEventListener;
        target.removeAllEventListeners = p.removeAllEventListeners;
        target.hasEventListener = p.hasEventListener;
        target.dispatchEvent = p.dispatchEvent;
    };

    // private properties:
    /**
     * @protected
     * @property _listeners
     * @type Object
     **/
    p._listeners = null;

    // constructor:
    /**
     * Initialization method.
     * @method initialize
     * @protected
     **/
    p.initialize = function() {};

    // public methods:
    /**
     * Adds the specified event listener.
     * @method addEventListener
     * @param {String} type The string type of the event.
     * @param {Function | Object} listener An object with a handleEvent method, or a function that will be called when
     * the event is dispatched.
     * @return {Function | Object} Returns the listener for chaining or assignment.
     **/
    p.addEventListener = function(type, listener) {
        var listeners = this._listeners;
        if (!listeners) { listeners = this._listeners = {}; }
        else { this.removeEventListener(type, listener); }
        var arr = listeners[type];
        if (!arr) { arr = listeners[type] = []; }
        arr.push(listener);
        return listener;
    };

    /**
     * Removes the specified event listener.
     * @method removeEventListener
     * @param {String} type The string type of the event.
     * @param {Function | Object} listener The listener function or object.
     **/
    p.removeEventListener = function(type, listener) {
        var listeners = this._listeners;
        if (!listeners) { return; }
        var arr = listeners[type];
        if (!arr) { return; }
        for (var i=0,l=arr.length; i<l; i++) {
            if (arr[i] === listener) {
                if (l===1) { delete(listeners[type]); } // allows for faster checks.
                else { arr.splice(i,1); }
                break;
            }
        }
    };

    /**
     * Removes all listeners for the specified type, or all listeners of all types.
     * @method removeAllEventListeners
     * @param {String} [type] The string type of the event. If omitted, all listeners for all types will be removed.
     **/
    p.removeAllEventListeners = function(type) {
        if (!type) { this._listeners = null; }
        else if (this._listeners) { delete(this._listeners[type]); }
    };

    /**
     * Dispatches the specified event.
     * @method dispatchEvent
     * @param {Object | String} eventObj An object with a "type" property, or a string type. If a string is used,
     * dispatchEvent will construct a generic event object with "type" and "params" properties.
     * @param {Object} [target] The object to use as the target property of the event object. This will default to the
     * dispatching object.
     * @return {Boolean} Returns true if any listener returned true.
     **/
    p.dispatchEvent = function(eventObj, target) {
        var ret=false, listeners = this._listeners;
        if (eventObj && listeners) {
            if (typeof eventObj === "string") { eventObj = {type:eventObj}; }
            var arr = listeners[eventObj.type];
            if (!arr) { return ret; }
            eventObj.target = target||this;
            arr = arr.slice(); // to avoid issues with items being removed or added during the dispatch
            for (var i=0,l=arr.length; i<l; i++) {
                var o = arr[i];
                if (o.handleEvent) { ret = ret||o.handleEvent(eventObj); }
                else { ret = ret||o(eventObj); }
            }
        }
        return !!ret;
    };

    /**
     * Indicates whether there is at least one listener for the specified event type.
     * @method hasEventListener
     * @param {String} type The string type of the event.
     * @return {Boolean} Returns true if there is at least one listener for the specified event.
     **/
    p.hasEventListener = function(type) {
        var listeners = this._listeners;
        return !!(listeners && listeners[type]);
    };

    /**
     * @method toString
     * @return {String} a string representation of the instance.
     **/
    p.toString = function() {
        return "[EventDispatcher]";
    };

    inazumatv.EventDispatcher = EventDispatcher;
}( window, this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/13 - 14:34
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( window, inazumatv ){
    "use strict";

    /**
     * @class EventObject
     * @param {String} eventType Event Type
     * @param {*} [params] String || Array eventHandler へ送る値をセット。複数の時は配列にセットする
     * @constructor
     */
    var EventObject = function ( eventType, params ){
        if ( typeof params === "undefined" || params === null ) {

            params = [];
        } else if ( !Array.isArray( params ) ) {
            // 配列へ
            params = [ params ];
        }

        this.type = eventType;
        this.params = params;
    };

    var p = EventObject.prototype;

    p.constructor = inazumatv.EventObject;

    /**
     * パラメタ取出し
     * @method getParams
     * @returns {*} 配列を返します
     */
    p.getParams = function (){
        return this.params;
    };

    inazumatv.EventObject = EventObject;

}( window, this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/15 - 2:55
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( inazumatv ){
    "use strict";

    /**
     * Ajax access Event, EventDispatcher mixin
     *
     * addEventListener
     * removeEventListener
     * removeAllEventListeners
     * hasEventListener
     * dispatchEvent
     *
     * @class AjaxEvent
     * @uses EventDispatcher
     * @constructor
     * @static
     */
    function AjaxEvent () {}

    /**
     * @const COMPLETE
     * @type {string}
     * @static
     */
    AjaxEvent.COMPLETE = "ajaxEventComplete";

    /**
     * @const ERROR
     * @type {string}
     * @static
     */
    AjaxEvent.ERROR = "ajaxEventERROR";

    var p = AjaxEvent.prototype;

    inazumatv.EventDispatcher.initialize( p );

    inazumatv.AjaxEvent = AjaxEvent;

}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/02/15 - 21:04
 *
 * Copyright (c) 2011-2014 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( window ){
    "use strict";
    var document = window.document
    ;

//    /**
//     * get parameter を取得します
//     * @class QuerySearch
//     * @constructor
//     */
//    function QuerySearch () {
//        throw "QuerySearch cannot be instantiated";
//    }

    /**
     * get parameter を取得します
     * @class QuerySearch
     * @type {{search: search}}
     * @static
     */
    window.inazumatv.QuerySearch = {
        /**
         * 指定Keyの値を取得します。
         * @for QuerySearch
         * @method search
         * @param {string} key_name 取得したいkey name
         * @returns {string} search value
         * @static
         */
        search: function ( key_name ){
            var query = window.location.search.substring( 1 ),
                vars = query.split( '&' ),
                result = "";

            for ( var i = 0, limit = vars.length; i < limit; i++ ) {
                var pair = vars[ i ].split( '=' );
                if ( decodeURIComponent( pair[ 0 ] ) === key_name ) {
                    result =  decodeURIComponent( pair[ 1 ] );
                    break;
                }
            }

            return result;
        },
        /**
         * get parameter を全て取得します。
         * ＊key=value形式のみです。
         *
         * @for QuerySearch
         * @method searchAll
         * @returns {object} key: value
         * @static
         */
        searchAll: function (){
            var query = window.location.search.substring( 1 ),
                vars = query.split( '&' ),
                result = {};

            for ( var i = 0, limit = vars.length; i < limit; i++ ) {
                var pair = vars[ i ].split( '=' );

                result[ decodeURIComponent( pair[ 0 ] ) ] = decodeURIComponent( pair[ 1 ] );
            }

            return result;
        }
    };
}( window ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/18 - 18:56
 *
 * Copyright (c) 2011-2014 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( window ){
    "use strict";
    var document = window.document,
        inazumatv = window.inazumatv,
        EventObject = inazumatv.EventObject,
        EventDispatcher = inazumatv.EventDispatcher;

    inazumatv.LoadImage = ( function (){
        /**
         * 画像を読み込みイベントを発火します
         * @class LoadImage
         * @uses EventDispatcher
         * @param path
         * @constructor
         */
        function LoadImage ( path ) {
            this._path = path;
        }

        /**
         * 画像読み込み完了イベント
         * @for LoadImage
         * @const COMPLETE
         * @static
         * @type {string}
         */
        LoadImage.COMPLETE = "load_image_complete";
        /**
         * 画像読み込みエラーイベント
         * @for LoadImage
         * @const ERROR
         * @static
         * @type {string}
         */
        LoadImage.ERROR = "load_image_error";

        var p = LoadImage.prototype;

        EventDispatcher.initialize( p );

        /**
         * 画像読み込みを開始します
         * @method load
         */
        p.load = function () {
            var path = this._path,
                img = new Image(),
                _this = this,
                modern = typeof document.addEventListener !== "undefined",
                done = false;

            console.log( "path ", path );
            function dispose () {
                if ( !modern && done ) {

                    return false;
                }

                if ( modern ) {
                    // modern browser
                    img.removeEventListener( "load", complete );
                    img.removeEventListener( "error", error );
                } else {
                    // legacy
                    img.detachEvent( "onload", complete );
                    img.detachEvent( "onerror", error );
                }

                return true;
            }

            function complete () {
                if ( !dispose() ) {

                    return;
                }

                _this.dispatchEvent( new EventObject( LoadImage.COMPLETE, [ img ] ), _this );
            }

            function error () {
                if ( !dispose() ) {

                    return;
                }

                _this.dispatchEvent( new EventObject( LoadImage.ERROR, [ img ] ), _this );
            }

            if ( modern ) {
                // modern browser
                img.addEventListener( "load", complete, false );
                img.addEventListener( "error", error, false );
            } else {
                // legacy
                img.attachEvent( "onload", complete );
                img.attachEvent( "onerror", error );
            }

            img.src = path;
        };

        return LoadImage;
    }() );
}( window ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/18 - 21:07
 *
 * Copyright (c) 2011-2014 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( window ){
    "use strict";
    var inazumatv = window.inazumatv,
        LoadImage = inazumatv.LoadImage,
        EventObject = inazumatv.EventObject,
        EventDispatcher = inazumatv.EventDispatcher;

    inazumatv.BulkLoader = ( function (){
        /**
         * 複数画像を読み込みます
         * @class BulkLoader
         * @uses EventDispatcher
         * @param {Array} paths 画像パス配列
         * @constructor
         */
        function BulkLoader ( paths ) {
            this._paths = paths;
            this._connections = 6;
            this._boundLoad = this._load.bind( this );
            this._boundError = this._error.bind( this );
        }

        /**
         * 個別画像ロード完了時イベント
         * @const LOAD
         * @static
         * @type {string}
         */
        BulkLoader.LOAD = "bulk_loader_load";
        /**
         * 個別画像ロードエラー時イベント
         * @const ERROR
         * @static
         * @type {string}
         */
        BulkLoader.ERROR = "bulk_loader_error";
        /**
         * 全画像ロード完了時イベント
         * @const COMPLETE
         * @static
         * @type {string}
         */
        BulkLoader.COMPLETE = "bulk_loader_complete";

        var p = BulkLoader.prototype;

        EventDispatcher.initialize( p );

        /**
         * 接続数を設定します
         * @method setConnections
         * @param {int} n
         */
        p.setConnections = function ( n ) {
            this._connections = n;
        };

        /**
         * 読み込みを開始します
         * @method start
         */
        p.start = function () {
            var paths = this._paths,

                limit = this._connections,
                count = 0;

            this._loading = 0;

            while( paths.length > 0 ) {
                if ( count >=  limit ) {
                    // connections limit
                    break;
                }

                this._next();
                ++count;
            }
        };

        /**
         * @method _done
         * @private
         */
        p._done = function () {
            // all done
            this.dispatchEvent( new EventObject( BulkLoader.COMPLETE ), this );
        };

        /**
         * @method _next
         * @private
         */
        p._next = function () {
            // next load
            var paths = this._paths,
                path = paths.shift();

            this._get( path );
        };

        /**
         * @method _dispose
         * @param {LoadImage} target
         * @private
         */
        p._dispose = function ( target ) {

            target.removeEventListener( LoadImage.COMPLETE, this._boundLoad );
            target.removeEventListener( LoadImage.ERROR, this._boundError );
        };

        /**
         * @method _load
         * @param {EventObject} e
         * @private
         */
        p._load = function ( e ) {
            this._dispose( e.target );

            this.dispatchEvent( new EventObject( BulkLoader.LOAD, e.params ) );

            this._check();
        };

        /**
         * @method _error
         * @param {EventObject} e
         * @private
         */
        p._error = function ( e ) {
            this._dispose( e.target );

            this.dispatchEvent( new EventObject( BulkLoader.ERROR, e.params ) );

            this._check();
        };

        /**
         * @method _check
         * @private
         */
        p._check = function () {
            var paths = this._paths;



            --this._loading;

            if ( this._loading <= 0 ) {

                if ( paths.length > 0 ) {
                    // next image
                    this._next();
                } else {
                    // all done
                    this._done();
                }
            }
        };

        /**
         * @method _get
         * @param {string} path
         * @private
         */
        p._get = function ( path ) {
            var loader;

            loader = new LoadImage( path );
            loader.addEventListener( LoadImage.COMPLETE, this._boundLoad );
            loader.addEventListener( LoadImage.ERROR, this._boundError );

            ++this._loading;
            loader.load();
        };

        return BulkLoader;
    }() );

}( window ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/13 - 17:28
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( inazumatv ){
    "use strict";

    /**
     * 複数の処理が終了しているのかを管理するときなどに使用します
     * @class CheckList
     * @param {Array.<String>} list [key:String...]
     * @constructor
     */
    function CheckList ( list ) {
        /**
         *
         * check用list
         * @property _checkList
         * @type {null|{}}
         * @private
         */
        this._checkList = null;
        this.reset( list );
    }

    var p = CheckList.prototype;

    /**
     * 管理用配列を再生成します
     * @method reset
     * @param {Array.<String>} list [key:String...]
     */
    p.reset = function ( list ) {
        var checkList = {},
            i = 0,
            limit = list.length;

        for ( ; i < limit; i++ ) {

            checkList[ list[ i ] ] = false;
        }

        this._checkList = checkList;
    };

    /**
     * 引数keyの値をtrueにし、全てtrueかどうかを返します
     * @method clear
     * @param {string} key
     * @return {Boolean} true: 全てtrue, false: falseが含まれている
     */
    p.clear = function ( key ) {
        var checkList = this._checkList;

        // keyがなければ処理しない
        if ( checkList.hasOwnProperty( key ) ) {

            checkList[ key ] = true;
            return this._isAllClear();
        } else {
            return false;
        }
    };

    /**
     * 全てtrueかどうかを調べます
     * @method _isAllClear
     * @return {boolean} true: 全てtrue, false: falseが含まれている
     * @private
     */
    p._isAllClear = function (){
        var checkList = this._checkList,
            result = true;

        for ( var key in checkList ) {

            if ( checkList.hasOwnProperty( key ) ) {

                result = checkList[ key ];

                if ( !result ) {
                    // falseが見つかれば処理しない
                    break;
                }
            }
        }

        // valueが全てtrueの時は処理済み: true
        return result;
    };

    inazumatv.CheckList = CheckList;

}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/13 - 19:11
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * require EventDispatcher, EventObject
 */

( function ( window, inazumatv ){
    "use strict";

    var requestAnimationFrame = window.requestAnimationFrame,
        cancelRequestAnimationFrame = window.cancelRequestAnimationFrame,

        EventDispatcher = inazumatv.EventDispatcher,
        EventObject = inazumatv.EventObject;

    // ---------------------------------------------------
    //  LoopManager
    // ---------------------------------------------------
    var _instanceLoopManager,
        _eventObj,
        _loopId,
        _this;

    /**
     * ループ処理内部関数
     * @for LoopManager
     * @method _loop
     * @private
     */
    function _loop () {
        _loopId = requestAnimationFrame( _loop );
        _instanceLoopManager.dispatchEvent( _eventObj, _this );
    }

    /**
     * Browser default loop(60fps) 毎に dispatchEvent します
     *
     *      var loopInstance =  LoopManager.getInstance();
     *
     *      function onEnterFrame () {
     *          // do something
     *      }
     *
     *      loopInstance.addEventListener( LoopManager.ENTER_FRAME, onEnterFrame );
     *
     * @class LoopManager
     * @uses EventDispatcher
     * @returns {LoopManager} LoopManager instance
     * @constructor
     */
    function LoopManager () {
        if ( typeof _instanceLoopManager !== "undefined" ) {

            return _instanceLoopManager;
        }

        _this = this;
        this._started = false;
        _eventObj = new EventObject( LoopManager.ENTER_FRAME, [] );

        _instanceLoopManager = this;
        return _instanceLoopManager;
    }

    /**
     * @static
     * @method getInstance
     * @returns {LoopManager} LoopManager instance
     */
    LoopManager.getInstance = function (){
        if ( typeof _instanceLoopManager === "undefined" ) {

            _instanceLoopManager = new LoopManager();
        }

        return _instanceLoopManager;
    };

    /**
     * event type
     * @const ENTER_FRAME
     * @type {string}
     * @static
     */
    LoopManager.ENTER_FRAME = "loopManagerEnterFrame";

    var p = LoopManager.prototype;

    EventDispatcher.initialize( p );

    /**
     * ループ処理を開始します
     * @method start
     */
    p.start = function (){
        if ( !this._started ) {

            _loop();
            this._started = true;
        }
    };

    /**
     * ループ処理を停止します
     * @method stop
     */
    p.stop = function (){
        cancelRequestAnimationFrame( _loopId );
        this._started = false;
    };

    inazumatv.LoopManager = LoopManager;

}( window.self, this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/13 - 17:42
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * require EventDispatcher, EventObject
 */
( function ( inazumatv ){
    "use strict";

    var EventDispatcher = inazumatv.EventDispatcher,
        EventObject = inazumatv.EventObject,

        LoopManager = inazumatv.LoopManager;

    /**
     * 経過時間を管理します
     * <h4>Example</h4>
     * [1]
     * update()の戻り値で判定
     * <br>make instance
     *
     *      var polling1 = new PollingManager( 1000 );
     *      polling1.start();
     *
     * check inside some loop function
     *
     *      function loop () {
     *         requestAnimationFrame( loop );
     *         if ( polling1.update() ) {
     *           // after 1 sec.
     *           // do something
     *         }
     *      }
     *
     *      loop();
     *
     * [2]
     * addEventListener を使う別の方法
     * <br>make instance
     *
     *      var polling1 = new PollingManager( 1000 );
     *      polling1.start();
     *
     *
     * check inside some loop function
     *
     *      function eventHandler () {
     *           // after 1 sec.
     *           // do something
     *      }
     *      polling1.addEventListener( PollingManager.POLLING_PAST, eventHandler );
     *      function loop () {
     *           requestAnimationFrame( loop );
     *           polling1.update()
     *      }
     *
     *      loop();
     *
     * @class PollingManager
     * @uses EventDispatcher
     * @param {Number} ms milliseconds 指定
     * @constructor
     */
    function PollingManager ( ms ) {
        this._startTime = 0;
        this._polling = ms;
        this._eventObj = new EventObject( PollingManager.POLLING_PAST );
        this._boundEnterFrame = this._onEnterFrame.bind( this );
    }

    /**
     * event type
     * @const POLLING_PAST
     * @type {string}
     * @static
     */
    PollingManager.POLLING_PAST = "pollingManagerPollingPast";

    var p = PollingManager.prototype;

    // mixin
    EventDispatcher.initialize( p );

    /**
     * _startTime を初期化します
     * @method _resetTime
     * @private
     */
    p._resetTime = function () {
        this._startTime = new Date().getTime();
    };

    /**
     * pollingを開始します
     * @method start
     * @param {boolean=false} [auto] automatic loop flag
     */
    p.start = function ( auto ) {
        auto = !!auto;

        if ( auto ) {

            var loop = LoopManager.getInstance(),
                boundEnterFrame = this._boundEnterFrame;

            this._loop = loop;

            loop.addEventListener( LoopManager.ENTER_FRAME, boundEnterFrame );
            loop.start();

        }

        this._resetTime();
    };

    /**
     * @method stop
     */
    p.stop = function () {
        var loop = this._loop;

        if ( typeof loop !== "undefined" ) {

            loop.removeEventListener( LoopManager.ENTER_FRAME, this._boundEnterFrame );
            this._loop = null;
        }

        this._startTime = Number.MAX_VALUE;
    };

    /**
     * polling間隔を変更します
     * @method change
     * @param {Number} ms milliseconds 指定
     */
    p.change = function ( ms ){
        this._startTime = 0;
        this._polling = ms;
//        this.start();
        this._resetTime();
    };

    /**
     * pollingに達した場合は PollingManager.POLLING_PAST を発火します
     * @method update
     * @returns {boolean} pollingに達した場合はtrueを返します
     */
    p.update = function (){
        var now = new Date().getTime(),
            bool = false,
            _this = this;

        if ( ( now - this._startTime ) >= this._polling ) {

            this._startTime = now;
            bool = true;

            setTimeout( function (){
                _this.dispatchEvent( _this._eventObj, _this );
            }, 0 );
        }

        return bool;
    };

    /**
     * update 関数を破棄します
     * @method destroy
     */
    p.destroy = function (){
        this.update = function (){};
    };

    /**
     * loop ENTER_FRAME Event Handler
     * @method _onEnterFrame
     * @private
     */
    p._onEnterFrame = function (){
        this.update();
    };

    inazumatv.PollingManager = PollingManager;

}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/13 - 18:40
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * require EventDispatcher, EventObject
 */

( function ( inazumatv ){
    "use strict";

    var LoopManager = inazumatv.LoopManager,
        EventDispatcher = inazumatv.EventDispatcher,
        EventObject = inazumatv.EventObject;

    /**
     * FPSを管理します
     *
     *      // 1.auto
     *      var fps24 = new FPSManager( 24 );
     *
     *      function eventHandler () {
     *          // do something
     *      }
     *      fps24.addEventListener( FPSManager.FPS_FRAME, eventHandler );
     *      fps24.start();
     *
     *      // 2.manual
     *      var fps24 = new FPSManager( 24, true );
     *
     *      function eventHandler () {
     *      }
     *      fps24.addEventListener( FPSManager.FPS_FRAME, eventHandler );
     *
     *      function loop () {
     *          requestAnimationFrame( loop );
     *          if ( fps24.update() ) {
     *              // do something
     *          }
     *      }
     *
     *      loop();
     *      ps24.start();
     *
     * @class FPSManager
     * @uses EventDispatcher
     * @param {int} fps frame rate 指定（整数）
     * @param {Boolean} [manual] abort auto start, default: false
     * @constructor
     */
    function FPSManager ( fps, manual ) {
        this.setFPS( fps );
        this._manualStart = !!manual;
        this._eventObj = new EventObject( FPSManager.FPS_FRAME, [] );
        this._loop = LoopManager.getInstance();
        this._boundEnterFrame = this._onEnterFrame.bind( this );
    }

    /**
     * event type
     * @const FPS_FRAME
     * @type {string}
     * @static
     */
    FPSManager.FPS_FRAME = "fpsManagerFpsFrame";

    var p = FPSManager.prototype;

    // mixin
    EventDispatcher.initialize( p );

    /**
     * @method getLoopManager
     * @returns {LoopManager} LoopManager instance
     */
    p.getLoopManager = function (){
        return this._loop;
    };

    /**
     * _startTime を初期化します
     * @method _resetTime
     * @private
     */
    p._resetTime = function () {
        this._startTime = new Date().getTime();
    };

    /**
     * FPS監視を開始します
     * @method start
     */
    p.start = function (){
        if ( !this._manualStart ) {
            // no manual
            this.setFPS( this._fps );
            this._loop.addEventListener( LoopManager.ENTER_FRAME, this._boundEnterFrame );
            this._loop.start();
        }

        this._resetTime();
    };

    /**
     * FPS監視を停止します
     * @method stop
     */
    p.stop = function (){
        if ( !this._manualStart ) {
            // no manual
            this._loop.removeEventListener( LoopManager.ENTER_FRAME, this._boundEnterFrame );
        }
        this._polling = Number.MAX_VALUE;
    };

    /**
     * FPS監視を復活します
     * @method restore
     */
    p.restore = function (){
        this.changeFPS( this._fps );
    };

    /**
     * update 関数を破棄します
     * @method destroy
     */
    p.destroy = function (){
        this.update = function (){};
    };

    /**
     * FPS値を設定します
     * @method setFPS
     * @param {int} fps frame rate 指定（整数）
     */
    p.setFPS = function ( fps ){
        this._startTime = 0;
        this._polling = 1000 / fps;
        this._fps = fps;
    };

    /**
     * FPS値を変更します
     * @method changeFPS
     * @param {int} fps frame rate 指定（整数）
     */
    p.changeFPS = function ( fps ){
        this.setFPS( fps );
//        this.start();
        this._resetTime();
    };

    /**
     * @method getFPS
     * @returns {int|*} 現在のFPSを返します
     */
    p.getFPS = function (){
        return this._fps;
    };

    /**
     * @method update
     * @returns {boolean} FPSに達した場合はtrueを返します
     */
    p.update = function (){
        var now = new Date().getTime(),
            bool = false,
            _this = this;

        if ( ( now - _this._startTime ) >= _this._polling ) {

            _this._startTime = now;
            bool = true;

            setTimeout( function (){
                _this.dispatchEvent( _this._eventObj );
            }, 0 );
        }

        return bool;
    };

    /**
     * loop ENTER_FRAME Event Handler
     * @method _onEnterFrame
     * @private
     */
    p._onEnterFrame = function (){
        this.update();
    };

    inazumatv.FPSManager = FPSManager;

}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/18 - 19:08
 *
 * Copyright (c) 2011-2014 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( window ){
    "use strict";
    var inazumatv = window.inazumatv;

    inazumatv.List = ( function (){
        /**
         * Array ヘルパー
         * @class List
         * @constructor
         */
        function List () {
            throw new Error( "List can't create instance" );
        }

        var l = List;

        // http://stackoverflow.com/questions/1295584/most-efficient-way-to-create-a-zero-filled-javascript-array
        // http://jsperf.com/zerofill-2d-array
        /**
         * word で埋められた配列を length 分作成します
         * @method word
         * @static
         * @param {int} length
         * @param {int|string} word
         * @returns {Array}
         */
        l.word = function ( length, word ) {
            var arr = [], i;

            for ( i = 0; i < length; i++ ) {
                arr[ i ] = word;
            }

            return arr;
        };

        /**
         * 0 で埋められた配列を length 分作成します
         * @method zero
         * @static
         * @param {int} length
         * @returns {Array}
         */
        l.zero = function ( length ) {
            return this.word( length, 0 );
        };

        /**
         * 配列をシャッフルします
         * @method shuffle
         * @static
         * @param {array} array
         * @returns {Array} シャッフル後の配列を返します
         */
        l.shuffle = function ( array ) {
            return inazumatv.shuffle( array );
        };

        /**
         * 配列内の最大数値を返します
         * @method max
         * @static
         * @param {Array} arr 検証対象の配列、内部は全部数値 [Number, [Number]]
         * @returns {number} 配列内の最大数値を返します
         */
        l.max = function ( arr ) {
            inazumatv.maxValue( arr );
        };

        return List;
    }() );

}( window ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/18 - 19:22
 *
 * Copyright (c) 2011-2014 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( window ){
    "use strict";
    var inazumatv = window.inazumatv;

    inazumatv.Kana = ( function (){
        // http://d.hatena.ne.jp/favril/20090514/1242280476
        /**
         * 日本語文字判定 Utility
         * @class Kana
         * @constructor
         */
        function Kana () {
            throw new Error( "Kana can't create instance!" );
        }

        var k = Kana;

        /**
         * @method kanji
         * @static
         * @param {string} txt 判定文字列
         * @returns {boolean} 漢字かどうかの真偽値を返します
         */
        k.kanji = function ( txt ) {
            var unicode = txt.charCodeAt( 0 );

            return (
                // CJK統合漢字
                ( unicode >= 0x4e00 && unicode <= 0x9fcf ) ||
                // CJK統合漢字拡張A
                ( unicode >= 0x3400  && unicode <= 0x4dbf)  ||
                // CJK統合漢字拡張B
                ( unicode >= 0x20000 && unicode <= 0x2a6df) ||
                // CJK互換漢字
                ( unicode >= 0xf900  && unicode <= 0xfadf)  ||
                // CJK互換漢字補助
                ( unicode >= 0x2f800 && unicode <= 0x2fa1f)
            );
        };

        /**
         * @method hiragana
         * @static
         * @param {string} txt 判定文字列
         * @returns {boolean} ひらがなか否かの真偽値を返します
         */
        k.hiragana = function ( txt ) {
            var unicode = txt.charCodeAt( 0 );

            return unicode >= 0x3040 && unicode <= 0x309f;
        };

        /**
         * @method kana
         * @static
         * @param {string} txt 判定文字列
         * @returns {boolean} カナか否かの真偽値を返します
         */
        k.kana = function ( txt ) {
            var unicode = txt.charCodeAt( 0 );

            return unicode >= 0x30a0 && unicode <= 0x30ff;
        };

        /**
         * @method han
         * @static
         * @param {string} txt 判定文字列
         * @returns {boolean} 半角文字か否かの真偽値を返します
         */
        k.han = function ( txt ) {
            var unicode = txt.charCodeAt( 0 );

            return unicode >= 0xff61 && unicode <= 0xff9f;
        };

        /**
         * @method zen
         * @static
         * @param {string} txt 判定文字列
         * @returns {boolean} 全角か否かの真偽値を返します
         */
        k.zen = function ( txt ) {
            return k.kanji( txt ) || k.hiragana( txt ) || k.kana( txt );
        };

        //http://stackoverflow.com/questions/2450641/validating-alphabetic-only-string-in-javascript
        /**
         * @method alphabetic
         * @static
         * @param {string} txt 判定文字列
         * @returns {boolean} アルファベットか否かの真偽値を返します、スペースはfalseです
         */
        k.alphabetic = function ( txt ) {
            return /^[a-zA-Z]+$/.test( txt );
        };

        return Kana;
    }() );

}( window ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/13 - 16:58
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
/**
 * ShuffleText by Yasunobu Ikeda. Feb 3, 2012
 * Visit http://clockmaker.jp/ for documentation, updates and examples.
 *
 *
 * Copyright (c) 2012 Yasunobu Ikeda
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
// -----------------------------------
//  original code by clockMaker's  ShuffleText.js
//  http://clockmaker.jp/blog/2012/02/html5_shuffletext/
//
//  modified by (at)taikiken
// -----------------------------------
( function ( inazumatv ){
    "use strict";

    var rand = Math.random,
        floor = Math.floor,

        FPSManager = inazumatv.FPSManager;

    /**
     * テキストをシャッフルし表示します
     * @class ShuffleText
     * @constructor
     */
    function ShuffleText () {
        this._boundUpdate = this.update.bind( this );
        this._fps = new FPSManager( 60 );
    }

    var p = ShuffleText.prototype;

    /**
     * @method initialize
     * @param {*} element DOMElement
     */
    p.initialize = function ( element ){
        this._element = element;
    };

    /**
     * ランダムテキストに用いる文字列
     * @property sourceRandomCharacter
     * @type {string}
     * @default ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890
     * */
    p.sourceRandomCharacter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    p.setRandomChar = function ( randomChar ){
        this.sourceRandomCharacter = randomChar;
    };
    /**
     * 空白に用いる文字列
     * @property emptyCharacter
     * @type {string}
     * @default "*"
     * */
    p.emptyCharacter = "*";
    /**
     * フレームレート
     * @property fps
     * @type {Number}
     * @default 60
     * */
    p.fps = 60;
    /**
     * 再生中かどうかを示すブール値
     * @property isRunning
     * @type {boolean}
     * */
    p.isRunning = false;
    /**
     * エフェクトの実行時間(millisecond)
     * @property duration
     * @type {Number}
     * @default 500 (500ms)
     * */
    p.duration = 500;

    /**
     * @method setDuration
     * @param {Number} ms millisecond
     */
    p.setDuration = function ( ms ){
        this.duration = ms;
    };

    p._originalStr = "";
    p._originalLength = "";
    p._intervalId = 0;
    p._timeCurrent = 0;
    p._timeStart = 0;
    p._randomIndex = [];

    /**
     * テキストを設定します。
     * @method setText
     * @param {string} text
     */
    p.setText = function ( text ) {
        this._originalStr = text;
        this._originalLength = text.length;
    };

    /**
     *
     * 再生を開始します。
     * @method start
     * @param {boolean=false} [is_keep]
     * */
    p.start = function ( is_keep ) {
        var element = this._element;

        if (typeof element === "undefined") {
            return;
        }

        is_keep = !!is_keep;

        this._keep = is_keep;

        if ( this.isRunning ) {
            this.stop( true );
        }

        this._randomIndex = [];

        var str = "",
            random_index = this._randomIndex,
            empty_char = this.emptyCharacter,
            origin_length = this._originalLength;

        this._endStr = this._originalStr;

        for ( var i = 0; i < origin_length; i++ ) {

            var rate = i / origin_length;

            random_index[ i ] = rand() * ( 1 - rate ) + rate;

            str += empty_char;
        }

        var _fps = this._fps;

        _fps.changeFPS( this.fps );
        _fps.addEventListener( FPSManager.FPS_FRAME, this._boundUpdate );

        this.isRunning = true;

        if ( !is_keep ) {
            element.innerHTML = str;
        }

        this._timeStart = new Date().getTime();
        _fps.start();
    };

    /**
     * 停止します。
     * @method stop
     * */
    p.stop = function ( strong ) {
        strong = !!strong;

        if ( this.isRunning ) {

            this._fps.removeEventListener( FPSManager.FPS_FRAME, this._boundUpdate );
            this._fps.stop();

            if ( strong ) {

                this._element.innerHTML = this._endStr;
            }
        }

        this.isRunning = false;
    };

    /**
     *
     * @method update
     */
    p.update = function () {
        var timeCurrent = new Date().getTime() - this._timeStart,
            percent = timeCurrent / this.duration,
            random_index = this._randomIndex,
            origin_str = this._originalStr,
            empty_char = this.emptyCharacter,
            random_char = this.sourceRandomCharacter,
            random_char_length = random_char.length,
            is_keep = this._keep;

        var str = "";
        for ( var i = 0, limit = this._originalLength; i < limit; i++ ) {

            if ( percent >= random_index[ i ] ) {

                str += origin_str.charAt(i);

            } else {
                if ( !is_keep ) {
                    if ( percent < random_index[ i ] / 3 ) {

                        str += empty_char;
                    } else {

                        str += random_char.charAt( floor( rand() * ( random_char_length ) ) );
                    }
                } else {

                    if ( percent < random_index[ i ] / 3 ) {

                        str += origin_str.charAt(i);
                    } else {

                        str += random_char.charAt( floor( rand() * ( random_char_length ) ) );
                    }
                }
            }
        }

        this._element.innerHTML = str;
        this.onChange( str );

        if ( percent > 1 ) {

            this.stop( true );
            this.onComplete();
        }
    };

    /**
     * shuffle 終了 callback 関数, override して使用します
     * @method onComplete
     */
    p.onComplete = function () {

    };

    /**
     * shuffle update callback 関数, override して使用します
     * @method onChange
     * @param {string} str 変更された文字
     */
    p.onChange = function ( str ) {

    };

    inazumatv.ShuffleText = ShuffleText;

}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/13 - 21:12
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( inazumatv ){
    "use strict";

    inazumatv.jq = inazumatv.jq || {};
    var ExternalJQ = inazumatv.jq.ExternalJQ  = inazumatv.jq.ExternalJQ || {};

    /**
     * jQuery Object 設定します。<br>
     * imports, exports を行う前に実行します。
     *
     *     inazumatv.jq.ExternalJQ.save( jQuery );
     *
     * @for jq.ExternalJQ
     * @method save
     * @param {jQuery} jQuery global jQuery Object
     * @static
     */
    ExternalJQ.save = function ( jQuery ){
        if ( typeof jQuery === "undefined" || jQuery === null ) {
            // jQuery defined
            throw "set first global jQuery object";
        } else {
            this._$ = jQuery;
            inazumatv.eventStop = eventStop;
        }
    };

    /**
     * jQuery Object を取得します。
     *
     *     var $ = inazumatv.jq.ExternalJQ.exports();
     *
     * @for jq.ExternalJQ
     * @method exports
     * @returns {jQuery} jQuery Object
     * @static
     */
    ExternalJQ.exports = function (){
        return this._$;
    };

    /**
     * jQuery plugin を活性化させます。<br>
     *
     *     inazumatv.jq.ExternalJQ.save( jQuery );
     *     inazumatv.jq.ExternalJQ.install( "Easing" );
     *
     *     // あるいは
     *     inazumatv.jq.ExternalJQ.install( "Easing", jQuery );
     *
     * @for jq.ExternalJQ
     * @method install
     * @param {String} pluginName プラグイン名称
     * @param {jQuery} [jQuery] jQuery Object
     * @static
     */
    ExternalJQ.install = function ( pluginName, jQuery ){
        if ( typeof jQuery !== "undefined" && jQuery !== null ) {
            //  defined
            this.save( jQuery );
        }
        inazumatv.jq[ pluginName ].activate( this._$ );
    };

    /**
     * 拡張機能を取得します。<br>
     *
     *     inazumatv.jq.ExternalJQ.save( jQuery );
     *     var FitWindowHeight = inazumatv.jq.ExternalJQ.imports( "FitWindowHeight" );
     *
     *     // あるいは
     *     var FitWindowHeight = inazumatv.jq.ExternalJQ.imports( "FitWindowHeight", jQuery );
     *
     * @for jq.ExternalJQ
     * @method imports
     * @param {String} extensionName 拡張機能名称(Class名)
     * @param {jQuery} [jQuery] jQuery Object
     * @returns {*} 拡張機能を返します
     * @static
     */
    ExternalJQ.imports = function ( extensionName, jQuery ){
        if ( typeof jQuery !== "undefined" && jQuery !== null ) {
            //  defined
            this.save( jQuery );
        }
        var extension = inazumatv.jq[ extensionName ];
        extension.activate( this._$ );
        return extension;
    };

    /**
     * event バブリングと伝播を止めます。<br>
     * <strong style="color:red;">注意</strong> jQuery Object を save 後に使用できます。
     *
     *      ExternalJQ.save( jQuery )
     *
     *      // preventDefault() && topPropagation()
     *      function eventHandler ( e ) {
     *          inazumatv.eventStop( e );
     *      }
     *
     *      // preventDefault()
     *      function eventHandler ( e ) {
     *          inazumatv.eventStop( e, false );
     *      }
     *
     * @for inazumatv
     * @method eventStop
     * @param {Event} e jQuery event instance
     * @param {*\Boolean} [propagation] optional, default true
     */
    function eventStop ( e, propagation ){
        if ( typeof propagation === 'undefined' || propagation === null ) {
            // undefined or null
            propagation = true;
        }

        e.preventDefault();

        if ( propagation ) {
            e.stopPropagation();
        }
    }

    inazumatv.jq.ExternalJQ = ExternalJQ;

}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/14 - 18:59
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( inazumatv ){
    "use strict";

    /**
     * @class Easing
     * @constructor
     * @static
     */
    var Easing = function () {
        throw "Easing cannot be instantiated";
    };

    /**
     * jQuery.easing 拡張 easing
     * quart
     * easeInQuad
     * easeOutQuad
     * easeInOutQuad
     * easeInCubic
     * easeOutCubic
     * easeInOutCubic
     * easeInQuart
     * easeOutQuart
     * easeInOutQuart
     * easeInQuint
     * easeOutQuint
     * easeInOutQuint
     * easeInSine
     * easeOutSine
     * easeInOutSine
     * easeInExpo
     * easeOutExpo
     * easeInOutExpo
     * easeInCirc
     * easeOutCirc
     * easeInOutCirc
     * easeInElastic
     * easeOutElastic
     * easeInOutElastic
     * easeInBack
     * easeOutBack
     * easeInOutBack
     * easeInBounce
     * easeOutBounce
     * easeInOutBounce
     *
     * @type {{activate: Function}}
     */
    Easing = {
        /**
         * Easing plugin を活性化します
         * @method activate
         * @param {jQuery} jQuery
         * @static
         */
        activate: function ( jQuery ){
            var je = jQuery.easing;
            je.quart = function (x, t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b;
            };
            je.easeInQuad = function (x, t, b, c, d) {
                return c*(t/=d)*t + b;
            };
            je.easeOutQuad = function (x, t, b, c, d) {
                return -c *(t/=d)*(t-2) + b;
            };
            je.easeInOutQuad = function (x, t, b, c, d) {
                if ((t /= d/2) < 1) {return c/2*t*t + b;}
                return -c/2 * ((--t)*(t-2) - 1) + b;
            };
            je.easeInCubic = function (x, t, b, c, d) {
                return c*(t/=d)*t*t + b;
            };
            je.easeOutCubic = function (x, t, b, c, d) {
                return c*((t=t/d-1)*t*t + 1) + b;
            };
            je.easeInOutCubic = function (x, t, b, c, d) {
                if ((t /= d/2) < 1) {return c/2*t*t*t + b;}
                return c/2*((t-=2)*t*t + 2) + b;
            };
            je.easeInQuart = function (x, t, b, c, d) {
                return c*(t/=d)*t*t*t + b;
            };
            je.easeOutQuart = function (x, t, b, c, d) {
                return -c * ((t=t/d-1)*t*t*t - 1) + b;
            };
            je.easeInOutQuart = function (x, t, b, c, d) {
                if ((t /= d/2) < 1) {return c/2*t*t*t*t + b;}
                return -c/2 * ((t-=2)*t*t*t - 2) + b;
            };
            je.easeInQuint = function (x, t, b, c, d) {
                return c*(t/=d)*t*t*t*t + b;
            };
            je.easeOutQuint = function (x, t, b, c, d) {
                return c*((t=t/d-1)*t*t*t*t + 1) + b;
            };
            je.easeInOutQuint = function (x, t, b, c, d) {
                if ((t /= d/2) < 1) {return c/2*t*t*t*t*t + b;}
                return c/2*((t-=2)*t*t*t*t + 2) + b;
            };
            je.easeInSine = function (x, t, b, c, d) {
                return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
            };
            je.easeOutSine = function (x, t, b, c, d) {
                return c * Math.sin(t/d * (Math.PI/2)) + b;
            };
            je.easeInOutSine = function (x, t, b, c, d) {
                return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
            };
            je.easeInExpo = function (x, t, b, c, d) {
                return (t===0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
            };
            je.easeOutExpo = function (x, t, b, c, d) {
                return (t===d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
            };
            je.easeInOutExpo = function (x, t, b, c, d) {
                if (t===0) {return b;}
                if (t===d) {return b+c;}
                if ((t /= d/2) < 1) {return c/2 * Math.pow(2, 10 * (t - 1)) + b;}
                return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
            };
            je.easeInCirc = function (x, t, b, c, d) {
                return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
            };
            je.easeOutCirc = function (x, t, b, c, d) {
                return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
            };
            je.easeInOutCirc = function (x, t, b, c, d) {
                if ((t /= d/2) < 1) {return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;}
                return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
            };
            je.easeInElastic = function (x, t, b, c, d) {
                var s=1.70158,p= 0,a=c;
                if (t===0) {return b;}
                if ((t/=d)===1) {return b+c;}
                if (!p) {p=d*0.3;}
                if (a < Math.abs(c)) { a=c;s=p/4; }
                else {
                    s = p/(2*Math.PI) * Math.asin (c/a);
                    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
                }
            };
            je.easeOutElastic = function (x, t, b, c, d) {
                var s=1.70158,p= 0,a=c;
                if (t===0) {return b; }
                if ((t/=d)===1) {return b+c;}
                if (!p) {p=d*0.3;}
                if (a < Math.abs(c)) { a=c; s=p/4; }
                else { s = p/(2*Math.PI) * Math.asin (c/a);
                    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;}
            };
            je.easeInOutElastic = function (x, t, b, c, d) {
                var s=1.70158,p=0,a=c;
                if (t===0) {return b;}
                if ((t /= d/2)===2) {return b+c;}
                if (!p) {p=d*(0.3*1.5);}
                if (a < Math.abs(c)) { a=c;s=p/4; }
                else {
                    s = p/(2*Math.PI) * Math.asin (c/a);
                    if (t < 1) {return -0.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;}
                    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
                }
            };
            je.easeInBack = function (x, t, b, c, d, s) {
                if (s === undefined) {s = 1.70158;}
                return c*(t/=d)*t*((s+1)*t - s) + b;
            };
            je.easeOutBack = function (x, t, b, c, d, s) {
                if (s === undefined) {s = 1.70158;}
                return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
            };
            je.easeInOutBack = function (x, t, b, c, d, s) {
                if (s === undefined) {s = 1.70158; }
                if ((t /= d/2) < 1) {return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;}
                return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
            };
            je.easeInBounce = function (x, t, b, c, d) {
                return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
            };
            je.easeOutBounce = function (x, t, b, c, d) {
                if ((t/=d) < (1/2.75)) {
                    return c*(7.5625*t*t) + b;
                } else if (t < (2/2.75)) {
                    return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
                } else if (t < (2.5/2.75)) {
                    return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
                } else {
                    return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
                }
            };
            je.easeInOutBounce = function (x, t, b, c, d) {
                if (t < d/2) {return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * 0.5 + b;}
                return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * 0.5 + c * 0.5 + b;
            };
        }
    };

    inazumatv.jq.Easing = Easing;
}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/17 - 17:55
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
/**
 * Smooth Scroll - v1.4.13 - 2013-11-02
 * https://github.com/kswedberg/jquery-smooth-scroll
 * Copyright (c) 2013 Karl Swedberg
 * Licensed MIT (https://github.com/kswedberg/jquery-smooth-scroll/blob/master/LICENSE-MIT)
 */
( function ( inazumatv ){
    "use strict";

    /**
     * @class SmoothScroll
     * @constructor
     * @static
     */
    var SmoothScroll = function () {
        throw "SmoothScroll cannot be instantiated";
    };

    /**
     * SmoothScroll plugin を活性化します
     * @method activate
     * @param {jQuery} jQuery
     * @static
     */
    SmoothScroll.activate = function ( jQuery ){
        var $ = jQuery;

        var version = '1.4.13',
            optionOverrides = {},
            defaults = {
                exclude: [],
                excludeWithin:[],
                offset: 0,

                // one of 'top' or 'left'
                direction: 'top',

                // jQuery set of elements you wish to scroll (for $.smoothScroll).
                //  if null (default), $('html, body').firstScrollable() is used.
                scrollElement: null,

                // only use if you want to override default behavior
                scrollTarget: null,

                // fn(opts) function to be called before scrolling occurs.
                // `this` is the element(s) being scrolled
                beforeScroll: function() {},

                // fn(opts) function to be called after scrolling occurs.
                // `this` is the triggering element
                afterScroll: function() {},
                easing: 'swing',
                speed: 400,

                // coefficient for "auto" speed
                autoCoefficent: 2,

                // $.fn.smoothScroll only: whether to prevent the default click action
                preventDefault: true
            },

            getScrollable = function(opts) {
                var scrollable = [],
                    scrolled = false,
                    dir = opts.dir && opts.dir === 'left' ? 'scrollLeft' : 'scrollTop';

                this.each(function() {

                    if (this === document || this === window) { return; }
                    var el = $(this);
                    if ( el[dir]() > 0 ) {
                        scrollable.push(this);
                    } else {
                        // if scroll(Top|Left) === 0, nudge the element 1px and see if it moves
                        el[dir](1);
                        scrolled = el[dir]() > 0;
                        if ( scrolled ) {
                            scrollable.push(this);
                        }
                        // then put it back, of course
                        el[dir](0);
                    }
                });

                // If no scrollable elements, fall back to <body>,
                // if it's in the jQuery collection
                // (doing this because Safari sets scrollTop async,
                // so can't set it to 1 and immediately get the value.)
                if (!scrollable.length) {
//                    this.each(function(index) {
                    this.each(function() {
                        if (this.nodeName === 'BODY') {
                            scrollable = [this];
                        }
                    });
                }

                // Use the first scrollable element if we're calling firstScrollable()
                if ( opts.el === 'first' && scrollable.length > 1 ) {
                    scrollable = [ scrollable[0] ];
                }

                return scrollable;
            },
            isTouch = 'ontouchend' in document;

        $.fn.extend({
            scrollable: function(dir) {
//                var scrl = getScrollable.call(this, {dir: dir});
//                return this.pushStack(scrl);
                return this.pushStack(getScrollable.call(this, {dir: dir}));
            },
            firstScrollable: function(dir) {
//                var scrl = getScrollable.call(this, {el: 'first', dir: dir});
//                return this.pushStack(scrl);
                return this.pushStack(getScrollable.call(this, {el: 'first', dir: dir}));
            },

            smoothScroll: function(options, extra) {
                options = options || {};

                if ( options === 'options' ) {
                    if ( !extra ) {
                        return this.first().data('ssOpts');
                    }
                    return this.each(function() {
                        var $this = $(this),
                            opts = $.extend($this.data('ssOpts') || {}, extra);

                        $(this).data('ssOpts', opts);
                    });
                }

                var opts = $.extend({}, $.fn.smoothScroll.defaults, options),
                    locationPath = $.smoothScroll.filterPath(location.pathname);

                this
                    .unbind('click.smoothscroll')
                    .bind('click.smoothscroll', function(event) {
                        var link = this,
                            $link = $(this),
                            thisOpts = $.extend({}, opts, $link.data('ssOpts') || {}),
                            exclude = opts.exclude,
                            excludeWithin = thisOpts.excludeWithin,
                            elCounter = 0, ewlCounter = 0,
                            include = true,
                            clickOpts = {},
                            hostMatch = ((location.hostname === link.hostname) || !link.hostname),
                            pathMatch = thisOpts.scrollTarget || ( $.smoothScroll.filterPath(link.pathname) || locationPath ) === locationPath,
                            thisHash = escapeSelector(link.hash);

                        if ( !thisOpts.scrollTarget && (!hostMatch || !pathMatch || !thisHash) ) {
                            include = false;
                        } else {
                            while (include && elCounter < exclude.length) {
                                if ($link.is(escapeSelector(exclude[elCounter++]))) {
                                    include = false;
                                }
                            }
                            while ( include && ewlCounter < excludeWithin.length ) {
                                if ($link.closest(excludeWithin[ewlCounter++]).length) {
                                    include = false;
                                }
                            }
                        }

                        if ( include ) {

                            if ( thisOpts.preventDefault ) {
                                event.preventDefault();
                            }

                            $.extend( clickOpts, thisOpts, {
                                scrollTarget: thisOpts.scrollTarget || thisHash,
                                link: link
                            });
                            $.smoothScroll( clickOpts );
                        }
                    });

                return this;
            }
        });

        $.smoothScroll = function(options, px) {
            if ( options === 'options' && typeof px === 'object' ) {
                return $.extend(optionOverrides, px);
            }
            var opts, $scroller, scrollTargetOffset, speed,
                scrollerOffset = 0,
                offPos = 'offset',
                scrollDir = 'scrollTop',
                aniProps = {},
                aniOpts = {},
                scrollprops = [];

            if (typeof options === 'number') {
                opts = $.extend({link: null}, $.fn.smoothScroll.defaults, optionOverrides);
                scrollTargetOffset = options;
            } else {
                opts = $.extend({link: null}, $.fn.smoothScroll.defaults, options || {}, optionOverrides);
                if (opts.scrollElement) {
                    offPos = 'position';
                    if (opts.scrollElement.css('position') === 'static') {
                        opts.scrollElement.css('position', 'relative');
                    }
                }
            }

            scrollDir = opts.direction === 'left' ? 'scrollLeft' : scrollDir;

            if ( opts.scrollElement ) {
                $scroller = opts.scrollElement;
                if ( !(/^(?:HTML|BODY)$/).test($scroller[0].nodeName) ) {
                    scrollerOffset = $scroller[scrollDir]();
                }
            } else {
                $scroller = $('html, body').firstScrollable(opts.direction);
            }

            // beforeScroll callback function must fire before calculating offset
            opts.beforeScroll.call($scroller, opts);

            scrollTargetOffset = (typeof options === 'number') ? options :
                px ||
                    ( $(opts.scrollTarget)[offPos]() &&
                        $(opts.scrollTarget)[offPos]()[opts.direction] ) ||
                    0;

            aniProps[scrollDir] = scrollTargetOffset + scrollerOffset + opts.offset;
            speed = opts.speed;

            // automatically calculate the speed of the scroll based on distance / coefficient
            if (speed === 'auto') {

                // if aniProps[scrollDir] == 0 then we'll use scrollTop() value instead
                speed = aniProps[scrollDir] || $scroller.scrollTop();

                // divide the speed by the coefficient
                speed = speed / opts.autoCoefficent;
            }

            aniOpts = {
                duration: speed,
                easing: opts.easing,
                complete: function() {
                    opts.afterScroll.call(opts.link, opts);
                }
            };

            if (opts.step) {
                aniOpts.step = opts.step;
            }

            if ($scroller.length) {
                $scroller.stop().animate(aniProps, aniOpts);
            } else {
                opts.afterScroll.call(opts.link, opts);
            }
        };

        $.smoothScroll.version = version;
        $.smoothScroll.filterPath = function(string) {
            return string
                .replace(/^\//,'')
                .replace(/(?:index|default).[a-zA-Z]{3,4}$/,'')
                .replace(/\/$/,'');
        };

        // default options
        $.fn.smoothScroll.defaults = defaults;

        function escapeSelector (str) {
            return str.replace(/(:|\.)/g,'\\$1');
        }
    };

    inazumatv.jq.SmoothScroll = SmoothScroll;

}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/15 - 3:07
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( inazumatv ){
    "use strict";
    var EventObject = inazumatv.EventObject,
        AjaxEvent = inazumatv.AjaxEvent,
        /**
         * jQuery alias
         * @property $
         * @type {jQuery}
         * @private
         * @static
         */
        $;

    /**
     * jQuery.ajax を使用しています。
     * 別途 jQuery を読み込んでください。<br><br>
     * ExternalJQ.import を使用し参照を取得します。
     *
     *      var XMLLoader = ExternalJQ.imports( "XMLLoader" );
     *      var xmlLoader = new XMLLoader( "path/to/example.xml" );
     *      function onComplete ( eventObject ) {
     *      }
     *      function onError ( eventObject ) {
     *      }
     *      xmlLoader.addEventListener( AjaxEvent.COMPLETE, onComplete );
     *      xmlLoader.addEventListener( AjaxEvent.ERROR, onError );
     *      xmlLoader.start();
     *
     * @class XMLLoader
     * @extends AjaxEvent
     * @param {String} url 指定URLのXMLを読込みます。
     * @param {Boolean|*} [nocache] no cache: true, default: true
     * @default true
     * @constructor
     */
    function XMLLoader ( url, nocache ) {
        if ( typeof url === "undefined" || url === null ) {
            // url defined
            throw "url required";
        }
        AjaxEvent.call( this );

        if ( typeof nocache === 'undefined' || nocache === null ) {
            // cache するかしないか
            this._nocache = true;
        } else {
            this._nocache = nocache;
        }

        this._url = url;
        this._type = "xml";
        this._option = {};
    }

    inazumatv.extend( AjaxEvent, XMLLoader );

    /**
     * XMLLoader へ jQuery object を設定。XMLLoader を使用する前に実行する必要があります。<br>
     * ExternalJQ.imports から実行されます。
     *
     * @method activate
     * @param {jQuery} jQuery object
     * @static
     */
    XMLLoader.activate = function ( jQuery ){
        $ = jQuery;
    };

    var p = XMLLoader.prototype;

    /**
     * 外部ファイル type 設定
     * @method setType
     * @param {String} type
     */
    p.setType = function ( type ){
        if ( typeof type === "undefined" || type === null ) {
            // type defined
            return;
        }

        this._type = type;
    };

    /**
     * url 設定
     * @method setURL
     * @param {String} url
     */
    p.setURL = function ( url ){
        if ( typeof url === "undefined" || url === null ) {
            // type defined
            return;
        }

        this._url = url;
    };

    /**
     * Ajax option 設定, 除く url, dataType
     * @method setOption
     * @param {Object} option
     */
    p.setOption = function ( option ){
        if ( typeof option === "undefined" || option === null ) {
            // type defined
            return;
        }

        this._option = option;
    };

    /**
     * load 開始
     * @method start
     */
    p.start = function (){
        var _this = this,
            url = _this._url,
            option = _this._option;

        if ( _this._nocache ) {
            url +=  "?" + new Date().getTime();
        }

        option.url = url;
        option.dataType = _this._type;

        $.ajax( option ).
        done( function ( data, textStatus, jqXHR ){
            // success
            _this.dispatchEvent( new EventObject( AjaxEvent.COMPLETE, [ data, jqXHR ] ), _this );
        } ).
        fail(function ( jqXHR, textStatus, errorThrown ){
            // error
            _this.dispatchEvent( new EventObject( AjaxEvent.ERROR, [ jqXHR, textStatus ] ), _this );
            console.log( "XML LoadError, " + jqXHR + ", " + errorThrown );
        } );
    };

    inazumatv.jq.XMLLoader = XMLLoader;

}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/15 - 17:47
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( inazumatv ){
    "use strict";
    var XMLLoader = inazumatv.jq.XMLLoader,
        $;

    /**
     * 指定URLのTXTを読込みます
     * @class TXTLoader
     * @extends XMLLoader
     * @param {String} url
     * @param {Boolean|*} [nocache] no cache: true, default: true
     * @constructor
     */
    function TXTLoader ( url, nocache ) {
        XMLLoader.call( this, url, nocache );
        this._type = "text";
    }

    inazumatv.extend( XMLLoader, TXTLoader );

    /**
     * TXTLoader へ jQuery object を設定。TXTLoader を使用する前に実行する必要があります。<br>
     * ExternalJQ.imports から実行されます。
     *
     * @method activate
     * @param {jQuery} jQuery object
     * @static
     */
    TXTLoader.activate = function ( jQuery ){
        $ = jQuery;
    };

    inazumatv.jq.TXTLoader = TXTLoader;
}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/15 - 17:47
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( inazumatv ){
    "use strict";
    var XMLLoader = inazumatv.jq.XMLLoader,
        $;

    /**
     * 指定URLのHTMLを読込みます
     * @class HTMLLoader
     * @extends XMLLoader
     * @param {String} url
     * @param {Boolean|*} [nocache] no cache: true, default: true
     * @constructor
     */
    function HTMLLoader ( url, nocache ) {
        XMLLoader.call( this, url, nocache );
        this._type = "html";
    }

    inazumatv.extend( XMLLoader, HTMLLoader );

    /**
     * HTMLLoader へ jQuery object を設定。HTMLLoader を使用する前に実行する必要があります。<br>
     * ExternalJQ.imports から実行されます。
     *
     * @method activate
     * @param {jQuery} jQuery object
     * @static
     */
    HTMLLoader.activate = function ( jQuery ){
        $ = jQuery;
    };

    inazumatv.jq.HTMLLoader = HTMLLoader;
}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/15 - 18:28
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( inazumatv ){
    "use strict";
    var _prevHeight = 0,
        _$watchTarget,
        _instance,
        _fps,
        _isStart = false,

        EventObject = inazumatv.EventObject,
        EventDispatcher = inazumatv.EventDispatcher,
        FPSManager = inazumatv.FPSManager,
        /**
         * jQuery alias
         * @property $
         * @type {jQuery}
         * @private
         * @static
         */
        $
    ;

    /**
     * @class WatchDocumentHeight
     * @uses EventDispatcher
     * @returns {WatchDocumentHeight}
     * @constructor
     */
    function WatchDocumentHeight () {
        if ( typeof _instance !== "undefined" ) {

            return _instance;
        }

        _fps = new FPSManager( 24 );

        _instance = this;
        return _instance;
    }

    /**
     * WatchDocumentHeight へ jQuery object を設定。WatchDocumentHeight を使用する前に実行する必要があります。<br>
     * ExternalJQ.imports から実行されます。
     *
     * @method activate
     * @param {jQuery} jQuery object
     * @static
     */
    WatchDocumentHeight.activate = function ( jQuery ){
        $ = jQuery;
        var $document = $( document ),
            $window = $( window );

        this._$document = $document;
        this._$window = $window;

        if ( $window.height() > $document.height() ) {
            _$watchTarget = $window;
        } else {
            _$watchTarget = $document;
        }
    };

    /**
     * @method getInstance
     * @uses EventDispatcher
     * @returns {WatchDocumentHeight}
     * @static
     */
    WatchDocumentHeight.getInstance = function (){
        if ( typeof _instance === "undefined" ) {

            _instance = new WatchDocumentHeight();
        }

        return _instance;
    };

    /**
     * document height change event
     * @const RESIZE_HEIGHT
     * @type {string}
     * @static
     */
    WatchDocumentHeight.RESIZE = "watchDocumentResizeHeight";

    var p = WatchDocumentHeight.prototype;

    EventDispatcher.initialize( p );

    /**
     * FPSManager instance を取得します
     * @method getFPSManager
     * @returns {FPSManager} FPSManager instance を返します
     */
    p.getFPSManager = function (){
        return this._fps;
    };

    /**
     * フレーム毎に呼び出されます。<br>
     * 高さが変更されると WatchDocumentHeight.RESIZE を dispatchEvent し true を返します。
     *
     * @method update
     * @param {boolean} [strong] default false
     * @returns {boolean} true: 高さ変更
     */
    p.update = function ( strong ){
        var $window = this._$window,
            $document = this._$document;

        if ( $window.height() > $document.height() ) {
            _$watchTarget = $window;
        } else {
            _$watchTarget = $document;
        }

        var h = _$watchTarget.height(),
            isChange = h !== _prevHeight,

            params = {
                strong: strong,
                height: h
            }
        ;

        _prevHeight = h;
        if ( isChange || strong ) {
            // height
            _instance.dispatchEvent( new EventObject( WatchDocumentHeight.RESIZE, params ), _instance );
        }

        return isChange;
    };

    /**
     * 強制的にEventを発火
     * @method fire
     */
    p.fire = function (){
        this.update( true );
    };

    /**
     * 監視を開始します
     * @method start
     */
    p.start = function (){
        this.fire();

        if ( !_isStart ) {
            _fps.addEventListener( FPSManager.FPS_FRAME, _instance._onEnterFrame );
            _fps.start();
            _isStart = true;
        }
    };

    /**
     * 監視を止めます
     * @method stop
     */
    p.stop = function (){
        _fps.removeEventListener( FPSManager.FPS_FRAME, _instance._onEnterFrame );
        _fps.stop();
        _isStart = false;
    };

    /**
     * FPSManager.ENTER_FRAME Event Handler<br>
     * default 24fps
     *
     * @method _onEnterFrame
     * @private
     */
    p._onEnterFrame = function (){
        _instance.update();
    };

    inazumatv.jq.WatchDocumentHeight = WatchDocumentHeight;
}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/15 - 22:13
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( inazumatv ){
    "use strict";
    var WatchDocumentHeight,
        /**
         * jQuery alias
         * @property $
         * @type {jQuery}
         * @private
         * @static
         */
            $
        ;
    /**
     * jQuery Object の高さを document へあわせます
     * @class FitDocumentHeight
     * @param {jQuery} $element jQuery Object
     * @param {Number} [minHeight] 最小高さ、default: 0
     * @constructor
     */
    function FitDocumentHeight ( $element, minHeight ) {
        if ( !inazumatv.isNumeric( minHeight ) ) {
            minHeight = 0;
        }
        this._watch = WatchDocumentHeight.getInstance();
        this._$element = $element;
        this._minHeight = minHeight;
        this._boundOnResize = this._onResize.bind( this );
    }

    /**
     * FitDocumentHeight へ jQuery object を設定。FitDocumentHeight を使用する前に実行する必要があります。<br>
     * ExternalJQ.imports から実行されます。
     *
     * @method activate
     * @param {jQuery} jQuery object
     * @static
     */
    FitDocumentHeight.activate = function ( jQuery ){
        $ = jQuery;
        WatchDocumentHeight = inazumatv.jq.WatchDocumentHeight;
        WatchDocumentHeight.activate( jQuery );
    };

    var p = FitDocumentHeight.prototype;

    /**
     *
     * @method getWatchDocumentHeight
     * @returns {WatchDocumentHeight} WatchDocumentHeight instance
     */
    p.getWatchDocumentHeight = function (){
        return this._watch;
    };

    /**
     * 監視を開始します
     * @method listen
     */
    p.listen = function (){
        this._watch.addEventListener( WatchDocumentHeight.RESIZE, this._boundOnResize );
        this._watch.start();
    };

    /**
     * 監視を止めます
     * @method abort
     */
    p.abort = function (){
        this._watch.removeEventListener( WatchDocumentHeight.RESIZE, this._boundOnResize );
    };

    /**
     * Event Handler, Document height resize
     * @method _onResize
     * @param {EventObject} eventObject
     * @private
     */
    p._onResize = function ( eventObject ){
        var params = eventObject.params[ 0 ],
            h = params.height;

        this._$element.height( Math.max( h, this._minHeight ) );
    };

    inazumatv.jq.FitDocumentHeight = FitDocumentHeight;

}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/17 - 12:17
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( inazumatv ){
    "use strict";
    var _height = 0,
        _width = 0,
        _$window,
        _instance,
        _fps,
        _isStart = false,

        EventObject = inazumatv.EventObject,
        EventDispatcher = inazumatv.EventDispatcher,
        FPSManager = inazumatv.FPSManager,
        /**
         * jQuery alias
         * @property $
         * @type {jQuery}
         * @private
         * @static
         */
        $
    ;

    // @class WatchWindowSize
    /**
     * @class WatchWindowSize
     * @uses EventDispatcher
     * @returns {WatchWindowSize} WatchWindowSize instance
     * @constructor
     * @singleton
     */
    function WatchWindowSize () {

        if ( typeof _instance !== "undefined" ) {

            return _instance;
        }

        _fps = new FPSManager( 24 );

        _instance = this;
        return _instance;
    }

    /**
     * WatchWindowSize へ jQuery object を設定。WatchWindowSize を使用する前に実行する必要があります。<br>
     * ExternalJQ.imports から実行されます。
     *
     * @method activate
     * @param {jQuery} jQuery object
     * @static
     */
    WatchWindowSize.activate = function ( jQuery ){
        $ = jQuery;
        _$window = $( window );
    };

    /**
     * @method getInstance
     * @returns {WatchDocumentHeight}
     * @static
     */
    WatchWindowSize.getInstance = function (){
        if ( typeof _instance === "undefined" ) {

            _instance = new WatchWindowSize();
        }

        return _instance;
    };

    /**
     * window width change Event
     * @const RESIZE_WIDTH
     * @type {string}
     * @static
     */
    WatchWindowSize.RESIZE_WIDTH = "watchWindowSizeResizeWidth";
    /**
     * window height change Event
     * @const RESIZE_HEIGHT
     * @type {string}
     * @static
     */
    WatchWindowSize.RESIZE_HEIGHT = "watchWindowSizeResizeHeight";
    /**
     * window width or height change Event
     * @const RESIZE
     * @type {string}
     * @static
     */
    WatchWindowSize.RESIZE = "watchWindowSizeResize";

    var p = WatchWindowSize.prototype;

    EventDispatcher.initialize( p );

    /**
     * FPSManager instance を取得します
     * @method getFPSManager
     * @returns {FPSManager} FPSManager instance を返します
     */
    p.getFPSManager = function (){
        return this._fps;
    };

    /**
     * window size を監視し変更があるとイベントを発生させます。
     * @param {boolean=false} [strong] 強制的にイベントを発生させる default: false
     * @returns {boolean} true: window size 変更あり
     */
    p.update = function ( strong ){
        var w = _$window.width(),
            h = _$window.height(),

            isWidthChange = w !== _width,
            isHeightChange = h !== _height,
            isChange = isWidthChange || isHeightChange,

            params = {
                strong: strong,
                width: w,
                height: h
            }
            ;

        _width = w;
        _height = h;

        if ( strong ) {
            // width
            _instance.dispatchEvent( new EventObject( WatchWindowSize.RESIZE_WIDTH, params ), _instance );
            // height
            _instance.dispatchEvent( new EventObject( WatchWindowSize.RESIZE_HEIGHT, params ), _instance );
            // both
            _instance.dispatchEvent( new EventObject( WatchWindowSize.RESIZE, params ), _instance );
        } else if ( isChange ) {
            // both
            _instance.dispatchEvent( new EventObject( WatchWindowSize.RESIZE, params ), _instance );
        } else if ( isWidthChange ) {
            // width
            _instance.dispatchEvent( new EventObject( WatchWindowSize.RESIZE_WIDTH, params ), _instance );
        } else if ( isHeightChange ) {
            // height
            _instance.dispatchEvent( new EventObject( WatchWindowSize.RESIZE_HEIGHT, params ), _instance );
        }

        return isChange;
    };

    /**
     * 強制的にEventを発火
     * @method fire
     */
    p.fire = function (){
        this.update( true );
    };

    /**
     * 監視を開始します
     * @method start
     */
    p.start = function (){
        this.fire();

        if ( !_isStart ) {
            _fps.addEventListener( FPSManager.FPS_FRAME, _instance._onEnterFrame );
            _fps.start();
            _isStart = true;
        }
    };

    /**
     * 監視を止めます
     * @method stop
     */
    p.stop = function (){
        _fps.removeEventListener( FPSManager.FPS_FRAME, _instance._onEnterFrame );
        _fps.stop();
        _isStart = false;
    };

    /**
     * FPSManager.ENTER_FRAME Event Handler<br>
     * default 24fps
     *
     * @method _onEnterFrame
     * @private
     */
    p._onEnterFrame = function (){
        _instance.update();
    };

    inazumatv.jq.WatchWindowSize = WatchWindowSize;

}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/17 - 13:57
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( inazumatv ){
    "use strict";
    var isNumeric = inazumatv.isNumeric,
        WatchWindowSize,
        /**
         * jQuery alias
         * @property $
         * @type {jQuery}
         * @private
         * @static
         */
        $;
    /**
     *
     * @class FitWindow
     * @param {jQuery} $element jQuery object, 対象エレメント
     * @param {Number} [minWidth] default 0
     * @param {Number} [minHeight] default 0
     * @param {Number} [offsetLeft] default 0
     * @constructor
     */
    function FitWindow ( $element, minWidth, minHeight, offsetLeft ) {
        if ( !isNumeric( minWidth ) ) {
            minWidth = 0;
        }
        if ( !isNumeric( minHeight ) ) {
            minHeight = 0;
        }
        if ( !isNumeric( offsetLeft ) ) {
            offsetLeft = 0;
        }

        this._watch = WatchWindowSize.getInstance();
        this._$element = $element;
        this._minWidth = minWidth;
        this._minHeight = minHeight;
        this._offsetLeft = offsetLeft;
    }

    /**
     * FitWindow へ jQuery object を設定。FitWindow を使用する前に実行する必要があります。<br>
     * ExternalJQ.imports から実行されます。
     *
     * @method activate
     * @param {jQuery} jQuery object
     * @static
     */
    FitWindow.activate = function ( jQuery ){
        $ = jQuery;
        WatchWindowSize = inazumatv.jq.WatchWindowSize;
        WatchWindowSize.activate( jQuery );
    };

    var p = FitWindow.prototype;

    /**
     *
     * @method getWatchWindowSize
     * @returns {WatchWindowSize} WatchWindowSize instance
     */
    p.getWatchWindowSize = function (){
        return this._watch;
    };

    /**
     * 監視を開始します
     * @method listen
     */
    p.listen = function (){
        this._boundOnResize = this._onResize.bind( this );
        this._watch.addEventListener( WatchWindowSize.RESIZE, this._boundOnResize );
        this._watch.start();
    };

    /**
     * 監視を止めます
     * @method abort
     */
    p.abort = function (){
        this._watch.removeEventListener( WatchWindowSize.RESIZE, this._boundOnResize );
    };

    /**
     * @method setMinHeight
     * @param {Number} h Minimum height
     */
    p.setMinHeight = function ( h ){
        if ( isNumeric( h ) ) {
            this._minHeight = h;
        }
    };

    /**
     * @method setMinWidth
     * @param {Number} h Minimum width
     */
    p.setMinWidth = function ( w ){
        if ( isNumeric( w ) ) {
            this._elementWidth = w;
        }
    };

    /**
     * Event Handler, Document height resize
     * @method _onResize
     * @param {EventObject} eventObject
     * @protected
     */
    p._onResize = function ( eventObject ){
        var params = eventObject.params[ 0 ],
            w = params.width - this._offsetLeft,
            h = params.height;

        this._$element.width( Math.max( w, this._minWidth ) ).height( Math.max( h, this._minHeight ) );
    };

    inazumatv.jq.FitWindow = FitWindow;

}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/17 - 14:10
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( inazumatv ){
    "use strict";
    var isNumeric = inazumatv.isNumeric,
        WatchWindowSize,
        /**
         * jQuery alias
         * @property $
         * @type {jQuery}
         * @private
         * @static
         */
        $;

    /**
     *
     * @class FitWindowAspect
     * @param {jQuery} $element jQuery object, 対象エレメント
     * @param {Number} [minWidth] default 0
     * @param {Number} [minHeight] default 0
     * @param {Number} [offsetLeft] default 0
     * @param {Number} [offsetTop] default 0
     * @constructor
     */
    function FitWindowAspect ( $element, minWidth, minHeight, offsetLeft, offsetTop ) {
        if ( !isNumeric( minWidth ) ) {
            minWidth = 0;
        }
        if ( !isNumeric( minHeight ) ) {
            minHeight = 0;
        }
        if ( !isNumeric( offsetLeft ) ) {
            offsetLeft = 0;
        }
        if ( !isNumeric( offsetTop ) ) {
            offsetTop = 0;
        }

        this._watch = WatchWindowSize.getInstance();
        this._$element = $element;
        this._minWidth = minWidth;
        this._minHeight = minHeight;
        this._offsetLeft = offsetLeft;
        this._offsetTop = offsetTop;

        this._elementWidth = parseInt( $element.width(), 10 );
        this._elementHeight = parseInt( $element.height(), 10 );
    }

    /**
     * FitWindowAspect へ jQuery object を設定。FitWindowAspect を使用する前に実行する必要があります。<br>
     * ExternalJQ.imports から実行されます。
     *
     * @method activate
     * @param {jQuery} jQuery object
     * @static
     */
    FitWindowAspect.activate = function ( jQuery ){
        $ = jQuery;
        WatchWindowSize = inazumatv.jq.WatchWindowSize;
        WatchWindowSize.activate( jQuery );
    };

    var p = FitWindowAspect.prototype;

    /**
     *
     * @method getWatchWindowSize
     * @returns {WatchWindowSize} WatchWindowSize instance
     */
    p.getWatchWindowSize = function (){
        return this._watch;
    };

    /**
     * 監視を開始します
     * @method listen
     */
    p.listen = function (){
        this._boundOnResize = this._onResize.bind( this );
        this._watch.addEventListener( WatchWindowSize.RESIZE, this._boundOnResize );
        this._watch.start();
    };

    /**
     * 監視を止めます
     * @method abort
     */
    p.abort = function (){
        this._watch.removeEventListener( WatchWindowSize.RESIZE, this._boundOnResize );
    };

    /**
     * @method setElementWidth
     * @param {Number} w DOMElement width
     */
    p.setElementWidth = function ( w ){
        if ( isNumeric( w ) ) {
            this._elementWidth = w;
        }
    };

    /**
     * @method setElementHeight
     * @param {Number} h DOMElement height
     */
    p.setElementHeight = function ( h ){
        if ( isNumeric( h ) ) {
            this._elementHeight = h;
        }
    };

    /**
     * @method setMinHeight
     * @param {Number} h Minimum height
     */
    p.setMinHeight = function ( h ){
        if ( isNumeric( h ) ) {
            this._minHeight = h;
        }
    };

    /**
     * @method setMinWidth
     * @param {Number} h Minimum width
     */
    p.setMinWidth = function ( w ){
        if ( isNumeric( w ) ) {
            this._elementWidth = w;
        }
    };

    /**
     * Event Handler, Window width or height resize
     * @method _onResize
     * @param {EventObject} eventObject
     * @protected
     */
    p._onResize = function ( eventObject ){
        var ew = this._elementWidth,
            eh = this._elementHeight,
            params = eventObject.params[ 0 ],
            w = params.width - this._offsetLeft,
            h = params.height - this._offsetTop,
            aw,
            ah,
            aspect;

        w = Math.max( w, this._minWidth );
        h = Math.max( h, this._minHeight );
        aw = w / ew;
        ah = h / eh;
        aspect = Math.max( aw, ah );

        this._$element.width( Math.ceil( ew * aspect ) ).height( Math.ceil( eh * aspect ) );
    };

    inazumatv.jq.FitWindowAspect = FitWindowAspect;
}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/17 - 14:10
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( inazumatv ){
    "use strict";
    var isNumeric = inazumatv.isNumeric,
        WatchWindowSize,
        /**
         * jQuery alias
         * @property $
         * @type {jQuery}
         * @private
         * @static
         */
        $;

    /**
     * window幅に比率を保ち拡大縮小し、常に中央を表示します。
     *
     * @class FitWindowAspectCenter
     * @param {jQuery} $element jQuery object, 対象エレメント
     * @param {Number} [minWidth] default 0
     * @param {Number} [minHeight] default 0
     * @constructor
     */
    function FitWindowAspectCenter ( $element, minWidth, minHeight ) {
        if ( !isNumeric( minWidth ) ) {
            minWidth = 0;
        }
        if ( !isNumeric( minHeight ) ) {
            minHeight = 0;
        }

        this._watch = WatchWindowSize.getInstance();
        this._$element = $element;
        this._minWidth = minWidth;
        this._minHeight = minHeight;

        this._elementWidth = parseInt( $element.width(), 10 );
        this._elementHeight = parseInt( $element.height(), 10 );
    }

    /**
     * FitWindowAspectCenter へ jQuery object を設定。FitWindowAspectCenter を使用する前に実行する必要があります。<br>
     * ExternalJQ.imports から実行されます。
     *
     * @method activate
     * @param {jQuery} jQuery object
     * @static
     */
    FitWindowAspectCenter.activate = function ( jQuery ){
        $ = jQuery;
        WatchWindowSize = inazumatv.jq.WatchWindowSize;
        WatchWindowSize.activate( jQuery );
    };

    var p = FitWindowAspectCenter.prototype;

    /**
     *
     * @method getWatchWindowSize
     * @returns {WatchWindowSize} WatchWindowSize instance
     */
    p.getWatchWindowSize = function (){
        return this._watch;
    };

    /**
     * 監視を開始します
     * @method listen
     */
    p.listen = function (){
        this._boundOnResize = this._onResize.bind( this );
        this._watch.addEventListener( WatchWindowSize.RESIZE, this._boundOnResize );
        this._watch.start();
    };

    /**
     * 監視を止めます
     * @method abort
     */
    p.abort = function (){
        this._watch.removeEventListener( WatchWindowSize.RESIZE, this._boundOnResize );
    };

    /**
     * @method setElementWidth
     * @param {Number} w DOMElement width
     */
    p.setElementWidth = function ( w ){
        if ( isNumeric( w ) ) {
            this._elementWidth = w;
        }
    };

    /**
     * @method setElementHeight
     * @param {Number} h DOMElement height
     */
    p.setElementHeight = function ( h ){
        if ( isNumeric( h ) ) {
            this._elementHeight = h;
        }
    };

    /**
     * @method setMinHeight
     * @param {Number} h Minimum height
     */
    p.setMinHeight = function ( h ){
        if ( isNumeric( h ) ) {
            this._minHeight = h;
        }
    };

    /**
     * @method setMinWidth
     * @param {Number} h Minimum width
     */
    p.setMinWidth = function ( w ){
        if ( isNumeric( w ) ) {
            this._elementWidth = w;
        }
    };

    /**
     * Event Handler, Window width or height resize
     * @method _onResize
     * @param {EventObject} eventObject
     * @protected
     */
    p._onResize = function ( eventObject ){
        var ew = this._elementWidth,
            eh = this._elementHeight,
            params = eventObject.params[ 0 ],
            window_w = Math.ceil( params.width ),
            window_h = Math.ceil( params.height ),
            w,
            h,
            aspect_w,
            aspect_h,
            aspect;

        w = Math.max( window_w, this._minWidth );
        h = Math.max( window_h, this._minHeight );
        aspect_w = w / ew;
        aspect_h = h / eh;
        aspect = Math.max( aspect_w, aspect_h );

        // 計算後のwidth, height
        var after_w = Math.ceil( ew * aspect ),
            after_h = Math.ceil( eh * aspect ),
            sub_w = (window_w - after_w) * 0.5,
            sub_h = (window_h - after_h) * 0.5;

        this._$element.width( after_w ).height( after_h ).css( { left: sub_w + "px", top: sub_h + "px" } );
    };

    inazumatv.jq.FitWindowAspectCenter = FitWindowAspectCenter;

}( this.inazumatv ) );/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2013/12/17 - 14:26
 *
 * Copyright (c) 2011-2013 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( inazumatv ){
    "use strict";
    var isNumeric = inazumatv.isNumeric,
        WatchWindowSize,
        /**
         * jQuery alias
         * @property $
         * @type {jQuery}
         * @private
         * @static
         */
        $;

    /**
     * @class FitWindowHeight
     * @param {jQuery} $element jQuery object, 対象エレメント
     * @param {Number} [minHeight] default 0
     * @param {Number} [offsetTop] default 0
     * @constructor
     */
    function FitWindowHeight ( $element, minHeight, offsetTop ) {
        if ( !isNumeric( minHeight ) ) {
            minHeight = 0;
        }

        if ( !isNumeric( offsetTop ) ) {
            offsetTop = 0;
        }

        this._watch = WatchWindowSize.getInstance();
        this._$element = $element;
        this._minHeight = minHeight;
        this._offsetTop = offsetTop;

        this._elementHeight = parseInt( $element.height(), 10 );
    }
    /**
     * FitWindowHeight へ jQuery object を設定。FitWindowHeight を使用する前に実行する必要があります。<br>
     * ExternalJQ.imports から実行されます。
     *
     * @method activate
     * @param {jQuery} jQuery object
     * @static
     */
    FitWindowHeight.activate = function ( jQuery ){
        $ = jQuery;
        WatchWindowSize = inazumatv.jq.WatchWindowSize;
        WatchWindowSize.activate( jQuery );
    };

    var p = FitWindowHeight.prototype;

    /**
     *
     * @method getWatchWindowSize
     * @returns {WatchWindowSize} WatchWindowSize instance
     */
    p.getWatchWindowSize = function (){
        return this._watch;
    };

    /**
     * 監視を開始します
     * @method listen
     */
    p.listen = function (){
        this._boundOnResize = this._onResize.bind( this );
        this._watch.addEventListener( WatchWindowSize.RESIZE, this._boundOnResize );
        this._watch.start();
    };

    /**
     * 監視を止めます
     * @method abort
     */
    p.abort = function (){
        this._watch.removeEventListener( WatchWindowSize.RESIZE, this._boundOnResize );
    };

    /**
     * @method setMinHeight
     * @param {Number} h Minimum height
     */
    p.setMinHeight = function ( h ){
        if ( isNumeric( h ) ) {
            this._minHeight = h;
        }
    };

    /**
     * Event Handler, Window width or height resize
     * @method _onResize
     * @param {EventObject} eventObject
     * @protected
     */
    p._onResize = function ( eventObject ){
        var params = eventObject.params[ 0 ],
            h = params.height
        ;

        this._$element.height( Math.max( h, this._minHeight ) - this._offsetTop );
    };

    inazumatv.jq.FitWindowHeight = FitWindowHeight;
}( this.inazumatv ) );