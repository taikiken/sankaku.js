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
    var Sankaku = window.Sankaku;

    Sankaku.Circle = ( function (){
        var
          PI2 = Math.PI * 2,
          _pow = Math.pow,
          _sqrt = Math.sqrt,

          Shape = Sankaku.Shape,
          Vector2D = Sankaku.Vector2D;

        /**
         * @class Circle
         * @extends Shape
         * @param {number} x
         * @param {number} y
         * @param {number=20} [radius]
         * @param {string=0} [color] default #000000
         * @param {string=stroke} [fill] fill or stroke or both, Shape.FILL, Shape.STROKE, Shape.BOTH
         * @constructor
         */
        function Circle ( x, y, radius, color, fill ) {
            Shape.call( this, x, y, radius * 2, radius * 2, color, fill );
            /**
             * @property _radius
             * @type {number|*}
             * @protected
             */
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
              e = bounding.e;

            if ( e.visible ) {

                ctx.beginPath();

                ctx.arc( e.x, e.y, this._radius * e.scale, 0, PI2, false );

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
            var r = this._radius;

            if ( _pow( this.x - v.x, 2 ) + _pow( this.y - v.y, 2 ) < r * r ) {
                // inside
                contains.push( this );
            }

            return contains;
        };

        /**
         * @method contain
         * @param {Vector2D} v
         * @return {boolean}
         */
        p.contain = function ( v ) {
            var results = [];

            this._inside( v, results );

            return results.length > 0;
        };

        /**
         * @method intersect
         * @param {Line} o
         * @return {boolean}
         */
        p.intersect = function ( o ) {
            var segment = o.segment(),
              v1 = segment.start,
              v2 = segment.end,
              v1_e, v2_e,
              v1_v, v2_v,
              radius,
              bounding,
              e,
              AB, BC, AC, BD,
              x_min, x_max, y_min, y_max,
              center;

            v1_e = v1.bounding().e;
            v2_e = v2.bounding().e;
            v1_v = new Vector2D( v1_e.x, v1_e.y );
            v2_v = new Vector2D( v2_e.x, v2_e.y );

            // check point inside
            if ( this.contain( v1_v ) ) {

                return true;
            }
            // check point inside
            if ( this.contain( v2_v ) ) {

                return true;
            }

            radius = this.radius();
            bounding = this.bounding();
            e = bounding.e;

            x_min = e.x - radius;
            x_max = e.x + radius;
            y_min = e.y - radius;
            y_max = e.y + radius;

            // x check
            if ( ( v1_e.x < x_min  && v2_e.x < x_min ) || ( v1_e.x > x_max && v2_e.x > x_max ) ) {
                // outside x
                return false;
            }

            // y check
            if ( ( v1_e.y < y_min && v2_e.y < y_min ) || ( v1_e.y > y_max && v2_e.y > y_max ) ) {
                // outside y
                return false;
            }

            // contain check
            center = new Vector2D( e.x, e.y );

            AB = v1_v.distance( center );
            BC = v2_v.distance( center );
            AC = v1_v.distance( v2_v );
            BD = _sqrt( ( ( AC+BC+AB )*( AC-BC+AB )*( -AC+BC+AB )*( AC+BC-AB ) ) / ( 4*AC*AC ) );

            return BD <= radius;
        };

        return Circle;
    }() );
}( window ) );