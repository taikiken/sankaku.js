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
        Num = Sankaku.Num,
        Iro = Sankaku.Iro
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
         * @param {string=stroke} [fill] fill or stroke or both, Shape.FILL, Shape.STROKE, Shape.BOTH
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
             * @property _fill
             * @type {string}
             * @default stroke
             * @protected
             */
            this._fill = fill || Shape.STROKE;

            /**
             * @property _line
             * @type {number}
             * @default 1
             * @protected
             */
            this._line = 1;

//            /**
//             * @property border
//             * @default { width: 0, color: "#000000" }
//             * @type {{width: number, color: string}}
//             */
//            this.border = {
//                width: 0,
//                color: "#000000"
//            };


            /**
             * @property _alpha
             * @type {number}
             * @default 1
             * @protected
             */
            this._alpha = 1;

            this._rgb = {};

            /**
             * @property _color
             * @type {String}
             * @default #000000
             * @protected
             */
            this._color = color || "#000000";
            this.color( this._color );

            this.border( this.line, this._color );
        }

        Sankaku.extend( Object2D, Shape );

        Shape.FILL = "shape_fill";
        Shape.STROKE = "shape_stroke";
        Shape.BOTH = "shape_both";

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
            var clone = new Shape( this.x, this.y, this.width, this.height, this._color, this._fill );

            clone.position( this._position.clone() );
//            clone.width = this.width;
//            clone.height = this.height;
            clone.rotation = this.rotation;
            clone.scale = this.scale;
            clone._alpha = this._alpha;
            clone._rgb = this._rgb;

            clone._line = this._line;
            clone._border = {
                line: this._border.line,
                rgb: this._border.rgb
            };

            return clone;
        };

        p.border = function ( line, color ) {
            var rgb = Iro.hex2rgb( color );
            rgb.a = this._alpha;

            this._border = {
                line: line,
                rgb: rgb
            };
        };

        /**
         * @method color
         * @param {String} hex
         */
        p.color = function ( hex ) {
            this._color = hex;

            this._rgb = Iro.hex2rgb( hex );
            this._rgb.a = this._alpha;
        };

        /**
         * @method alpha
         * @param {Number} n
         */
        p.alpha = function ( n ) {
            this._alpha = n;
            this.color( this._color );
        };

        /**
         * @method mode
         * @param {string} fill
         */
        p.mode = function ( fill ) {
            this._fill = fill;
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

            switch ( this._fill ) {

                case Shape.STROKE:
                    this.stroke( ctx, this._line, this._rgb );
                    break;

                case Shape.FILL:
                    this.fill( ctx, this._rgb );
                    break;

                case Shape.BOTH:
                    this.fill( ctx, this._rgb );
                    this.stroke( ctx, this._line, this._rgb );
                    break;
            }
        };

        /**
         * @method fill
         * @param {CanvasRenderingContext2D} ctx
         * @param {object} color
         */
        p.fill = function ( ctx, color ) {
            ctx.fillStyle = "rgba(" + color.r +","+color.g+","+color.b+","+color.a+")";

            this.paint( ctx );

            ctx.fill();
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