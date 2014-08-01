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
        Shape = Sankaku.Shape;

    Sankaku.Circle = ( function (){
        var PI2 = Math.PI * 2,
            _sin = Math.sin,
            _cos = Math.cos,
            _pow = Math.pow;

        /**
         * @class Circle
         * @extends Shape
         * @param {number} x
         * @param {number} y
         * @param {number=20} [radius]
         * @param {string} [color] default #000000
         * @param {string=stroke} [fill] fill or stroke or both, Shape.FILL, Shape.STROKE, Shape.BOTH
         * @constructor
         */
        function Circle ( x, y, radius, color, fill ) {
            Shape.call( this, x, y, radius * 2, radius * 2, color, fill );

            this._radius = radius || this.width;
        }

        Sankaku.extend( Shape, Circle );

        var p = Circle.prototype;

        p.constructor = Circle;

        /**
         * @method getRadius
         * @return {number}
         */
        p.radius = function () {
            return this._radius * this.scale;
        };

        /**
         * @method clone
         * @return {Circle}
         */
        p.clone = function () {

            var clone =  new Circle( this.x, this.y, this._radius, this._color, this._fill );

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

        /**
         * @method paint
         * @param {CanvasRenderingContext2D} ctx
         * @return {Object} bounding
         */
        p.paint = function ( ctx ) {
            var bounding = this.bounding(),
                e = bounding.e;

            ctx.beginPath();

            ctx.arc( e.x, e.y, this._radius * e.scale, 0,  PI2, false);

            ctx.closePath();

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
            var r = this._radius;

            if ( _pow( this.x - v.x, 2 ) + _pow( this.y - v.y, 2 ) < r * r ) {
                // inside
                contains.push( this );
            }

            return contains;
        };

        p.contain = function ( v ) {
            var results = [];

            this._inside( v, results );

            return results.length > 0;
        };

        return Circle;
    }() );
}( window ) );