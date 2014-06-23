/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/22 - 21:01
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
        Vector2D = Sankaku.Vector2D,
        Matrix2D = Sankaku.Matrix2D,
        Point = Sankaku.Point,

        _cos = Math.cos,
        _sin = Math.sin,
        PI = Math.PI,
        PI2 = PI * 2,
        ONE_RADIAN = 180 / PI;

    Sankaku.Vehicle = ( function (){
        /**
         * @class Vehicle
         * @constructor
         */
        function Vehicle () {
            this._position = new Vector2D();
            this._velocity = new Vector2D();

            this._mass = 1.0;
            this._speed = 10;
            this._behavior = Vehicle.BOUNCE;

            /**
             * @property x
             * @type {number}
             */
            this.x = 0;
            /**
             * @property y
             * @type {number}
             */
            this.y = 0;
            /**
             * @property rotation
             * @type {number}
             */
            this.rotation = 0;
            /**
            * @property width
            * @type {number}
            */
            this.width = 20;
            /**
             * @property height
             * @type {number}
             */
            this.height = 10;
        }

        /**
         * @const WRAP
         * @static
         * @type {string}
         */
        Vehicle.WRAP = "vehicle_wrap";
        /**
         * @const BOUNCE
         * @static
         * @type {string}
         */
        Vehicle.BOUNCE = "vehicle_bounce";

        var p = Vehicle.prototype;

        /**
         * 質量を設定します
         * @method mass
         * @param {number} n
         */
        p.mass = function ( n ) {
            this._mass = n;
        };

        /**
         * @method getMass
         * @return {number}
         */
        p.getMass = function () {
            return this._mass;
        };

        /**
         * 最大スピードを設定します
         * @method speed
         * @param {number} n
         */
        p.speed = function ( n ) {
            this._speed = n;
        };

        /**
         * @method getSpeed
         * @return {number}
         */
        p.getSpeed = function () {
            return this._speed;
        };

        /**
         * @method behavior
         * @param {string} str
         */
        p.behavior = function ( str ) {
            this._behavior = str;
        };

        /**
         * @method getBehavior
         * @return {string}
         */
        p.getBehavior = function () {
            return this._behavior;
        };

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
         * @method velocity
         * @param {Vector2D} v
         */
        p.velocity = function ( v ) {
            this._velocity = v;
        };

        /**
         * @method getVelocity
         * @return {Vector2D}
         */
        p.getVelocity = function () {
            return this._velocity;
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
                w2 = this.width * 0.5,
                h2 = this.height * 0.5,
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

//        /**
//         * @method draw
//         * @param {CanvasRenderingContext2D} ctx
//         */
//        p.draw = function ( ctx ) {
//            var x = this.x,
//                y = this.y;
//
//            ctx.beginPath();
//
//            ctx.moveTo( x + 10, y );
//            ctx.lineTo( x - 10, y + 5 );
//            ctx.lineTo( x - 10, y - 5 );
//            ctx.lineTo( x + 10, y );
//
//            ctx.closePath();
//        };

        /**
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         */
        p.draw = function ( ctx ) {
            var bounding = this.bounding(),
                a, b, c, d;

            a = bounding.a;
            b = bounding.b;
            c = bounding.c;
            d = bounding.d;

            // rect
            ctx.beginPath();

            ctx.moveTo( a.x, a.y );
//            ctx.lineTo( b.x, b.y );
//            ctx.lineTo( c.x, c.y );
            ctx.lineTo( b.x, b.y + ( (c.y - b.y) * 0.5 ) );
            ctx.lineTo( d.x, d.y );
            ctx.lineTo( a.x, a.y );

            ctx.closePath();
        };

        /**
         * @method update
         * @param {number} w
         * @param {number} h
         */
        p.update = function ( w, h ) {
            this._update( w, h );
        };

        /**
         * @method _update
         * @param {number} w
         * @param {number} h
         * @protected
         */
        p._update = function ( w, h ) {
            var velocity = this._velocity,
                position = this._position;

            velocity.truncate( this._speed );
            position.add( velocity );

            switch ( this._behavior ) {

                case Vehicle.WRAP:
                    this.wrap( w, h );
                    break;

                default :
                    this.bounce( w, h );
                    break;
            }

            this.x = position.x;
            this.y = position.y;

            this.rotation = velocity.angle();
        };

        /**
         * @method wrap
         * @param {number} w
         * @param {number} h
         */
        p.wrap = function ( w, h ) {
            var position = this._position;

            if ( position.x > w ) {

                position.x = 0;
            }
            if ( position.x < 0 ) {

                position.x = w;
            }

            if ( position.y > h ) {

                position.y = 0;
            }
            if ( position.y < 0 ) {

                position.y = h;
            }
        };

        /**
         * @method bounce
         * @param {number} w
         * @param {number} h
         */
        p.bounce = function ( w, h ) {
            var velocity = this._velocity,
                position = this._position;

            if ( position.x > w ) {

                position.x = w;
                velocity.x *= -1;
            } else if ( position.x < 0 ) {

                position.x = 0;
                velocity.x *= -1;
            }

            if ( position.y > h ) {

                position.y = h;
                velocity.y *= -1;
            } else if ( position.y < 0 ) {

                position.y = 0;
                velocity.y *= -1;
            }
        };

        return Vehicle;
    }() );
}( window ) );