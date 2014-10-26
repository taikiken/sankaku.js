/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/07/04 - 16:54
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

    Sankaku.Tripod = ( function (){

        /**
         * 三角形描画
         * @class Tripod
         * @extends Object2D
         * @param {number} x
         * @param {number} y
         * @param {number=20} [width]
         * @param {number=10} [height]
         * @param {String=0} [color] default #000000
         * @param {string=stroke} [fill] fill or stroke or both, Shape.FILL, Shape.STROKE, Shape.BOTH
         * @constructor
         */
        function Tripod ( x, y, width, height, color, fill ) {
            Shape.call( this, x, y, width, height, color, fill );
        }

        Sankaku.extend( Shape, Tripod );

        var p = Tripod.prototype;

        p.constructor = Tripod;

        /**
         * @method clone
         * @return {Tripod}
         */
        p.clone = function () {
            var clone = new Tripod( this.x, this.y, this.width, this.height, this._color, this._fill );

            clone.rotation = this.rotation;
            clone.scale = this.scale;
            clone.visible = this.visible;
            clone._alpha = this._alpha;
            clone._rgb = Object.create( this._rgb );

            clone._line = this._line;
            clone._border = {
                line: this._border.line,
                rgb: this._border.rgb
            };

            return clone;
        };

        /**
         * @method paint
         * @param {CanvasRenderingContext2D} ctx
         * @return {Object} bounding
         */
        p.paint = function ( ctx ) {
            var bounding = this.bounding(),
                a = bounding.a,
                b = bounding.b,
                c = bounding.c,
                d = bounding.d;

            if ( bounding.e.visible ) {
                ctx.beginPath();

                // triangle
                ctx.moveTo( a.x, a.y );
//            ctx.lineTo( b.x, b.y + ( (c.y - b.y) * 0.5 ) );
                ctx.lineTo( ( b.x + c.x ) * 0.5, ( b.y + c.y ) * 0.5 );
                ctx.lineTo( d.x, d.y );
                ctx.lineTo( a.x, a.y );

                ctx.closePath();
            }

            return bounding;
        };

        /**
         * @method _inside
         * @param {Vector2D} v
         * @param {Array} contains
         * @return {Array}
         * @protected
         */
        p._inside = function ( v, contains ) {
            var bounding = this.bounding(),
                b = bounding.b,
                c = bounding.c,
                p = {
                    x: ( b.x + c.x ) * 0.5,
                    y: ( b.y + c.y ) * 0.5
                };

            if (
                this._area( bounding.a, p, v ) > 0 ||
                this._area( p, bounding.d, v ) > 0 ||
                this._area( bounding.d, bounding.a, v ) > 0
                ) {
                // outside
                return contains;
            } else {

                contains.push( this );
            }
            // inside
            return contains;
        };

        return Tripod;
    }() );
}( window ) );