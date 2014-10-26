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
         * ポリゴン（三角形）分割
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