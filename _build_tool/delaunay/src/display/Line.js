/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/07/16 - 12:44
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
        Shape = Sankaku.Shape,
        Iro = Sankaku.Iro;

    Sankaku.Line = ( function (){
        // @class Line
        function Line ( v1, v2, color, line ) {
            Object2D.call( this );

            /**
             * @property _v1
             * @type {Object|Vector2D}
             * @protected
             */
            this._v1 = v1;
            /**
             * @property _v2
             * @type {Object|Vector2D}
             * @protected
             */
            this._v2 = v2;

            /**
             * @property _fill
             * @type {string}
             * @default Shape.STROKE
             * @protected
             */
            this._fill = Shape.STROKE;

            line = line || 1;
            /**
             * @property _line
             * @type {number}
             * @default 1
             * @protected
             */
            this._line = line;

            /**
             * @property _rgb
             * @type {{r: number, g: number, b: number}}
             * @protected
             */
            this._rgb = {
                r: 0,
                g: 0,
                b: 0
            };

            color = color || "#000000";
            /**
             * @property _color
             * @type {String}
             * @default #000000
             * @protected
             */
            this._color = color;
            this.setColor( color );
        }

        Sankaku.extend( Object2D, Line );

        var p = Line.prototype;

        p.constructor = Sankaku.Line;

        p.clone = function () {
            var clone = new Line( this._v1, this._v2, this._color, this._line );
            clone.setAlpha( this._alpha );
            clone.scale = this.scale;
            clone.visible = this.visible;
            clone.setColor( this._color );

            return clone;
        };

        /**
         * not use
         * @method setPosition
         * @param {Vector2D} v
         * @return {Object2D}
         */
        p.setPosition = function ( v ) {
            // empty

            return this;
        };
        /**
         * @method setX
         * @param {number} x
         * @return {Object2D}
         */
        p.setX = function ( x ) {
            // empty

            return this;
        };
        /**
         * not use
         * @method setY
         * @param {number} y
         * @return {Object2D}
         */
        p.setY = function ( y ) {
            // empty

            return this;
        };
        /**
         * not use
         * @method setRotate
         * @param {number} degree 0 ~ 360
         * @return {Object2D}
         */
        p.setRotate = function ( degree ) {
            // empty

            return this;
        };
        /**
         * not use
         * @method add
         * @param {Object2D} target
         * @return {*|Object2D}
         */
        p.add = function ( target ) {
            // empty
            return this;
        };
        /**
         * not use
         * @method remove
         * @param {*|Object2D} target
         * @return {Object2D}
         */
        p.remove = function () {
            // empty
            return this;
        };

        // ////////////////////////////////////////////////////////////////
        // over ride
        /**
         * @method bounding
         */
        p.bounding = function () {

        };

        /**
         * @method _inside
         * @param {Vector2D} v
         * @param {Array} contains
         * @return {Array}
         * @protected
         */
        p._inside = function ( v, contains ) {
//            var bounding = this.bounding();
//
//            if (
//                this._area( bounding.a, bounding.b, v ) > 0 ||
//                this._area( bounding.b, bounding.c, v ) > 0 ||
//                this._area( bounding.c, bounding.d, v ) > 0 ||
//                this._area( bounding.d, bounding.a, v ) > 0
//                ) {
//                // outside
//                return contains;
//            } else {
//
//                contains.push( this );
//            }
            // inside
            return contains;
        };


        return Line;
    }() );
}( window ) );