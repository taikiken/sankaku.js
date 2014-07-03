/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/25 - 11:19
 *
 * Copyright (c) 2011-2014 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * for display object
 */
( function ( window ){
    "use strict";
    var Sankaku = window.Sankaku,
        Vector2D = Sankaku.Vector2D,
        Num = Sankaku.Num
    ;

    Sankaku.Object2D = ( function (){
        var _cos = Math.cos,
            _sin = Math.sin;

        /**
         * @class Object2D
         * @constructor
         */
        function Object2D () {
            /**
             * @property _position
             * @type {Vector2D}
             * @default new Vector2D( 0, 0 )
             * @protected
             */
            this._position = new Vector2D();

            /**
             * @property x
             * @type {number}
             * @default 0
             */
            this.x = 0;
            /**
             * @property y
             * @type {number}
             * @default 0
             */
            this.y = 0;
            /**
             * radian
             * @property rotation
             * @type {number}
             * @default 0
             */
            this.rotation = 0;
            /**
             * @property width
             * @type {number}
             * @default 20
             */
            this.width = 20;
            /**
             * @property height
             * @type {number}
             * @default 10
             */
            this.height = 10;

            /**
             * @property scale
             * @type {number}
             * @default 1
             */
            this.scale = 1;
        }

        var p = Object2D.prototype;

        p.constructor = Object2D;

        /**
         * @method position
         * @param {Vector2D} v
         */
        p.position = function ( v ) {
            this._position = v;
            this.x = v.x;
            this.y = v.y;
        };

        /**
         * @method getPosition
         * @return {Vector2D}
         */
        p.getPosition = function () {
            return this._position;
        };

        /**
         * @method setX
         * @param {number} x
         */
        p.setX = function ( x ) {
            this.x = x;
            this._position.x = x;
        };

        /**
         * @method setY
         * @param {number} y
         */
        p.setY = function ( y ) {
            this.y = y;
            this._position.y = y;
        };

        /**
         * @method bounding
         * @return {Object} {a: {x: number, y: number}, b: {x: number, y: number}, c: {x: number, y: number}, d: {x: number, y: number}}
         */
        p.bounding = function () {
            var x = this.x,
                y = this.y,
                w1 = this.width * this.scale,
                h1 = this.height * this.scale,
                w2 = w1 * 0.5,
                h2 = h1 * 0.5,
                rotation = this.rotation,
                a, b, c, d,
                ax, ay,
                bx,
                cy,
                sin, cos,

                cos_ax,
                cos_ay,
                sin_ay,
                sin_ax,
                cos_bx,
                cos_cy,
                sin_bx,
                sin_cy;

            sin = _sin( rotation );
            cos = _cos( rotation );

            //  a    b
            //  ------
            //  |    |
            //  ------
            //  d    c

            ax = -w2;
            ay = -h2;
            bx = w2;
            cy = h2;

            cos_ax = cos * ax;
            cos_ay = cos * ay;
            sin_ay = sin * ay;
            sin_ax = sin * ax;
            cos_bx = cos * bx;
            cos_cy = cos * cy;
            sin_bx = sin * bx;
            sin_cy = sin * cy;

            a = { x: cos_ax - sin_ay + x, y: cos_ay + sin_ax + y };
            b = { x: cos_bx - sin_ay + x, y: cos_ay + sin_bx + y };
            c = { x: cos_bx - sin_cy + x, y: cos_cy + sin_bx + y };
            d = { x: cos_ax - sin_cy + x, y: cos_cy + sin_ax + y };

            return { a: a, b: b, c: c, d:d };
        };

        /**
         * 角度を degree を元に radian 設定します
         * @method rotate
         * @param {number} degree 0 ~ 360
         */
        p.rotate = function ( degree ) {
            this.rotation = Num.deg2rad( degree );
        };

        /**
         * @method clone
         * @return {Object2D}
         */
        p.clone = function () {
            return this._clone();
        };

        /**
         * @method _clone
         * @return {Object2D}
         * @protected
         */
        p._clone = function () {
            var clone = new Object2D();
            clone.position( this._position.clone() );
            clone.width = this.width;
            clone.height = this.height;
            clone.rotation = this.rotation;
            clone.scale = this.scale;

            return clone;
        };

        /**
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         */
        p.draw = function ( ctx ) {

        };

        return Object2D;
    }() );

}( window ) );