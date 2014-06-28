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
        Num = Sankaku.Num
    ;

    Sankaku.Shape = ( function (){

        /**
         * @class Shape
         * @extend Object2D
         * @param {number} x
         * @param {number} y
         * @param {number=20} [width]
         * @param {number=10} [height]
         * @param {String} [color] default #000000
         * @param {boolean=false} [fill] fill or stroke, true: fill, false: stroke
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
             * @property _color
             * @type {String|string}
             * @protected
             */
            this._color = color || "#000000";
            /**
             * @property _fill
             * @type {boolean}
             * @protected
             */
            this._fill = !!fill;

            /**
             * @property _line
             * @type {number}
             * @protected
             */
            this._line = 1;

            /**
             * @property border
             * @type {{width: number, color: string}}
             */
            this.border = {
                width: 0,
                color: "#000000"
            };
        }

        Sankaku.extend( Object2D, Shape );

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
         * @override
         * @return {Object2D}
         */
        p.clone = function () {
            var clone = this._clone();

            clone._color = this._color;
            clone._fill = this._fill;
            clone._line = this._line;
            clone._border = Object.create( this._border );

            return clone;

//            return new Shape( this.x, this.y, this.width, this.height, this._color, this._fill );
        };

        /**
         * @method mode
         * @param fill
         */
        p.mode = function ( fill ) {
            this._fill = !!fill;
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
            var border = this.border;

            if ( this._fill ) {

                this.fill( ctx, this._color );

                if ( border.width > 0  ) {
                    // border
                    this.stroke( ctx, border.width, border.color );
                }
            } else {

                this.stroke( ctx, this._line, this._color );
            }
        };

        /**
         * @method fill
         * @param {CanvasRenderingContext2D} ctx
         * @param {string} color
         */
        p.fill = function ( ctx, color ) {
            ctx.fillStyle = color;

            this.paint( ctx );

            ctx.fill();
        };

        /**
         * @method stroke
         * @param {CanvasRenderingContext2D} ctx
         * @param {number} line
         * @param {string} color
         */
        p.stroke = function ( ctx, line, color ) {
            ctx.lineWidth = line;
            ctx.strokeStyle = color;

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