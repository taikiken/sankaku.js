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
Sankaku.version = "0.1.0";

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
( function ( Sankaku ){
    "use strict";

    Sankaku.EventDispatcher = ( function (){
        /**
         * カスタム Event を管理します<br>
         * 必要なClassでmixinします<br>
         * mixin 後下記の4関数が使用できるようになります<br>
         * addEventListener<br>
         * hasEventListener<br>
         * removeEventListener<br>
         * dispatchEvent<br>
         *
         *      function SomeClass () {}
         *      // mixin
         *      Sankaku.EventDispatcher.initialize( SomeClass.prototype );
         *
         * @class EventDispatcher
         * @constructor
         */
        function EventDispatcher () {
//            this._listeners = {};
        }

        var p = EventDispatcher.prototype;

        p.constructor = Sankaku.EventDispatcher;

        /**
         * イベントにハンドラを登録します<br>
         * ハンドラ内のthisはイベント発生元になるので注意が必要です<br>
         * this参照を変えないために bind を使用する方法があります
         *
         *      function EventReceive () {
         *          var example = new ExampleClass();
         *
         *          example.addEventListener( "other", onOtherHandler );
         *          example.addEventListener( "example", this.onBoundHandler.bind( this ) );
         *      }
         *
         *      EventReceive.prototype.onOtherHandler ( event ) {
         *          console.log( this );// ExampleClass
         *      }
         *
         *      EventReceive.prototype.onBoundHandler ( event ) {
         *          console.log( this );// EventReceive
         *      }
         *
         * @method addEventListener
         * @param {string} type event type
         * @param {function} listener event handler
         */
        p.addEventListener = function ( type, listener ) {

            if ( typeof this._listeners === "undefined") {

                this._listeners = {};
            }

            var listeners = this._listeners;

            if ( typeof listeners[ type ] === "undefined" ) {

                listeners[ type ] = [];
            }

            if ( listeners[ type ].indexOf( listener ) === - 1 ) {

                listeners[ type ].push( listener );
            }
        };

        /**
         * @method hasEventListener
         * @param {string} type event type
         * @param {function} listener event handler
         * @return {boolean} event type へ listener 登録が有るか無いかの真偽値を返します
         */
        p.hasEventListener = function ( type, listener ) {

            var listeners = this._listeners;

            if ( typeof listeners === "undefined") {

                return false;
            } else if ( typeof listener[ type ] !== "undefined" && listeners[ type ].indexOf( listener ) !== - 1 ) {

                return true;
            }

            return false;
        };

        /**
         * event type から listener を削除します<br>
         * メモリーリークの原因になるので不要になったlistenerは必ずremoveEventListenerを実行します
         *
         * @method removeEventListener
         * @param {string} type event type
         * @param {function} listener event handler
         */
        p.removeEventListener = function ( type, listener ) {
            if ( typeof this._listeners === "undefined") {

                return;
            }

            var listeners = this._listeners,
                listeners_types = listeners[ type ],
                index;

            if ( typeof listeners_types !== "undefined" ) {

                index = listeners_types.indexOf( listener );

                if ( index !== -1 ) {

                    listeners_types.splice( index, 1 );
                }
            }
        };

        /**
         * event発生をlistenerに通知します
         *
         * @method dispatchEvent
         * @param {Object} event require event.type:String, { type: "some_event", [currentTarget: this] }
         */
        p.dispatchEvent = function ( event ) {
            var listeners = this._listeners,
                listeners_types,
                i, limit;

            if ( typeof listeners === "undefined" || typeof event.type === "undefined" ) {

                return;
            }

            listeners_types = listeners[ event.type ];

            if ( typeof listeners_types !== "undefined" ) {

                event.target = this;

                for ( i = 0, limit = listeners_types.length; i < limit; i++ ) {

                    listeners_types[ i ].call( this, event );
                }
            }
        };

        /**
         * EventDispatcher mixin <br>
         *
         * addEventListener<br>
         * hasEventListener<br>
         * removeEventListener<br>
         * dispatchEvent<br>
         * をobjectへ追加します
         *
         *      function SomeClass () {}
         *      // mixin
         *      Sankaku.EventDispatcher.initialize( SomeClass.prototype );
         *
         *      var someObject = {};
         *      // mixin
         *      Sankaku.EventDispatcher.initialize( someObject );
         *
         * @method initialize
         * @param {Object} object
         * @static
         */
        EventDispatcher.initialize = function ( object ) {
            object.addEventListener = p.addEventListener;
            object.hasEventListener = p.hasEventListener;
            object.removeEventListener = p.removeEventListener;
            object.dispatchEvent = p.dispatchEvent;
        };

        return EventDispatcher;
    }() );

}( window.Sankaku ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/20 - 18:44
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
    var Sankaku = window.Sankaku;

    Sankaku.Iro = ( function (){
        /**
         * https://github.com/less/less.js/blob/master/lib/less/functions.js
         * <br>http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
         *
         * @class Iro
         * @constructor
         */
        function Iro () {
            throw new Error( "Iro can't create instance" );
        }

        var iro = Iro;

        // https://github.com/less/less.js/blob/master/lib/less/functions.js
        // http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
        /**
         *
         * @method rgb2hsl
         * @static
         * @param {int} r
         * @param {int} g
         * @param {int} b
         * @return {object} {h: number, s: number, l: number}
         */
        iro.rgb2hsl = function ( r, g, b ){
            r /= 255;
            g /= 255;
            b /= 255;

            var max = Math.max( r, g, b ),
                min = Math.min( r, g, b ),
                h, s, l, d;

            l = ( max + min ) / 2;

            if ( max === min ) {

                h = s = 0; // achromatic
            } else {

                d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                switch( max ){
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }

                h /= 6;
            }

            return { h: h, s: s, l: l };
        };

        /**
         * @method hsl2rgb
         * @static
         * @param {number} h
         * @param {number} s
         * @param {number} l
         * @return {object} {r: number, g: number, b: number}
         */
        iro.hsl2rgb = function ( h, s, l ) {
            var r, g, b;

            function hue2rgb ( p, q, t ) {

                if (t < 0) {t += 1;}
                if (t > 1) {t -= 1;}
                if (t < 1/6) {return p + (q - p) * 6 * t;}
                if (t < 1/2) {return q;}
                if (t < 2/3) {return p + (q - p) * (2/3 - t) * 6;}

                return p;
            }

            if( s === 0 ) {

                r = g = b = l; // achromatic
            }else{

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s,
                    p = 2 * l - q;

                r = hue2rgb( p, q, h + 1/3 );
                g = hue2rgb( p, q, h );
                b = hue2rgb( p, q, h - 1/3 );
            }

            return {
                r: r * 255,
                g: g * 255,
                b: b * 255
            };
        };

        /**
         * @method rgb2hsv
         * @static
         * @param {int} r
         * @param {int} g
         * @param {int} b
         * @return {object} {h: number, s: number, v: number}
         */
        iro.rgb2hsv = function ( r, g, b ) {
            r /= 255;
            g /= 255;
            b /= 255;

            var max = Math.max( r, g, b ),
                min = Math.min( r, g, b ),
                h, s, v = max,
                d = max - min;

            s = max === 0 ? 0 : d / max;

            if ( max === min ) {
                h = 0; // achromatic
            } else {
                switch ( max ) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }

                h /= 6;
            }

            return { h: h, s: s, v: v };
        };

        /**
         * @method hsv2rgb
         * @static
         * @param {number} h
         * @param {number} s
         * @param {number} v
         * @return {object} {r: number, g: number, b: number}
         */
        iro.hsv2rgb = function ( h, s, v ) {
            var r, g, b,
                i = Math.floor( h * 6 ),
                f = h * 6 - i,
                p = v * ( 1 - s ),
                q = v * ( 1 - f * s ),
                t = v * ( 1 - ( 1 - f ) * s );

            switch ( i % 6 ) {
                case 0: r = v; g = t; b = p; break;
                case 1: r = q; g = v; b = p; break;
                case 2: r = p; g = v; b = t; break;
                case 3: r = p; g = q; b = v; break;
                case 4: r = t; g = p; b = v; break;
                case 5: r = v; g = p; b = q; break;
            }

            return {
                r: r * 255,
                g: g * 255,
                b: b * 255
            };
        };

        // http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
        /**
         * @method hex2rgb
         * @static
         * @param {string} hex CSS 色設定文字 #ff0000
         * @return {object} {r: number, g: number, b: number}
         */
        iro.hex2rgb = function ( hex ) {
            if ( typeof hex !== "string" ) {
                // order string
                return null;
            }

            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function( m, r, g, b ) {
                return r + r + g + g + b + b;
            });

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };

        /**
         * @method rgb2hex
         * @static
         * @param {int} r
         * @param {int} g
         * @param {int} b
         * @return {string}
         */
        iro.rgb2hex = function ( r, g, b ) {
            function componentToHex(c) {
                var hex = c.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            }

            return "#" + componentToHex( r ) + componentToHex( g ) + componentToHex( b );
        };

        /**
         * @method int2hex
         * @static
         * @param {number} num
         * @return {string}
         */
        iro.int2hex = function ( num ) {
            num = Math.floor( num );

            var hex = num.toString( 16 );

            if ( hex.length < 6 ) {

                var i = hex.length,
                    sub = 6 - i;

                while( sub ) {

                    hex = "0" + hex;
                    --sub;
                }
            }

            return "#" + hex;
        };

        return Iro;
    }() );
}( window ) );
/**
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
    var Sankaku = window.Sankaku;

    Sankaku.List = ( function (){
        var _rand = Math.random,
            _floor = Math.floor,
            _max = Math.max;

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
         * @return {Array}
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
         * @return {Array}
         */
        l.zero = function ( length ) {
            return this.word( length, 0 );
        };

        /**
         * 配列をシャッフルします
         * @method shuffle
         * @static
         * @param {Array} array
         * @return {Array} シャッフル後の配列を返します
         */
        l.shuffle = function ( array ) {
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
        };

        /**
         * 配列内の最大数値を返します
         * @method max
         * @static
         * @param {Array} arr 検証対象の配列、内部は全部数値 [Number, [Number]]
         * @return {number} 配列内の最大数値を返します
         */
        l.max = function ( arr ) {
            return _max.apply( null, arr );
        };

        return List;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/23 - 12:25
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
    var Sankaku = window.Sankaku;

    Sankaku.Num = ( function (){
        var parseFloat = window.parseFloat,
            _rand = Math.random,
            _floor = Math.floor;

        /**
         * 数値ヘルパー
         * @class Num
         * @constructor
         */
        function Num () {
            throw new Error( "Num can't create instance" );
        }

        var n = Num;

        n.ONE_DEG = Math.PI / 180;

        /**
         * 数値か否かをチェックします
         * @method is
         * @static
         * @param {Object} obj
         * @return {boolean} true: 数値
         */
        n.is = function ( obj ) {
            return !isNaN( parseFloat( obj ) ) && isFinite( obj );
        };

        /**
         * 範囲指定し乱数を生成します
         * <br>結果は int になります
         * <br>max 省略時は 0 ~ min 間の乱数を発生させます
         * @method random
         * @static
         * @param {number} min
         * @param {number} [max]
         * @return {int} 乱数を返します
         */
        n.random = function ( min, max ) {
            if ( !n.is( max ) ) {

                max = min;
                min = 0;
            }
            return min + _floor( _rand() * ( max - min + 1 ) );
        };

        /**
         * degree を radian へ変換します
         * @method deg2rad
         * @param {number} degree degree 0 ~ 360
         * @return {number} radian 0 ~ 2 * PI
         */
        n.deg2rad = function ( degree ) {
            return degree * n.ONE_DEG;
        };

        return Num;
    }() );
}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/26 - 11:40
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
    var Sankaku = window.Sankaku;

    Sankaku.Distribute = ( function (){
        var _sqrt = Math.sqrt,
            _sin = Math.sin,
            _cos = Math.cos,
            _rand = Math.random,
            PI2 = Math.PI * 2;

        /**
         * @class Distribute
         * @constructor
         */
        function Distribute () {
            throw new Error( "Distribute can't create instance" );
        }

        var d = Distribute;

        /**
         * @method circle
         * @static
         * @param {int} n 乱数 max 値
         * @param {number} w 分布幅
         * @param {number} h 分布高
         * @return {{x: number, y: number}}
         */
        d.circle = function ( n, w, h ) {
            var radius, angle;

            radius = _sqrt( _rand() ) * n;
            angle = _rand() * PI2;

            return {
                x: w * 0.5 + _cos( angle ) * radius,
                y: h * 0.5 + _sin( angle ) * radius
            };
        };

        return Distribute;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/23 - 15:57
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

    var _abs = Math.abs,
        _min = Math.min,
        _max = Math.max,
        _round = Math.round,

        Sankaku = window.Sankaku;

    Sankaku.Triangle = ( function (){
        /**
         *
         * @class Triangle
         * @param {Object} a
         * @param {Object} b
         * @param {Object} c
         * @constructor
         */
        function Triangle ( a, b, c ) {
            this.a = a;
            this.b = b;
            this.c = c;

            var A = b.x - a.x,
                B = b.y - a.y,
                C = c.x - a.x,
                D = c.y - a.y,
                E = A * ( a.x + b.x ) + B * ( a.y + b.y ),
                F = C * ( a.x + c.x ) + D * ( a.y + c.y ),
                G = 2 * ( A * ( c.y - b.y ) - B * ( c.x - b.x ) ),
                minx, miny, dx, dy,
                x, y;

            // If the points of the triangle are collinear, then just find the
            // extremes and use the midpoint as the center of the circumcircle.
            if( _abs( G ) < 0.000001 ) {
                // under
                minx = _min( a.x, b.x, c.x );
                miny = _min( a.y, b.y, c.y );
                dx   = ( _max( a.x, b.x, c.x ) - minx ) * 0.5;
                dy   = ( _max( a.y, b.y, c.y ) - miny ) * 0.5;

                this.x = minx + dx;
                this.y = miny + dy;
                this.r = dx * dx + dy * dy;
            } else {
                // over
                x = ( D*E - B*F ) / G;
                y = ( A*F - C*E ) / G;
                dx = x - a.x;
                dy = y - a.y;

                this.x = x;
                this.y = y;
                this.r = dx * dx + dy * dy;
            }
        }

        var p = Triangle.prototype;

        p.constructor = Triangle;

        /**
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         */
        p.draw = function ( ctx ) {
            var a = this.a,
                b = this.b,
                c = this.c;

            ctx.beginPath();
            ctx.moveTo( a.x, a.y );
            ctx.lineTo( b.x, b.y );
            ctx.lineTo( c.x, c.y );
            ctx.closePath();
        };

        /**
         * @method centroid
         * @return {{x: number, y: number}}
         */
        p.centroid = function() {

            return (
            {
                x: _round( ( this.a.x + this.b.x + this.c.x ) / 3 ),
                y: _round( ( this.a.y + this.b.y + this.c.y ) / 3 )
            }
                );
        };

        return Triangle;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/23 - 15:55
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
    var Sankaku = window.Sankaku,
        Triangle = Sankaku.Triangle;

    Sankaku.Delaunay = ( function (){
        /**
         * https://github.com/ironwallaby/delaunay
         *
         * @class Delaunay
         * @constructor
         */
        function Delaunay () {
            throw new Error( "Sankaku can't create instance." );
        }

        var s = Delaunay;
//
//        /**
//         * @method byX
//         * @static
//         * @param {object} a
//         * @param {object} b
//         * @return {number}
//         */
//        s.byX = function ( a, b ) {
//            return b.x - a.x;
//        };
//
//        /**
//         * @method dedup
//         * @static
//         * @param {Array} edges
//         */
//        s.dedup = function ( edges ) {
//            var j = edges.length,
//                a, b, i, m, n;
//
//            outer: while( j ) {
//                b = edges[ --j ];
//                a = edges[ --j ];
//                i = j;
//
//                while( i ) {
//                    n = edges[ --i ];
//                    m = edges[ --i ];
//
//                    if( ( a === m && b === n ) || ( a === n && b === m ) ) {
//
//                        edges.splice( j, 2 );
//                        edges.splice( i, 2 );
//                        j -= 2;
//
//                        continue outer;
//                    }// if
//                }// while i
//            }// while j
//        };

        /**
         * @method triangulate
         * @static
         * @param vertices
         * @return {Array}
         */
        s.triangulate = function ( vertices ) {
            // if there aren't enough vertices to form any triangles.
            if(vertices.length < 3) {
                return [];
            }

            var vertex,
                i,
                x_min, x_max,
                y_min, y_max,

                dx, dy,
                d_max,
                x_mid,
                y_mid,
                open,
                closed,
                close_i,
                edges,
                j, a, b,
                open_j;

            var byX = function ( a, b ) {
                return b.x - a.x;
            };

            var dedup = function ( edges ) {
                var j = edges.length,
                    a, b, i, m, n;

                outer: while( j ) {
                    b = edges[ --j ];
                    a = edges[ --j ];
                    i = j;

                    while( i ) {
                        n = edges[ --i ];
                        m = edges[ --i ];

                        if( ( a === m && b === n ) || ( a === n && b === m ) ) {

                            edges.splice( j, 2 );
                            edges.splice( i, 2 );
                            j -= 2;

                            continue outer;
                        }// if
                    }// while i
                }// while j
            };

            // Ensure the vertex array is in order of descending X coordinate
            // (which is needed to ensure a subquadratic runtime), and then find
            // the bounding box around the points.
            vertices.sort( byX );

            i = vertices.length - 1;
            vertex = vertices[ i ];

            x_min = vertex.x;
            x_max = vertices[ 0 ].x;
            y_min = vertex.y;
            y_max = y_min;

            while( i-- ) {
                if ( vertex.y < y_min) {

                    y_min = vertex.y;
                }
                if ( vertex.y > y_max ) {

                    y_max = vertex.y;
                }
            }

            // Find a super triangle, which is a triangle that surrounds all the vertices.
            // This is used like something of a sentinel value to remove
            // cases in the main algorithm, and is removed before we return any results.
            //
            // Once found, put it in the "open" list.
            // (The "open" list is for triangles who may still need to be considered; the "closed" list is for triangles which do not.)
            dx = x_max - x_min;
            dy = y_max - y_min;
            d_max = ( dx > dy ) ? dx : dy;
            x_mid = ( x_max + x_min ) * 0.5;
            y_mid = ( y_max + y_min ) * 0.5;
            open = [
                new Triangle(
                    { x: x_mid - 20 * d_max, y: y_mid -      d_max, __sentinel: true },
                    { x: x_mid             , y: y_mid + 20 * d_max, __sentinel: true },
                    { x: x_mid + 20 * d_max, y: y_mid -      d_max, __sentinel: true }
                )
            ];
            closed = [];
            edges = [];

            // Incrementally add each vertex to the mesh.
            i = vertices.length;

            // For each open triangle, check to see if the current point is
            // inside it's circumcircle. If it is, remove the triangle and add
            // it's edges to an edge list.
            while( i-- ) {

                edges.length = 0;

                j = open.length;

                vertex = vertices[ i ];

                while( j-- ) {

                    open_j = open[ j ];

                    // If this point is to the right of this triangle's circumcircle,
                    // then this triangle should never get checked again. Remove it
                    // from the open list, add it to the closed list, and skip.
                    dx = vertex.x - open_j.x;

                    if( dx > 0 && dx * dx > open_j.r ) {

                        closed.push( open_j );
                        open.splice( j, 1 );
                        continue;
                    }

                    // If not, skip this triangle.
                    dy = vertex.y - open_j.y;

                    if ( dx * dx + dy * dy > open_j.r ) {
                        // skip
                        continue;
                    }

                    // Remove the triangle and add it's edges to the edge list.
                    edges.push(
                        open_j.a, open_j.b,
                        open_j.b, open_j.c,
                        open_j.c, open_j.a
                    );

                    open.splice( j, 1 );
                }// while j

                // Remove any doubled edges.
                dedup( edges );

                // Add a new triangle for each edge.
                j = edges.length;

                while(j) {

                    b = edges[ --j ];
                    a = edges[ --j ];
                    open.push( new Triangle( a, b, vertex ) );
                }

            }// while i

            // Copy any remaining open triangles to the closed list, and then
            // remove any triangles that share a vertex with the super triangle.

            // http://qiita.com/kaz2ngt/items/6e08acc537fd77273cff
            // 配列の連結
            Array.prototype.push.apply( closed, open );

            i = closed.length;

            while( i-- ) {

                close_i = closed[ i ];

                if(
                    close_i.a.__sentinel ||
                    close_i.b.__sentinel ||
                    close_i.c.__sentinel ) {

                    closed.splice( i, 1 );
                }
            }// while

            return closed;
        };

        return Delaunay;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/22 - 17:33
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
    var Sankaku = window.Sankaku;

    Sankaku.Vector2D = ( function (){
        var _floor = Math.floor,
            _ceil = Math.ceil,
            _round = Math.round,
            _cos = Math.cos,
            _sin = Math.sin,
            _atan2 = Math.atan2,
            _sqrt = Math.sqrt,
            _min = Math.min,
            _acos = Math.acos;
        /**
         * 二次元ベクトルクラス
         * @class Vector2D
         * @param {number=0} [x]
         * @param {number=0} [y]
         * @constructor
         */
        function Vector2D ( x, y ) {
            this.x = x || 0;
            this.y = y || 0;
        }

        var p = Vector2D.prototype;

        p.constructor = Vector2D;

        /**
         * ベクトルを可視化するのに用います
         * <br>デバッグなどで使用します。
         *
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         * @return {Vector2D}
         */
        p.draw = function ( ctx ) {

            ctx.beginPath();
            ctx.moveTo( 0, 0 );
            ctx.lineTo( this.x, this.y );
            ctx.closePath();

            return this;
        };

        /**
         * ベクトルのコピーを作成します
         * @method clone
         * @return {Vector2D}
         */
        p.clone = function () {
            return new Vector2D( this.x, this.y );
        };

        /**
         * ベクトルのx, yの値を 0 にします
         * @method zero
         * @return {Vector2D}
         */
        p.zero = function () {
            this.x = 0;
            this.y = 0;

            return this;
        };

        /**
         * ベクトルの値が x, y 共 0 かどうかを判定します
         * @method isZero
         * @return {boolean}
         */
        p.isZero = function () {
            return this.x === 0 && this.y === 0;
        };

        /**
         * ベクトルへ値を設定します
         * @method set
         * @param {number} x
         * @param {number} y
         * @return {Vector2D}
         */
        p.set = function ( x, y ) {
            this.x = x;
            this.y = y;

            return this;
        };

        /**
         * ベクトルの x へ値を設定します
         * @method setX
         * @param {number} x
         * @return {Vector2D}
         */
        p.setX = function ( x ) {
            this.x = x;

            return this;
        };

        /**
         * ベクトルの y へ値を設定します
         * @method setY
         * @param {number} y
         * @return {Vector2D}
         */
        p.setY = function ( y ) {
            this.y = y;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を複写します
         * @method copy
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.copy = function ( v ) {
            this.x = v.x;
            this.y = v.y;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を加算します
         * @method add
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.add = function ( v ) {
            this.x += v.x;
            this.y += v.y;

            return this;
        };

        /**
         * ベクトルへ値を加算します
         * @method add
         * @param {number} s
         * @return {Vector2D}
         */
        p.addScalar = function ( s ) {
            this.x += s;
            this.y += s;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を加算し新しいVector2Dを作成します
         * @method addNew
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.addNew = function ( v ) {
            return new Vector2D( this.x + v.x, this.y + v.y );
        };

        /**
         * 二つのベクトルの値を加算します
         * @method addVector
         * @param {Vector2D} a
         * @param {Vector2D} b
         * @return {Vector2D}
         */
        p.addVector = function ( a, b ) {
            this.x = a.x + b.x;
            this.y = a.y + b.y;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を減算します
         * @method sub
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.sub = function ( v ) {
            this.x -= v.x;
            this.y -= v.y;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を減算し新しいVector2Dを作成します
         * @method subNew
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.subNew = function ( v ) {
            return new Vector2D( this.x - v.x, this.y - v.y );
        };

        /**
         * 二つのベクトルの値を減算します
         * @method subVector
         * @param {Vector2D} a
         * @param {Vector2D} b
         * @return {Vector2D}
         */
        p.subVector = function ( a, b ) {

            this.x = a.x - b.x;
            this.y = a.y - b.y;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を乗算します
         * @method multiply
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.multiply = function ( v ) {
            this.x *= v.x;
            this.y *= v.y;

            return this;
        };

        /**
         * ベクトルの値を乗算します
         * @method multiplyScalar
         * @param {number} s
         * @return {Vector2D}
         */
        p.multiplyScalar = function ( s ) {

            this.x *= s;
            this.y *= s;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を乗算し新しいVector2Dを作成します
         * @method multiplyNew
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.multiplyNew = function ( v ) {
            return new Vector2D( this.x * v.x, this.y * v.y );
        };

        /**
         * ベクトルへ引数ベクトルの値を除算します
         * @method divide
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.divide = function ( v ) {
            this.x /= v.x;
            this.y /= v.y;

            return this;
        };

        /**
         * ベクトルの値を除算します
         * @method divideScalar
         * @param {number} scalar
         * @return {Vector2D}
         */
        p.divideScalar = function ( scalar ) {
            if ( scalar !== 0 ) {

                var invScalar = 1 / scalar;

                this.x *= invScalar;
                this.y *= invScalar;

            } else {

                this.x = 0;
                this.y = 0;

            }

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を除算し新しいVector2Dを作成します
         * @method divideNew
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.divideNew = function ( v ) {
            return new Vector2D( this.x / v.x, this.y / v.y );
        };

        /**
         * ベクトルへ引数ベクトルの値と比較し小さな方の値を設定します
         * @method min
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.min = function ( v ) {
            if ( this.x > v.x ) {

                this.x = v.x;
            }

            if ( this.y > v.y ) {

                this.y = v.y;
            }

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値と比較し大きな方の値を設定します
         * @method max
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.max = function ( v ) {
            if ( this.x < v.x ) {

                this.x = v.x;
            }

            if ( this.y < v.y ) {

                this.y = v.y;
            }

            return this;
        };

        /**
         * this.min( min_v ), this.max( max_v ) を実行します
         * @method clamp
         * @param {Vector2D} min_v
         * @param {Vector2D} max_v
         * @return {Vector2D}
         */
        p.clamp = function ( min_v, max_v ) {
//            if ( this.x < min.x ) {
//
//                this.x = min.x;
//            } else if ( this.x > max.x ) {
//
//                this.x = max.x;
//            }
//
//            if ( this.y < min.y ) {
//
//                this.y = min.y;
//            } else if ( this.y > max.y ) {
//
//                this.y = max.y;
//            }
            this.min( min_v );
            this.max( max_v );

            return this;
        };

        /**
         * スカラ値を使用しclampします
         * @method clampScalar
         * @param {number} minVal
         * @param {number} maxVal
         * @return {Vector2D}
         */
        p.clampScalar = function ( minVal, maxVal ) {
            var min, max;

            min = new Vector2D();
            max = new Vector2D();

            min.set( minVal, minVal );
            max.set( maxVal, maxVal );

            return this.clamp( min, max );
        };

        /**
         * @method floor
         * @return {Vector2D}
         */
        p.floor = function () {
            this.x = _floor( this.x );
            this.y = _floor( this.y );

            return this;
        };

        /**
         * @method ceil
         * @return {Vector2D}
         */
        p.ceil = function () {
            this.x = _ceil( this.x );
            this.y = _ceil( this.y );

            return this;
        };

        /**
         * @method round
         * @return {Vector2D}
         */
        p.round = function () {
            this.x = _round( this.x );
            this.y = _round( this.y );

            return this;
        };

        /**
         * @method roundToZero
         * @return {Vector2D}
         */
        p.roundToZero = function () {
            this.x = ( this.x < 0 ) ? _ceil( this.x ) : _floor( this.x );
            this.y = ( this.y < 0 ) ? _ceil( this.y ) : _floor( this.y );

            return this;
        };

        /**
         * @method negate
         * @return {Vector2D}
         */
        p.negate = function () {
            return this.multiplyScalar( - 1 );
        };

        /**
         * ベクトルと引数ベクトルの内積を計算します
         * @method dot
         * @param {Vector2D} v 内積をとる Vector2D インスタンス
         * @return {number}
         */
        p.dot = function ( v ) {
            return this.x * v.x + this.y * v.y;
        };

        /**
         * ベクトルの大きさの２条を計算します
         * @method lengthSq
         * @return {number}
         */
        p.lengthSq = function () {
            return this.x * this.x + this.y * this.y;
        };

        /**
         * ベクトルの大きさの２条の平方根を計算します
         * @method length
         * @return {number}
         */
        p.length = function () {
            return _sqrt( this.lengthSq() );
        };

        /**
         * ベクトルの大きさを設定します
         * @method setLength
         * @param {number} l
         * @return {Vector2D}
         */
        p.setLength = function ( l ) {
            var oldLength = this.length();

            if ( oldLength !== 0 && l !== oldLength ) {

                this.multiplyScalar( l / oldLength );
            }

            return this;
        };

        /**
         * @method setAngle
         * @param {number} value radian
         * @return {Vector2D}
         */
        p.setAngle = function ( value ) {
            var len = this.length();

            len = len || 0.001;

            this.x = _cos( value ) * len;
            this.y = _sin( value ) * len;

            return this;
        };

        /**
         * ベクトルの角度を設定します
         * @method angle
         * @return {number}
         */
        p.angle = function () {
            return _atan2( this.y, this.x );
        };

        /**
         * ベクトルの大きさを正規化（大きさを1）にします
         *
         * @method normalize
         * @return {Vector2D}
         */
        p.normalize = function () {
            return this.divideScalar( this.length() );
        };

        /**
         * ベクトルと引数ベクトル間の距離の２条を計算します
         * @method distanceSq
         * @param {Vector2D} v
         * @return {number}
         */
        p.distanceSq = function ( v ) {
            var dx = this.x - v.x,
                dy = this.y - v.y;

            return dx * dx + dy * dy;
        };

        /**
         * ベクトルと引数ベクトル間の距離を計算します
         * @method distance
         * @param {Vector2D} v
         * @return {number}
         */
        p.distance = function ( v ) {
            return _sqrt( this.distanceSq( v ) );
        };

        /**
         * @method lerp
         * @param {Vector2D} v
         * @param {number} alpha
         * @return {Vector2D}
         */
        p.lerp = function ( v, alpha ) {
            this.x += ( v.x - this.x ) * alpha;
            this.y += ( v.y - this.y ) * alpha;

            return this;
        };

        /**
         * ベクトルと引数ベクトルの値が等しいかを判定します
         * @method equals
         * @param {Vector2D} v
         * @return {boolean}
         */
        p.equals = function ( v ) {
            return ( ( v.x === this.x ) && ( v.y === this.y ) );
        };

        /**
         * 配列を使いベクトルを設定します
         * @method fomArray
         * @param {Array} array [x: number, y: number]
         * @return {Vector2D}
         */
        p.fomArray = function ( array ) {
            this.x = array[ 0 ];
            this.y = array[ 1 ];

            return this;
        };

        /**
         * ベクトルの値を配列として返します
         * @method toArray
         * @return {[]} [x: number, y: number]
         */
        p.toArray = function () {
            return [ this.x, this.y ];
        };

        /**
         * ベクトルの値を設定した値以下にします
         * @method truncate
         * @param {number} max
         * @return {Vector2D}
         */
        p.truncate = function ( max ) {
            var min = _min( max, this.length() );
            return this.setLength( min );
        };

        /**
         * ベクトルの値を反転します
         * @method reverse
         * @return {Vector2D}
         */
        p.reverse = function () {
//            this.x *= -1;
//            this.y *= -1;
            this.negate();

            return this;
        };

        /**
         * ベクトルが正規化されているかを判定します
         * @method isNormalize
         * @return {boolean}
         */
        p.isNormalize = function () {
            return this.length() === 1;
        };

        /**
         * このベクトルに垂直なベクトルを生成し返します
         * @method prev
         * @return {Vector2D} このベクトルに垂直なベクトル
         */
        p.prev = function () {
            return new Vector2D( -this.y, this.x );
        };

        /**
         * 引数ベクトルが、このベクトルの左側にあるか右側かを判定します
         *
         * @method sign
         * @param {Vector2D} v
         * @return {number} -1: 左側, 1: 右側
         */
        p.sign = function ( v ) {
            return this.prev().dot( v ) < 0 ? -1 : 1;
        };

        /**
         * ２つのベクトル間の角度を計算します
         * @method angleBetween
         * @static
         * @param {Vector2D} v1
         * @param {Vector2D} v2
         * @return {number}
         */
        Vector2D.angleBetween = function ( v1, v2 ) {

            if ( !v1.isNormalize() ) {

                v1 = v1.clone().normalize();
            }
            if ( !v2.isNormalize() ) {

                v2 = v2.clone().normalize();
            }

            return _acos( v1.dot( v2 ) );
        };

        return Vector2D;
    }() );
}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/25 - 11:19
 *
 * Copyright (c) 2011-2014 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * for display object
 */
( function ( window ){
    "use strict";
    var Sankaku = window.Sankaku,
        Vector2D = Sankaku.Vector2D,
        Num = Sankaku.Num
    ;

    Sankaku.Object2D = ( function (){
        var _cos = Math.cos,
            _sin = Math.sin;

        /**
         * @class Object2D
         * @constructor
         */
        function Object2D () {
            /**
             * @property _position
             * @type {Vector2D}
             * @default new Vector2D( 0, 0 )
             * @protected
             */
            this._position = new Vector2D();

            /**
             * @property x
             * @type {number}
             * @default 0
             */
            this.x = 0;
            /**
             * @property y
             * @type {number}
             * @default 0
             */
            this.y = 0;
            /**
             * radian
             * @property rotation
             * @type {number}
             * @default 0
             */
            this.rotation = 0;
            /**
             * @property width
             * @type {number}
             * @default 20
             */
            this.width = 20;
            /**
             * @property height
             * @type {number}
             * @default 10
             */
            this.height = 10;
        }

        var p = Object2D.prototype;

        p.constructor = Object2D;

        /**
         * @method position
         * @param {Vector2D} v
         */
        p.position = function ( v ) {
            this._position = v;
            this.x = v.x;
            this.y = v.y;
        };

        /**
         * @method getPosition
         * @return {Vector2D}
         */
        p.getPosition = function () {
            return this._position;
        };

        /**
         * @method setX
         * @param {number} x
         */
        p.setX = function ( x ) {
            this.x = x;
            this._position.x = x;
        };

        /**
         * @method setY
         * @param {number} y
         */
        p.setY = function ( y ) {
            this.y = y;
            this._position.y = y;
        };

        /**
         * @method bounding
         * @return {Object} {a: {x: number, y: number}, b: {x: number, y: number}, c: {x: number, y: number}, d: {x: number, y: number}}
         */
        p.bounding = function () {
            var x = this.x,
                y = this.y,
                w2 = this.width * 0.5,
                h2 = this.height * 0.5,
                rotation = this.rotation,
                a, b, c, d,
                ax, ay,
                bx,
                cy,
                sin, cos,

                cos_ax,
                cos_ay,
                sin_ay,
                sin_ax,
                cos_bx,
                cos_cy,
                sin_bx,
                sin_cy;

            sin = _sin( rotation );
            cos = _cos( rotation );

            ax = -w2;
            ay = -h2;
            bx = w2;
            cy = h2;

            cos_ax = cos * ax;
            cos_ay = cos * ay;
            sin_ay = sin * ay;
            sin_ax = sin * ax;
            cos_bx = cos * bx;
            cos_cy = cos * cy;
            sin_bx = sin * bx;
            sin_cy = sin * cy;

            a = { x: cos_ax - sin_ay + x, y: cos_ay + sin_ax + y };
            b = { x: cos_bx - sin_ay + x, y: cos_ay + sin_bx + y };
            c = { x: cos_bx - sin_cy + x, y: cos_cy + sin_bx + y };
            d = { x: cos_ax - sin_cy + x, y: cos_cy + sin_ax + y };

            return { a: a, b: b, c: c, d:d };
        };

        /**
         * 角度を degree を元に radian 設定します
         * @method rotate
         * @param {number} degree 0 ~ 360
         */
        p.rotate = function ( degree ) {
            this.rotation = Num.deg2rad( degree );
        };

        /**
         * @method clone
         * @return {Object2D}
         */
        p.clone = function () {
            return this._clone();
        };

        /**
         * @method _clone
         * @return {Object2D}
         * @protected
         */
        p._clone = function () {
            var clone = new Object2D();
            clone.position( this._position.clone() );
            clone.width = this.width;
            clone.height = this.height;
            clone.rotation = this.rotation;

            return clone;
        };

        /**
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         */
        p.draw = function ( ctx ) {

        };

        return Object2D;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/25 - 12:19
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
    var Sankaku = window.Sankaku,
        Object2D = Sankaku.Object2D,
        Vector2D = Sankaku.Vector2D,
        Num = Sankaku.Num
    ;

    Sankaku.Shape = ( function (){

        /**
         * @class Shape
         * @extends Object2D
         * @param {number} x
         * @param {number} y
         * @param {number=20} [width]
         * @param {number=10} [height]
         * @param {String} [color] default #000000
         * @param {boolean=false} [fill] fill or stroke, true: fill, false: stroke
         * @constructor
         */
        function Shape ( x, y, width, height, color, fill ) {
            Object2D.call( this );

            this.setX( x );
            this.setY( y );

            if ( Num.is( width ) ) {

                this.width = width;
            }

            if ( Num.is( height ) ) {

                this.height = height;
            }

            /**
             * @property _color
             * @type {String}
             * @default #000000
             * @protected
             */
            this._color = color || "#000000";
            /**
             * @property _fill
             * @type {boolean}
             * @default false
             * @protected
             */
            this._fill = !!fill;

            /**
             * @property _line
             * @type {number}
             * @default 1
             * @protected
             */
            this._line = 1;

            /**
             * @property border
             * @default { width: 0, color: "#000000" }
             * @type {{width: number, color: string}}
             */
            this.border = {
                width: 0,
                color: "#000000"
            };
        }

        Sankaku.extend( Object2D, Shape );

        var p = Shape.prototype;

        p.constructor = Shape;

        /**
         * @method getRadius
         * @return {number}
         */
        p.getRadius = function () {
            var bounding = this.bounding(),
                a = bounding.a,
                c = bounding.c;

            return new Vector2D( a.x, a.y ).distance( c );
        };

        /**
         * @method clone
         * @return {Object2D}
         */
        p.clone = function () {
            var clone = this._clone();

            clone._color = this._color;
            clone._fill = this._fill;
            clone._line = this._line;
            clone._border = {
                width: this._border.width,
                color: this._border.color
            };

            return clone;
        };

        /**
         * @method mode
         * @param fill
         */
        p.mode = function ( fill ) {
            this._fill = !!fill;
        };
        /**
         * @method getMode
         * @return {boolean}
         */
        p.getMode = function () {
            return this._fill;
        };

        /**
         * @method line
         * @param {number} n
         */
        p.line = function ( n ) {
            this._line = n;
        };

        /**
         * @method getLine
         * @return {number}
         */
        p.getLine = function () {
            return this._line;
        };

        /**
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         */
        p.draw = function ( ctx ) {
            var border = this.border;

            if ( this._fill ) {

                this.fill( ctx, this._color );

                if ( border.width > 0  ) {
                    // border
                    this.stroke( ctx, border.width, border.color );
                }
            } else {

                this.stroke( ctx, this._line, this._color );
            }
        };

        /**
         * @method fill
         * @param {CanvasRenderingContext2D} ctx
         * @param {string} color
         */
        p.fill = function ( ctx, color ) {
            ctx.fillStyle = color;

            this.paint( ctx );

            ctx.fill();
        };

        /**
         * @method stroke
         * @param {CanvasRenderingContext2D} ctx
         * @param {number} line
         * @param {string} color
         */
        p.stroke = function ( ctx, line, color ) {
            ctx.lineWidth = line;
            ctx.strokeStyle = color;

            this.paint( ctx );

            ctx.stroke();
        };

        /**
         * @method paint
         * @param {CanvasRenderingContext2D} ctx
         */
        p.paint = function ( ctx ) {
            var bounding = this.bounding(),
                a = bounding.a,
                b = bounding.b,
                c = bounding.c,
                d = bounding.d;

            ctx.beginPath();

            // rect
            ctx.moveTo( a.x, a.y );
            ctx.lineTo( b.x, b.y );
            ctx.lineTo( c.x, c.y );
            ctx.lineTo( d.x, d.y );
            ctx.lineTo( a.x, a.y );

            ctx.closePath();
        };


        return Shape;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/25 - 16:22
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
    var Sankaku = window.Sankaku,
        Shape = Sankaku.Shape
    ;

    Sankaku.Circle = ( function (){
        var PI2 = Math.PI * 2;

        /**
         * @class Circle
         * @extends Shape
         * @param {number} x
         * @param {number} y
         * @param {number=20} [radius]
         * @param {string} [color] default #000000
         * @param {boolean} [fill] fill or stroke, true: fill, false: stroke
         * @constructor
         */
        function Circle ( x, y, radius, color, fill ) {
            Shape.call( this, x, y, radius, radius, color, fill );

            this._radius = radius || this.width;
        }

        Sankaku.extend( Shape, Circle );

        var p = Circle.prototype;

        p.constructor = Circle;

        /**
         * @method getRadius
         * @return {number}
         */
        p.getRadius = function () {
            return this._radius;
        };

        /**
         * @method clone
         * @return {Circle}
         */
        p.clone = function () {

            return new Circle( this.x, this.y, this._radius, this._color, this._fill );
        };

        /**
         * @method paint
         * @param {CanvasRenderingContext2D} ctx
         */
        p.paint = function ( ctx ) {
            ctx.beginPath();

            ctx.arc( this.x, this.y, this._radius, 0,  PI2, false);

            ctx.closePath();
        };

        return Circle;
    }() );
}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/22 - 21:01
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
    var Sankaku = window.Sankaku,
        Vector2D = Sankaku.Vector2D,
        Object2D = Sankaku.Object2D;

    Sankaku.Vehicle = ( function (){
        var _abs = Math.abs;

        /**
         * @class Vehicle
         * @extends Object2D
         * @constructor
         */
        function Vehicle () {
            Object2D.call( this );

            /**
             * @property _velocity
             * @type {Vector2D}
             * @default new Vector2D( 0, 0 )
             * @protected
             */
            this._velocity = new Vector2D();

            /**
             * @property _mass
             * @type {number}
             * @default 1.0
             * @protected
             */
            this._mass = 1.0;
            /**
             * @property _speed
             * @type {number}
             * @default 10
             * @protected
             */
            this._speed = 10;
            /**
             * @property _behavior
             * @type {string}
             * @default Vehicle.BOUNCE
             * @protected
             */
            this._behavior = Vehicle.BOUNCE;

            /**
             * padding left
             * @property left
             * @type {number}
             */
            this.left = 0;
            /**
             * padding top
             * @property top
             * @type {number}
             */
            this.top = 0;
            /**
             * padding right
             * @property right
             * @type {number}
             */
            this.right = 0;
            /**
             * padding bottom
             * @property bottom
             * @type {number}
             */
            this.bottom = 0;
        }

        Sankaku.extend( Object2D, Vehicle );

        /**
         * @const WRAP
         * @static
         * @type {string}
         */
        Vehicle.WRAP = "vehicle_wrap";
        /**
         * @const BOUNCE
         * @static
         * @type {string}
         */
        Vehicle.BOUNCE = "vehicle_bounce";

        var p = Vehicle.prototype;

        p.constructor = Vehicle;

        /**
         * @method clone
         * @return {Object2D}
         */
        p.clone = function () {
            var clone = new Vehicle();

            // object 2D
            clone.position( this._position.clone() );
            clone.width = this.width;
            clone.height = this.height;
            clone.rotation = this.rotation;

            clone._velocity = this._velocity.clone();
            clone._mass = this._mass;
            clone._speed = this._speed;
            clone._behavior = this._behavior;

            return clone;
        };

        /**
         * @method padding
         * @param {number} top
         * @param {number} [right]
         * @param {number} [bottom]
         * @param {number} [left]
         */
        p.padding = function ( top, right, bottom, left ) {
            right = right || top;
            bottom = bottom || top;
            left = left || top;

            this.top = top;
            this.right = right;
            this.bottom = bottom;
            this.left = left;
        };

        /**
         * 質量を設定します
         * @method mass
         * @param {number} n
         */
        p.mass = function ( n ) {
            this._mass = n;
        };

        /**
         * @method getMass
         * @return {number}
         */
        p.getMass = function () {
            return this._mass;
        };

        /**
         * 最大スピードを設定します
         * @method speed
         * @param {number} n
         */
        p.speed = function ( n ) {
            this._speed = n;
        };

        /**
         * @method getSpeed
         * @return {number}
         */
        p.getSpeed = function () {
            return this._speed;
        };

        /**
         * @method behavior
         * @param {string} str
         */
        p.behavior = function ( str ) {
            this._behavior = str;
        };

        /**
         * @method getBehavior
         * @return {string}
         */
        p.getBehavior = function () {
            return this._behavior;
        };

//        /**
//         * @method position
//         * @param {Vector2D} v
//         */
//        p.position = function ( v ) {
//            this._position = v;
//            this.x = v.x;
//            this.y = v.y;
//        };
//
//        /**
//         * @method getPosition
//         * @return {Vector2D}
//         */
//        p.getPosition = function () {
//            return this._position;
//        };

        /**
         * @method velocity
         * @param {Vector2D} v
         */
        p.velocity = function ( v ) {
            this._velocity = v;
        };

        /**
         * @method getVelocity
         * @return {Vector2D}
         */
        p.getVelocity = function () {
            return this._velocity;
        };
//
//        /**
//         * @method setX
//         * @param {number} x
//         */
//        p.setX = function ( x ) {
//            this.x = x;
//            this._position.x = x;
//        };
//
//        /**
//         * @method setY
//         * @param {number} y
//         */
//        p.setY = function ( y ) {
//            this.y = y;
//            this._position.y = y;
//        };

//        /**
//         * @method bounding
//         * @return {Object} {a: {x: number, y: number}, b: {x: number, y: number}, c: {x: number, y: number}, d: {x: number, y: number}}
//         */
//        p.bounding = function () {
//            var x = this.x,
//                y = this.y,
//                w2 = this.width * 0.5,
//                h2 = this.height * 0.5,
//                rotation = this.rotation,
//                a, b, c, d,
//                ax, ay,
//                bx,
//                cy,
//                sin, cos,
//
//                cos_ax,
//                cos_ay,
//                sin_ay,
//                sin_ax,
//                cos_bx,
//                cos_cy,
//                sin_bx,
//                sin_cy;
//
//            sin = _sin( rotation );
//            cos = _cos( rotation );
//
//            ax = -w2;
//            ay = -h2;
//            bx = w2;
//            cy = h2;
//
//            cos_ax = cos * ax;
//            cos_ay = cos * ay;
//            sin_ay = sin * ay;
//            sin_ax = sin * ax;
//            cos_bx = cos * bx;
//            cos_cy = cos * cy;
//            sin_bx = sin * bx;
//            sin_cy = sin * cy;
//
//            a = { x: cos_ax - sin_ay + x, y: cos_ay + sin_ax + y };
//            b = { x: cos_bx - sin_ay + x, y: cos_ay + sin_bx + y };
//            c = { x: cos_bx - sin_cy + x, y: cos_cy + sin_bx + y };
//            d = { x: cos_ax - sin_cy + x, y: cos_cy + sin_ax + y };
//
//            return { a: a, b: b, c: c, d:d };
//        };

//        /**
//         * @method draw
//         * @param {CanvasRenderingContext2D} ctx
//         */
//        p.draw = function ( ctx ) {
//            var x = this.x,
//                y = this.y;
//
//            ctx.beginPath();
//
//            ctx.moveTo( x + 10, y );
//            ctx.lineTo( x - 10, y + 5 );
//            ctx.lineTo( x - 10, y - 5 );
//            ctx.lineTo( x + 10, y );
//
//            ctx.closePath();
//        };

        /**
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         */
        p.draw = function ( ctx ) {
            var bounding = this.bounding(),
                a, b, c, d;

            a = bounding.a;
            b = bounding.b;
            c = bounding.c;
            d = bounding.d;

            // triangle
            ctx.beginPath();

            ctx.moveTo( a.x, a.y );
//            ctx.lineTo( b.x, b.y );
//            ctx.lineTo( c.x, c.y );
            ctx.lineTo( b.x, b.y + ( (c.y - b.y) * 0.5 ) );
            ctx.lineTo( d.x, d.y );
            ctx.lineTo( a.x, a.y );

            ctx.closePath();
        };

        /**
         * @method update
         * @param {number} w
         * @param {number} h
         */
        p.update = function ( w, h ) {
            this._update( w, h );
        };

        /**
         * @method _update
         * @param {number} w
         * @param {number} h
         * @protected
         */
        p._update = function ( w, h ) {
            var velocity = this._velocity,
                position = this._position;

            w -= this.right;
            h -= this.bottom;

            velocity.truncate( _abs( this._speed ) );
            position.add( velocity );

            switch ( this._behavior ) {

                case Vehicle.WRAP:
                    this.wrap( w, h );
                    break;

                default :
                    this.bounce( w, h );
                    break;
            }

            this.x = position.x;
            this.y = position.y;

            this.rotation = velocity.angle();
        };

        /**
         * @method wrap
         * @param {number} w
         * @param {number} h
         */
        p.wrap = function ( w, h ) {
            var position = this._position,
                is = false,
                left = this.left,
                top = this.top;

            if ( position.x > w ) {

                position.x = left;
                is = true;
            }
            if ( position.x < left ) {

                position.x = w;
                is = true;
            }

            if ( position.y > h ) {

                position.y = top;
                is = true;
            }
            if ( position.y < top ) {

                position.y = h;
                is = true;
            }

            if ( is ) {
                // wrap event
                this.onWrap();
            }
        };

        /**
         * @method onWrap
         */
        p.onWrap  =function () {

        };

        /**
         * @method bounce
         * @param {number} w
         * @param {number} h
         */
        p.bounce = function ( w, h ) {
            var velocity = this._velocity,
                position = this._position,
                is = false,
                left = this.left,
                top = this.top;

            if ( position.x > w ) {

                position.x = w;
                velocity.x *= -1;
                is = true;
            } else if ( position.x < left ) {

                position.x = left;
                velocity.x *= -1;
                is = true;
            }

            if ( position.y > h ) {

                position.y = h;
                velocity.y *= -1;
                is = true;
            } else if ( position.y < top ) {

                position.y = top;
                velocity.y *= -1;
                is = true;
            }

            if ( is ) {
                // wrap event
                this.onBounce();
            }
        };

        /**
         * @method onBounce
         */
        p.onBounce = function () {

        };

        return Vehicle;
    }() );
}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/23 - 21:19
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
    var Sankaku = window.Sankaku,
        Vehicle = Sankaku.Vehicle,
        Vector2D = Sankaku.Vector2D
    ;

    Sankaku.SteeredVehicle = ( function (){
        var PI_05 = Math.PI * 0.5;

        /**
         * @class SteeredVehicle
         * @extends Vehicle
         * @constructor
         */
        function SteeredVehicle () {
            Vehicle.call( this );

            this._force = new Vector2D();
            // max force
            this._force_max = 1.0;
            this._force_arrival = 100;

            // for avoid
            this._avoid_distance = 300;
            this._avoid_buffer = 20;
            this._avoid_insight = 200;
            this._avoid_close = 60;
        }

        Sankaku.extend( Vehicle, SteeredVehicle );

        var p = SteeredVehicle.prototype;

        p.constructor = SteeredVehicle;

        /**
         * @method clone
         * @return {Object2D}
         */
        p.clone = function () {
//            var clone = new SteeredVehicle();
//
//            // object 2D
//            clone.position( this._position.clone() );
//            clone.width = this.width;
//            clone.height = this.height;
//            clone.rotation = this.rotation;
//
//            // vehicle
//            clone._velocity = this._velocity.clone();
//            clone._mass = this._mass;
//            clone._speed = this._speed;
//            clone._behavior = this._behavior;
//            clone._force = this._behavior;

            var clone = Vehicle.prototype.clone.call( this );

            // myself
            clone._force = this._force.clone();
            clone._force_max = this._force_max;
            clone._force_arrival = this._force_arrival;

            clone._avoid_distance = this._avoid_distance;
            clone._avoid_buffer = this._avoid_buffer;
            clone._avoid_insight = this._avoid_insight;
            clone._avoid_close = this._avoid_close;

            return clone;
        };

        /**
         * @method getMax
         * @return {number} SteeredVehicle._force_max
         */
        p.getMax = function () {
            return this._force_max;
        };

        /**
         * @method max
         * @param {number} n
         */
        p.max = function ( n ) {
            this._force_max = n;
        };

        /**
         * @method getArrival
         * @return {number} SteeredVehicle._force_arrival
         */
        p.getArrival = function () {
            return this._force_arrival;
        };

        /**
         * @method arrival
         * @param {number} n
         */
        p.arrival = function ( n ) {
            this._force_arrival = n;
        };

        /**
         * @method force
         * @param {Vector2D} v
         */
        p.force = function ( v ) {
            this._force = v;
        };

        /**
         * @method getForce
         * @return {Vector2D|SteeredVehicle._force}
         *
         */
        p.getForce = function () {
            return this._force;
        };

        /**
         * @method buffer
         * @param {number} n
         */
        p.buffer = function ( n ) {
            this._avoid_buffer = n;
        };
        /**
         * @method getBuffer
         * @return {number|*}
         */
        p.getBuffer = function () {
            return this._avoid_buffer;
        };

        /**
         * @method insight
         * @param {number} n
         */
        p.insight = function ( n ) {
            this._avoid_insight = n;
        };
        /**
         * @method getInsight
         * @return {number|*}
         */
        p.getInsight = function () {
            return this._avoid_insight;
        };

        /**
         * @method close
         * @param {number} n
         */
        p.close = function ( n ) {
            this._avoid_close = n;
        };
        /**
         * @method getClose
         * @return {number|*}
         */
        p.getClose = function () {
            return this._avoid_close;
        };

        /**
         * @method avoidDistance
         * @param {number} n
         */
        p.avoidDistance = function ( n ) {
            this._avoid_distance = n;
        };

        /**
         * @method getAvoidDistance
         * @return {number|*}
         */
        p.getAvoidDistance = function () {
            return this._avoid_distance;
        };

        /**
         * @method update
         * @param {number} w
         * @param {number} h
         */
        p.update = function ( w, h ) {
            this._force.truncate( this._force_max ).divideScalar( this._mass );
            this._velocity.add( this._force );

            this._force = new Vector2D();
            this._update( w, h );
        };

        /**
         * 追求
         * @method seek
         * @param {Vector2D} target
         */
        p.seek = function ( target ) {
            var force = target.subNew( this._position );

            force.normalize().multiplyScalar( this._speed ).sub( this._velocity );

            this._force.add( force );
        };

        /**
         * 逃避
         * @method flee
         * @param {Vector2D} target
         */
        p.flee = function ( target ) {
            var force = target.subNew( this._position );

            force.normalize().multiplyScalar( this._speed ).sub( this._velocity );

            this._force.sub( force );
        };

        /**
         * 到着
         * @method arrive
         * @param {Vector2D} target
         */
        p.arrive = function ( target ) {
            var force = target.subNew( this._position ),
                arrival = this._force_arrival,
                distance;

            force.normalize();
            distance = this._position.distance( target );

            if ( distance > arrival ) {
                // far
                force.multiplyScalar( this._speed );
            } else {
                // near
                force.multiplyScalar( this._speed * distance / arrival );
            }

            force.sub( this._velocity );
            this._force.add( force );
        };

        /**
         * 追跡
         * @method pursue
         * @param {Vehicle} target
         */
        p.pursue = function ( target ) {
            var look = this._position.distance( target.getPosition() ),
                clone = target.getPosition().clone();

            clone.add( target._velocity.multiplyNew( look ) );

            this.seek( clone );
        };

        /**
         * 回避
         * @method evade
         * @param {Vehicle} target
         */
        p.evade = function ( target ) {
            var look = this._position.distance( target.getPosition() ) / this._speed,
                clone = target.getPosition().clone();

            clone.sub( target._velocity.multiplyNew( look ) );

            this.flee( clone );
        };

        /**
         * 物体回避
         * @method avoid
         * @param {Array} targets
         */
        p.avoid = function ( targets ) {
            var target,
                heading,
                difference,
                prod,
                distance,
                feeler,
                projection,
                force,
                prf,
                i, limit;

            for ( i = 0, limit = targets.length; i < limit; i++ ) {

                target = targets[ i ];
                heading = this._velocity.clone().normalize();
                difference = target.getPosition().subNew( this._position );
                prod = difference.dot( heading );

                if ( prod > 0 ) {
                    // 前
                    feeler = heading.clone();
                    feeler.multiplyScalar( this._avoid_distance );

                    projection = heading.clone();
                    projection.multiplyScalar( prod );

                    distance = projection.subNew( difference ).length();

                    if (
                        distance < target.getRadius() + this._avoid_buffer &&
                        projection.length() < feeler.length()
                       ) {

                        force = heading.clone();
                        force.multiplyScalar( this._speed );
                        force.setAngle( difference.sign( this._velocity ) * PI_05 );

                        prf = projection.length() / feeler.length();
                        force.multiplyScalar( 1 - prf );

                        this._force.add( force );
                        this._velocity.multiplyScalar( prf );
                    }// if
                }// prod > 0
            }
        };

        return SteeredVehicle;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/24 - 20:37
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
    var Sankaku = window.Sankaku,
        SteeredVehicle = Sankaku.SteeredVehicle,
        Vector2D = Sankaku.Vector2D;

    Sankaku.Wander = ( function (){
        var _rand = Math.random;

        /**
         * 徘徊
         * @class Wander
         * @extends SteeredVehicle
         * @constructor
         */
        function Wander () {
            SteeredVehicle.call( this );

            this._angle = 0;
            this._distance = 10;
            this._radius = 5;
            this._range = 1;
            this._range2 = this._range * 0.5;
        }

        Sankaku.extend( SteeredVehicle, Wander );

        var p = Wander.prototype;

        p.constructor = Wander;

        /**
         * @method clone
         * @return {Object2D}
         */
        p.clone = function () {
            var clone = new Wander();

            // object 2D
            clone.position( this._position.clone() );
            clone.width = this.width;
            clone.height = this.height;
            clone.rotation = this.rotation;

            // vehicle
            clone._velocity = this._velocity.clone();
            clone._mass = this._mass;
            clone._speed = this._speed;
            clone._behavior = this._behavior;
            clone._force = this._behavior;

            // myself
            clone._force = this._force.clone();
            clone._force_max = this._force_max;
            clone._force_arrival = this._force_arrival;
            clone._avoid_distance = this._avoid_distance;
            clone._avoid_buffer = this._avoid_buffer;
            clone._avoid_insight = this._avoid_insight;
            clone._avoid_close = this._avoid_close;

            // wander
            clone._angle = this._angle;
            clone._distance = this._distance;
            clone._radius = this._radius;
            clone._range = this._range;
            clone._range2 = this._range2;

            return clone;
        };

        /**
         * @method angle
         * @param {number} n
         */
        p.angle = function ( n ) {
            this._angle = n;
        };

        /**
         * @method getAngle
         * @return {number}
         */
        p.getAngle = function () {
            return this._angle;
        };

        /**
         * @method distance
         * @param {number} n
         */
        p.distance = function ( n ) {
            this._distance = n;
        };

        /**
         * @method getDistance
         * @return {number}
         */
        p.getDistance = function () {
            return this._distance;
        };

        /**
         * @method radius
         * @param {number} n
         */
        p.radius = function ( n ) {
            this._radius = n;
        };

        /**
         * @method getRadius
         * @return {number}
         */
        p.getRadius = function () {
            return this._radius;
        };

        /**
         * @method range
         * @param {number} n
         */
        p.range = function ( n ) {
            this._range = n;
            this._range2 = n * 0.5;
        };

        /**
         * @method getRange
         * @return {number}
         */
        p.getRange = function () {
            return this._range;
        };

        /**
         * @method wander
         */
        p.wander = function () {
            var center = this._velocity.clone().normalize().multiplyScalar( this._distance ),
                offset = new Vector2D();

            offset.setLength( this._radius );
            offset.setAngle( this._angle );

            this._angle = _rand() * this._range - this._range2;

            center.add( offset );
            this._force.add( center );
        };

        return Wander;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/25 - 21:12
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
    var Sankaku = window.Sankaku,
        SteeredVehicle = Sankaku.SteeredVehicle,
        Vector2D = Sankaku.Vector2D
    ;

    Sankaku.Flock = ( function (){
        /**
         * 群行動
         * @class Flock
         * @extends SteeredVehicle
         * @constructor
         */
        function Flock () {
            SteeredVehicle.call( this );

            // for flock
            this._flock_insight = 200;
            this._flock_close = 60;
        }

        Sankaku.extend( SteeredVehicle, Flock );

        var p = Flock.prototype;

        p.constructor = Flock;

        /**
         * @method clone
         * @return {Object2D}
         */
        p.clone = function () {
//            var clone = this._clone();
//            var clone = new Flock();
//
//            // object 2D
//            clone.position( this._position.clone() );
//            clone.width = this.width;
//            clone.height = this.height;
//            clone.rotation = this.rotation;
//
//            // vehicle
//            clone._velocity = this._velocity.clone();
//            clone._mass = this._mass;
//            clone._speed = this._speed;
//            clone._behavior = this._behavior;
//            clone._force = this._behavior;
//
//            // myself
//            clone._force = this._force.clone();
//            clone._force_max = this._force_max;
//            clone._force_arrival = this._force_arrival;
//            clone._avoid_distance = this._avoid_distance;
//            clone._avoid_buffer = this._avoid_buffer;
//            clone._avoid_insight = this._avoid_insight;
//            clone._avoid_close = this._avoid_close;

            // super method
            var clone = SteeredVehicle.prototype.clone.call( this );

            // for flock
            clone._flock_insight = this._flock_insight;
            clone._flock_close = this._flock_close;

            return clone;
        };

        /**
         * @method insight
         * @param {number} n
         */
        p.insight = function ( n ) {
            this._flock_insight = n;
        };
        /**
         * @method getInsight
         * @return {number|*}
         */
        p.getInsight = function () {
            return this._flock_insight;
        };

        /**
         * @method close
         * @param {number} n
         */
        p.close = function ( n ) {
            this._flock_close = n;
        };
        /**
         * @method getClose
         * @return {number|*}
         */
        p.getClose = function () {
            return this._flock_close;
        };

        /**
         * @method flock
         * @param {Array} targets
         */
        p.flock = function ( targets ) {
            var average_velocity = this._velocity.clone(),
                average_position = new Vector2D(),
                count = 0,
                vehicle,
                i, limit;

            for ( i = 0, limit = targets.length; i < limit; i++ ) {

                vehicle = targets[ i ];

                if ( vehicle !== this && this.tooInsight( vehicle ) ) {

                    average_velocity.add( vehicle.getVelocity() );
                    average_position.add( vehicle.getPosition() );

                    if ( this.tooClose( vehicle ) ) {

                        this.flee( vehicle.getPosition() );
                    }

                    ++count;
                }
            }// for

            if ( count > 0 ) {
                // count 0 over
                average_velocity.divideScalar( count );
                average_position.divideScalar( count );

                this.seek( average_position );
                this._force.add( average_velocity.sub( this._velocity ) );
            }
        };

        /**
         * @method tooInsight
         * @param {Vehicle} v
         * @return {boolean}
         */
        p.tooInsight = function ( v ) {
            var heading, difference, prod;

            if ( this._position.distance( v._position ) > this._flock_insight ) {

                return false;
            }

            heading = this._velocity.clone().normalize();
            difference = v._position.subNew( this._position );
            prod = difference.dot( heading );

            return prod < 0;
        };

        /**
         * @method tooClose
         * @param {Vehicle} v
         */
        p.tooClose = function ( v ) {
            return this._position.distance( v._position ) < this._flock_close;
        };

        return Flock;
    }() );
}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/27 - 21:21
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
    var Sankaku = window.Sankaku,
        SteeredVehicle = Sankaku.SteeredVehicle;

    Sankaku.FollowPath = ( function (){
        /**
         * 経路追従
         * @class FollowPath
         * @extends SteeredVehicle
         * @constructor
         */
        function FollowPath () {
            SteeredVehicle.call( this );

            this._index = 0;
            this._threshold = 20;
        }

        Sankaku.extend( SteeredVehicle, FollowPath );

        var p = FollowPath.prototype;

        p.constructor = Sankaku.FollowPath;

        /**
         * @method clone
         * @return {Object2D}
         */
        p.clone = function () {
            var clone = new FollowPath();

            // object 2D
            clone.position( this._position.clone() );
            clone.width = this.width;
            clone.height = this.height;
            clone.rotation = this.rotation;

            // vehicle
            clone._velocity = this._velocity.clone();
            clone._mass = this._mass;
            clone._speed = this._speed;
            clone._behavior = this._behavior;
            clone._force = this._behavior;

            // myself
            clone._force = this._force.clone();
            clone._force_max = this._force_max;
            clone._force_arrival = this._force_arrival;
            clone._avoid_distance = this._avoid_distance;
            clone._avoid_buffer = this._avoid_buffer;
            clone._avoid_insight = this._avoid_insight;
            clone._avoid_close = this._avoid_close;

            // follow path
            clone._index = this._index;
            clone._threshold = this._threshold;

            return clone;
        };

        /**
         * @method follow
         * @param {Array} paths
         * @param {boolean=false} [loop]
         */
        p.follow = function ( paths, loop ) {
            loop = !!loop;

            var point = paths[ this._index ];
            if ( !point ) {
                return;
            }

            if ( this._position.distance( point ) < this._threshold ) {
                // under _threshold

                if ( this._index >= paths.length - 1 ) {
                    // end
                    if ( loop ) {
                        // is loop
                        this._index = 0;
                    }
                } else {

                    this._index++;
                }
            }

            if ( this._index > paths.length - 1 && !loop ) {

                this.arrive( point );
            } else {

                this.seek( point );
            }
        };

        return FollowPath;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/07/03 - 11:33
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
    var Sankaku = window.Sankaku;

    Sankaku.Zanzo = ( function (){
        /**
         * @class Zanzo
         * @param {int} limit
         * @constructor
         */
        function Zanzo ( limit ) {
            this._limit = limit;
            this._objects = [];
        }

        var p = Zanzo.prototype;

        p.constructor = Zanzo;

        /**
         * @method add
         * @param {Array} set [ Object2D, [] ]
         */
        p.add = function ( set ) {
            var objects = this._objects,
                clones = [],
                object, i, limit;

            if ( this._limit > 0 && objects.length >= this._limit ) {

                objects.shift();
            }

            for ( i = 0, limit = set.length; i < limit; i++ ) {

                object = set[ i ];
                clones.push( object.clone() );
            }

            this._objects.push( clones );
        };

        /**
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         * @param {Function} paint
         */
        p.draw = function ( ctx, paint ) {
            var objects = this._objects,
                one,
                object,
                step,
                opacity,
                i, limit,
                n, max;

            limit = objects.length;
            step = 1 / ( limit + 1);

            ctx.save();

            for ( i = 0; i < limit; i++ ) {

                one = objects[ i ];
                opacity = step * ( i + 1 );
                ctx.globalAlpha = opacity;

                for ( n = 0, max = one.length; n < max; n++ ) {

                    object = one[ n ];

                    object.draw( ctx );
                    paint.call( ctx );
                }
            }

            ctx.restore();
        };

        return Zanzo;
    }() );
}( window ) );
