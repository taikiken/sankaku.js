/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/07/05 - 17:00
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
        Shape = Sankaku.Shape,
        Num = Sankaku.Num;

    Sankaku.Star = ( function (){
        var _sin = Math.sin,
            _cos = Math.cos;

        /**
         * @class Star
         * @extends Shape
         * @param {number} x
         * @param {number} y
         * @param {number=20} [radius]
         * @param {string} [color] default #000000
         * @param {string=stroke} [fill] fill or stroke or both, Shape.FILL, Shape.STROKE, Shape.BOTH
         * @param {int=5} [points]
         * @param {int} [inner]
         * @default radius * 0.475
         * @constructor
         */
        function Star ( x, y, radius, color, fill, points, inner ) {
            Shape.call( this, x, y, radius, radius, color, fill );

            this._radius = radius || this.width;
            this._points = points || 5;
            this._inner = inner || radius * 0.475;
        }

        Sankaku.extend( Shape, Star );

        var p = Star.prototype;

        p.constructor = Star;

        /**
         * @method getRadius
         * @return {number}
         */
        p.radius = function () {
            return this._radius;
        };

        /**
         * @method clone
         * @return {Star}
         */
        p.clone = function () {
            var clone =  new Star( this.x, this.y, this._radius, this._color, this._fill, this._points );

            clone.rotation = this.rotation;
            clone.scale = this.scale;
            clone._alpha = this._alpha;
            clone._rgb = Object.create( this._rgb );

            clone._line = this._line;
            clone._border = {
                line: this._border.line,
                rgb: this._border.rgb
            };

            return clone;
        };

        //http://www.fascinatedwithsoftware.com/blog/post/2012/11/03/How-to-Draw-a-Star-with-HTML5.aspx
        /**
         * @method paint
         * @param {CanvasRenderingContext2D} ctx
         * @return {Object} bounding
         */
        p.paint = function ( ctx ) {
            var bounding = this.bounding(),
                e = bounding.e,
                points = this._points,
                limit = points * 2,
                step = Num.ONE_EIGHTY / points,
                ninety = Num.NINETY,
//                scale = this.scale,
                scale = e.scale,
                outer = this._radius * scale,
                inner = this._inner * scale,
//                x = this.x,
//                y = this.y,
                x = e.x,
                y = e.y,
                rotation = e.rotation,
                i, angle, r;

            ctx.beginPath();

            for ( i = 0; i <= limit; ++i ) {

                angle = i * step - ninety + rotation;
                r = i % 2 ? inner : outer;

                ctx.lineTo( x + r * _cos( angle ), y + r * _sin( angle ) );
            }

            ctx.closePath();

            return bounding;
        };

        return Star;
    }() );

}( window ) );