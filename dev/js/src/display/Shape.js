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
    var Sankaku = window.Sankaku;

    Sankaku.Shape = ( function (){
        var
          Object2D = Sankaku.Object2D,
          Vector2D = Sankaku.Vector2D,
          Iro = Sankaku.Iro;

        /**
         * @class Shape
         * @extends Object2D
         * @param {number} x
         * @param {number} y
         * @param {number=20} [width]
         * @param {number=10} [height]
         * @param {String=0} [color] default #000000
         * @param {string=stroke} [fill] fill or stroke or both, Shape.FILL, Shape.STROKE, Shape.BOTH
         * @constructor
         */
        function Shape ( x, y, width, height, color, fill ) {
            Object2D.call( this );

            this.setX( x );
            this.setY( y );
            /**
             * @property width
             * @type {number}
             */
            this.width = width || 20;
            /**
             * @property height
             * @type {number}
             */
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

            this.setBorder( this._line, this._color );
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

        p.constructor = Shape;

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
            clone.visible = this.visible;
            clone._alpha = this._alpha;
            clone._rgb = Object.create( this._rgb );

            clone._line = this._line;
            clone._border = {
                setLine: this._border.setLine,
                rgb: this._border.rgb
            };

            if ( !!this._mask ) {
                // mask があるなら
                clone.setMask( this.mask().clone() );
            }

            return clone;
        };

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
         * @method setBorder
         * @param {number} line
         * @param {string} color hex
         * @return {Shape}
         */
        p.setBorder = function ( line, color ) {
            var rgb = Iro.hex2rgb( color );

            if ( !!rgb ) {

                rgb.a = this._alpha;
                this._border = {
                    setLine: line,
                    rgb: rgb
                };

            }

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
            var bounding = this.paint( ctx ),
              e = bounding.e,
              rgba,
              border_rgba;

            if ( !e.visible || e.alpha === 0 || e.scale === 0 ) {
                // parent is invisible
                return;
            }

            rgba = this._rgba( this._rgb, bounding.e.alpha );

            switch ( this._fill ) {

                case Shape.STROKE:
                    this.stroke( ctx, this._line, rgba );
                    break;

                case Shape.FILL:
                    this.fill( ctx, rgba );
                    break;

                case Shape.BOTH:
                    border_rgba = this._rgba( this._border._rgb, bounding.e.alpha );
                    this.stroke( ctx, this._border._line, border_rgba );
                    this.fill( ctx, rgba );
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

    //            this.paint( ctx );

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

    //            this.paint( ctx );

            ctx.stroke();
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
    //            console.log( "paint ", bounding.e.visible, this.parent );
            if ( bounding.e.visible ) {
                // parent is visible
                ctx.beginPath();

                // rect
                ctx.moveTo( a.x, a.y );
                ctx.lineTo( b.x, b.y );
                ctx.lineTo( c.x, c.y );
                ctx.lineTo( d.x, d.y );
                ctx.lineTo( a.x, a.y );

                ctx.closePath();
            }

            return bounding;
        };

        return Shape;
    }() );

}( window ) );