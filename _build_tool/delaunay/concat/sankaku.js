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
 */
var Sankaku = { version: "0.0.1" };

( function ( window ){
    "use strict";

    var _abs = Math.abs,
        _min = Math.min,
        _max = Math.max,
        _round = Math.round;

    var Triangle = ( function (){
        //
        /**
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

    window.Sankaku = ( function (){
        /**
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

                        continue outer
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
                    { x: x_mid            , y: y_mid + 20 * d_max, __sentinel: true },
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
                    open.push( new Triangle( a, b, vertex ) )
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
         * @method rgb2hsl
         * @static
         * @param {int} r
         * @param {int} g
         * @param {int} b
         * @returns {{h: number, s: number, l: number}}
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
         * @returns {{r: number, g: number, b: number}}
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
         * @returns {{h: number, s: number, v: number}}
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
         * @returns {{r: number, g: number, b: number}}
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
         * @param {string} hex #NNN
         * @returns {{r: number, g: number, b: number}}
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
