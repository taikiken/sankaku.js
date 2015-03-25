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
    var Sankaku = window.Sankaku;

    Sankaku.Line = ( function (){
        var
          Object2D = Sankaku.Object2D,
          Shape = Sankaku.Shape;

        /**
         * @class Line
         * @extends Object2D
         * @param {Object2D} v1
         * @param {Object2D} v2
         * @param {string=0} [color] hex, default #000000
         * @param {Number=1} [line] line width
         * @constructor
         */
        function Line ( v1, v2, color, line ) {
            Object2D.call( this );

            /**
             * @property _v1
             * @type {Object2D}
             * @protected
             */
            this._v1 = v1;
            /**
             * @property _v2
             * @type {Object2D}
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

        p.constructor = Line;

        /**
         * @method _clone
         * @return {Line}
         * @protected
         */
        p._clone = function () {
            var clone = new Line( this._v1, this._v2, this._color, this._line );
            clone.setAlpha( this._alpha );
            clone.scale = this.scale;
            clone.visible = this.visible;
            clone.setColor( this._color );

            return clone;
        };

        /**
         * @method segment
         * @return {{start: *|Vector2D, end: |Vector2D}}
         */
        p.segment = function () {
            return {
                start: this._v1,
                end: this._v2
            };
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
         * not use
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
        p.remove = function ( target ) {
            // empty
            return this;
        };

        // ////////////////////////////////////////////////////////////////
        // override
        /**
         * @method bounding
         */
        p.bounding = function () {
            var parent = this.parent,
              my_bounding,
              e;

            e = {
                scale: this.scale,
                rotation: this.rotation,
                alpha: this._alpha,
                x: this.x,
                y: this.y
            };

            if ( !!parent && this.scene !== parent ) {

                e.scale = parent.scale * this.scale;
                e.alpha = parent.alpha() * this._alpha;
            }

            my_bounding = { e: e, a: this._v1.bounding().e, b: this._v2.bounding().e };
            this._bounding = my_bounding;

            return my_bounding;
        };

        /**
         * not use
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

        /**
         * @method _draw
         * @param {CanvasRenderingContext2D} ctx
         * @protected
         */
        p._draw = function ( ctx ) {
            var bounding = this.paint( ctx ),
              rgba = this._rgba( this._rgb, bounding.e.alpha );

            this.stroke( ctx, this._line, rgba );
        };

        /**
         * @method stroke
         * @param {CanvasRenderingContext2D} ctx
         * @param {number} line
         * @param {object} color
         */
        p.stroke = function ( ctx, line, color ) {
            ctx.lineWidth = line;
            ctx.strokeStyle = "rgba(" + color.r +","+color.g+","+color.b+","+color.a+")";

            ctx.stroke();
        };

        /**
         * @method paint
         * @param {CanvasRenderingContext2D} ctx
         * @return {Object} bounding
         */
        p.paint = function ( ctx ) {
            var v1 = this._v1,
              v1_bounding = v1.bounding(),
              v1_e = v1_bounding.e,
              v2 = this._v2,
              v2_bounding = v2.bounding(),
              v2_e = v2_bounding.e,
              bounding = this.bounding();

            ctx.beginPath();

            // line, v1 to v2
            ctx.lineTo( v1_e.x, v1_e.y );
            ctx.lineTo( v2_e.x, v2_e.y );

            ctx.closePath();

            return bounding;
        };

        return Line;
    }() );
}( window ) );