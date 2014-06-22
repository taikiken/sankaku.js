/**
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
Sankaku.version = "0.0.1";

( function ( window ){
    "use strict";

    var _abs = Math.abs,
        _min = Math.min,
        _max = Math.max,
        _round = Math.round,
        Sankaku = window.Sankaku;

    var Triangle = ( function (){
        //
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
         * @returns {{x: number, y: number}}
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

    Sankaku.Triangle = Triangle;

    window.Sankaku = ( function (){
        /**
         * https://github.com/ironwallaby/delaunay
         *
         * @class Sankaku
         * @constructor
         */
        function Sankaku () {
            throw new Error( "Sankaku can't create instance." );
        }

        var s = Sankaku;

        /**
         * @method byX
         * @static
         * @param {object} a
         * @param {object} b
         * @returns {number}
         */
        s.byX = function ( a, b ) {
            return b.x - a.x;
        };

        /**
         * @method dedup
         * @static
         * @param {Array} edges
         */
        s.dedup = function ( edges ) {
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

        /**
         * @method triangulate
         * @static
         * @param vertices
         * @returns {Array}
         */
        s.triangulate = function ( vertices ) {
            // if there aren't enough vertices to form any triangles.
            if(vertices.length < 3) {
                return [];
            }

            var byX = s.byX,
                dedup = s.dedup,
                vertex,
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

        return Sankaku;
    }() );

}( window ) );
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
         * @returns {object} {h: number, s: number, l: number}
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
         * @returns {object} {r: number, g: number, b: number}
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
         * @returns {object} {h: number, s: number, v: number}
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
         * @returns {object} {r: number, g: number, b: number}
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
         * @returns {object} {r: number, g: number, b: number}
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
         * @returns {string}
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
         * @returns {string}
         */
        iro.int2hex = function ( num ) {
            num = Math.floor( num );

            var hex = num.toString( 16 );

            if ( hex.length < 3 ) {

                var i = hex.length,
                    sub = 3 - i;

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

        /**
         * ベクトルを可視化するのに用います
         * <br>デバッグなどで使用します。
         *
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         * @returns {Vector2D}
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
         * @returns {Vector2D}
         */
        p.clone = function () {
            return new Vector2D( this.x, this.y );
        };

        /**
         * ベクトルのx, yの値を 0 にします
         * @method zero
         * @returns {Vector2D}
         */
        p.zero = function () {
            this.x = 0;
            this.y = 0;

            return this;
        };

        /**
         * ベクトルの値が x, y 共 0 かどうかを判定します
         * @method isZero
         * @returns {boolean}
         */
        p.isZero = function () {
            return this.x === 0 && this.y === 0;
        };

        /**
         * ベクトルへ値を設定します
         * @method set
         * @param {number} x
         * @param {number} y
         * @returns {Vector2D}
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
         * @returns {Vector2D}
         */
        p.setX = function ( x ) {
            this.x = x;

            return this;
        };

        /**
         * ベクトルの y へ値を設定します
         * @method setY
         * @param {number} y
         * @returns {Vector2D}
         */
        p.setY = function ( y ) {
            this.y = y;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を複写します
         * @method copy
         * @param {Vector2D} v
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
         */
        p.addNew = function ( v ) {
            return new Vector2D( this.x + v.x, this.y + v.y );
        };

        /**
         * 二つのベクトルの値を加算します
         * @method addVector
         * @param {Vector2D} a
         * @param {Vector2D} b
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
         */
        p.subNew = function ( v ) {
            return new Vector2D( this.x - v.x, this.y - v.y );
        };

        /**
         * 二つのベクトルの値を減算します
         * @method subVector
         * @param {Vector2D} a
         * @param {Vector2D} b
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
         */
        p.multiplyNew = function ( v ) {
            return new Vector2D( this.x * v.x, this.y * v.y );
        };

        /**
         * ベクトルへ引数ベクトルの値を除算します
         * @method divide
         * @param {Vector2D} v
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
         */
        p.divideNew = function ( v ) {
            return new Vector2D( this.x / v.x, this.y / v.y );
        };

        /**
         * ベクトルへ引数ベクトルの値と比較し小さな方の値を設定します
         * @method min
         * @param {Vector2D} v
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
         */
        p.floor = function () {
            this.x = Math.floor( this.x );
            this.y = Math.floor( this.y );

            return this;
        };

        /**
         * @method ceil
         * @returns {Vector2D}
         */
        p.ceil = function () {
            this.x = Math.ceil( this.x );
            this.y = Math.ceil( this.y );

            return this;
        };

        /**
         * @method round
         * @returns {Vector2D}
         */
        p.round = function () {
            this.x = Math.round( this.x );
            this.y = Math.round( this.y );

            return this;
        };

        /**
         * @method roundToZero
         * @returns {Vector2D}
         */
        p.roundToZero = function () {
            this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
            this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );

            return this;
        };

        /**
         * @method negate
         * @returns {Vector2D}
         */
        p.negate = function () {
            return this.multiplyScalar( - 1 );
        };

        /**
         * ベクトルと引数ベクトルの内積を計算します
         * @method dot
         * @param {Vector2D} v 内積をとる Vector2D インスタンス
         * @returns {number}
         */
        p.dot = function ( v ) {
            return this.x * v.x + this.y * v.y;
        };

        /**
         * ベクトルの大きさの２条を計算します
         * @method lengthSq
         * @returns {number}
         */
        p.lengthSq = function () {
            return this.x * this.x + this.y * this.y;
        };

        /**
         * ベクトルの大きさの２条の平方根を計算します
         * @method length
         * @returns {number}
         */
        p.length = function () {
            return Math.sqrt( this.lengthSq() );
        };

        /**
         * ベクトルの大きさを設定します
         * @method setLength
         * @param {number} l
         * @returns {Vector2D}
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
         * @param {number} value
         * @returns {Vector2D}
         */
        p.setAngle = function ( value ) {
            var len = this.length();

//            this.x = Math.cos( value ) * len;
//            this.y = Math.sin( value ) * len;
            this.x = Math.cos( value );
            this.y = Math.sin( value );

            return this;
        };

        /**
         * ベクトルの角度を設定します
         * @method angle
         * @returns {number}
         */
        p.angle = function () {
            return Math.atan2( this.y, this.x );
        };

        /**
         * ベクトルの大きさを正規化（大きさを1）にします
         *
         * @method normalize
         * @returns {Vector2D}
         */
        p.normalize = function () {
            return this.divideScalar( this.length() );
        };

        /**
         * ベクトルと引数ベクトル間の距離の２条を計算します
         * @method distanceSq
         * @param {Vector2D} v
         * @returns {number}
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
         * @returns {number}
         */
        p.distance = function ( v ) {
            return Math.sqrt( this.distanceSq( v ) );
        };

        /**
         * @method lerp
         * @param {Vector2D} v
         * @param {number} alpha
         * @returns {Vector2D}
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
         * @returns {boolean}
         */
        p.equals = function ( v ) {
            return ( ( v.x === this.x ) && ( v.y === this.y ) );
        };

        /**
         * 配列を使いベクトルを設定します
         * @method fomArray
         * @param {Array} array [x: number, y: number]
         * @returns {Vector2D}
         */
        p.fomArray = function ( array ) {
            this.x = array[ 0 ];
            this.y = array[ 1 ];

            return this;
        };

        /**
         * ベクトルの値を配列として返します
         * @method toArray
         * @returns {[]} [x: number, y: number]
         */
        p.toArray = function () {
            return [ this.x, this.y ];
        };

        /**
         * ベクトルの値を設定した値以下にします
         * @method truncate
         * @param {number} max
         * @returns {Vector2D}
         */
        p.truncate = function ( max ) {
            var min = Math.min( max, this.length() );
            return this.setLength( min );
        };

        /**
         * ベクトルの値を反転します
         * @method reverse
         * @returns {Vector2D}
         */
        p.reverse = function () {
            this.x *= -1;
            this.y *= -1;

            return this;
        };

        /**
         * ベクトルが正規化されているかを判定します
         * @method isNormalize
         * @returns {boolean}
         */
        p.isNormalize = function () {
            return this.length() === 1;
        };

        /**
         * このベクトルに垂直なベクトルを生成し返します
         * @method prev
         * @returns {Vector2D} このベクトルに垂直なベクトル
         */
        p.prev = function () {
            return new Vector2D( -this.y, this.x );
        };

        /**
         * 引数ベクトルが、このベクトルの左側にあるか右側かを判定します
         *
         * @method sign
         * @param {Vector2D} v
         * @returns {number} -1: 左側, 1: 右側
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
         * @returns {number}
         */
        Vector2D.angleBetween = function ( v1, v2 ) {

            if ( !v1.isNormalize() ) {

                v1 = v1.clone().normalize();
            }
            if ( !v2.isNormalize() ) {

                v2 = v2.clone().normalize();
            }

            return Math.acos( v1.dot( v2 ) );
        };

        return Vector2D;
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
    var document = window.document,

        Sankaku = window.Sankaku,
        Vector2D = Sankaku.Vector2D,

        _cos = Math.cos,
        _sin = Math.sin,
        PI = Math.PI,
        ONE_RADIAN = 180 / PI;

    Sankaku.Vehicle = ( function (){
        /**
         * @class Vehicle
         * @constructor
         */
        function Vehicle () {
            this._position = new Vector2D();
            this._velocity = new Vector2D();

            this._mass = 1.0;
            this._speed = 10;
            this._behavior = Vehicle.BOUNCE;

            /**
             * @property x
             * @type {number}
             */
            this.x = 0;
            /**
             * @property y
             * @type {number}
             */
            this.y = 0;
            this.rotation = 0;
        }

        var p = Vehicle.prototype;

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
         * @returns {number}
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
         * @returns {number}
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
         * @returns {string}
         */
        p.getBehavior = function () {
            return this._behavior;
        };

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
         * @returns {Vector2D}
         */
        p.getPosition = function () {
            return this._position;
        };

        /**
         * @method velocity
         * @param {Vector2D} v
         */
        p.velocity = function ( v ) {
            this._velocity = v;
        };

        /**
         * @method getVelocity
         * @returns {Vector2D}
         */
        p.getVelocity = function () {
            return this._velocity;
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
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         */
        p.draw = function ( ctx ) {
            var x = this.x,
                y = this.y,
                rotation = this.rotation,
                x10, y5, x10_, y5_,
                rx, ry;

//            x10 = x + 10;
//            y5 = y + 5;
//            x10_ = x - 10;
//            y5_ = y - 5;
//
//            rx = x * _cos( rotation ) - y * _sin( rotation );
//            ry = x * _sin( rotation ) + y * _cos( rotation );
//            ctx.save();

//            ctx.rotate( rotation );
            ctx.beginPath();
            ctx.moveTo( x + 10, y );
            ctx.lineTo( x - 10, y + 5 );
            ctx.lineTo( x - 10, y - 5 );

//            ctx.lineTo( ( x - x10_ ) * _cos( rotation ) - ( y - y5 ) * _sin( rotation ) + x10_, ( x - x10_ ) * _sin( rotation ) - ( y - y5 ) * _cos( rotation ) + y5 );
//            ctx.lineTo( ( x - x10_ ) * _cos( rotation ) - ( y - y5_ ) * _sin( rotation ) + x10_, ( x - x10_ ) * _sin( rotation ) - ( y - y5_ ) * _cos( rotation ) + y5_ );

            ctx.lineTo( x + 10, y );
            ctx.closePath();

//            ctx.restore();
        };

        /**
         * @method update
         * @param {number} w
         * @param {number} h
         */
        p.update = function ( w, h ) {
            var velocity = this._velocity,
                position = this._position;

            velocity.truncate( this._speed );
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
//            this.rotation = velocity.angle() * ONE_RADIAN;
            // rotation is radian
            this.rotation = velocity.angle();
        };

        /**
         * @method wrap
         * @param {number} w
         * @param {number} h
         */
        p.wrap = function ( w, h ) {
            var position = this._position;

            if ( position.x > w ) {

                position.x = 0;
            }
            if ( position.x < 0 ) {

                position.x = w;
            }

            if ( position.y > h ) {

                position.y = 0;
            }
            if ( position.y < 0 ) {

                position.y = h;
            }
        };

        /**
         * @method bounce
         * @param {number} w
         * @param {number} h
         */
        p.bounce = function ( w, h ) {
            var velocity = this._velocity,
                position = this._position;

            if ( position.x > w ) {

                position.x = w;
                velocity.x *= -1;
            } else if ( position.x < 0 ) {

                position.x = 0;
                velocity.x *= -1;
            }

            if ( position.y > h ) {

                position.y = h;
                velocity.y *= -1;
            } else if ( position.y < 0 ) {

                position.y = 0;
                velocity.y *= -1;
            }
        };

        return Vehicle;
    }() );
}( window ) );
