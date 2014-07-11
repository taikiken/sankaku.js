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

            this.width = width || 20;
            this.height = height || 10;

            /**
             * @property _fill
             * @type {string}
             * @default Shape.STROKE
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
//             * @property setBorder
//             * @default { width: 0, setColor: "#000000" }
//             * @type {{width: number, setColor: string}}
//             */
//            this.setBorder = {
//                width: 0,
//                setColor: "#000000"
//            };

            this._rgb = {};

            /**
             * @property _color
             * @type {String}
             * @default #000000
             * @protected
             */
            this._color = color || "#000000";
            this.setColor( this._color );

            this.setBorder( this.setLine, this._color );
        }

        Sankaku.extend( Object2D, Shape );

        /**
         * @const FILL
         * @static
         * @type {string}
         */
        Shape.FILL = "shape_fill";
        /**
         * @const STROKE
         * @static
         * @type {string}
         */
        Shape.STROKE = "shape_stroke";
        /**
         * @const BOTH
         * @static
         * @type {string}
         */
        Shape.BOTH = "shape_both";

        var p = Shape.prototype;

        p.constructor = Sankaku.Shape;

        /**
         * @method radius
         * @return {number}
         */
        p.radius = function () {
            var bounding = this.bounding(),
                a = bounding.a,
                c = bounding.c;

            return new Vector2D( a.x, a.y ).distance( new Vector2D( c.x, c.y ) ) * 0.5;
        };

        /**
         * @method clone
         * @return {Shape}
         */
        p.clone = function () {
            var clone = new Shape( this.x, this.y, this.width, this.height, this._color, this._fill );

//            clone.setPosition( this._position.clone() );
//            clone.width = this.width;
//            clone.height = this.height;
            clone.rotation = this.rotation;
            clone.scale = this.scale;
            clone._alpha = this._alpha;
            clone._rgb = Object.create( this._rgb );

            clone._line = this._line;
            clone._border = {
                setLine: this._border.setLine,
                rgb: this._border.rgb
            };

            return clone;
        };

        /**
         * @method setBorder
         * @param {number} line
         * @param {string} color hex
         * @return {Shape}
         */
        p.setBorder = function ( line, color ) {
            var rgb = Iro.hex2rgb( color );
            rgb.a = this._alpha;

            this._border = {
                setLine: line,
                rgb: rgb
            };

            return this;
        };

        /**
         * @method setColor
         * @param {String} hex
         * @return {Shape}
         */
        p.setColor = function ( hex ) {
            this._color = hex;

            this._rgb = Iro.hex2rgb( hex );
            this._rgb.a = this._alpha;

            return this;
        };

        /**
         * @method setMode
         * @param {string} fill
         * @return {Shape}
         */
        p.setMode = function ( fill ) {
            this._fill = fill;
            return this;
        };
        /**
         * @method mode
         * @return {boolean}
         */
        p.mode = function () {
            return this._fill;
        };

        /**
         * @method setLine
         * @param {number} n
         * @return {Shape}
         */
        p.setLine = function ( n ) {
            this._line = n;
            return this;
        };

        /**
         * @method line
         * @return {number}
         */
        p.line = function () {
            return this._line;
        };

        /**
         * @method _draw
         * @protected
         * @param {CanvasRenderingContext2D} ctx
         */
        p._draw = function ( ctx ) {
            switch ( this._fill ) {

                case Shape.STROKE:
                    this.stroke( ctx, this._line, this._rgb );
                    break;

                case Shape.FILL:
                    this.fill( ctx, this._rgb );
                    break;

                case Shape.BOTH:
                    this.stroke( ctx, this._border._line, this._border._rgb );
                    this.fill( ctx, this._rgb );
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