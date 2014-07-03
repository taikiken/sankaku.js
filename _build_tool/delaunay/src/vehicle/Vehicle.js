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
        Object2D = Sankaku.Object2D;

    Sankaku.Vehicle = ( function (){
        var _abs = Math.abs;

        /**
         * @class Vehicle
         * @extends Object2D
         * @constructor
         */
        function Vehicle () {
            Object2D.call( this );

            /**
             * @property _velocity
             * @type {Vector2D}
             * @default new Vector2D( 0, 0 )
             * @protected
             */
            this._velocity = new Vector2D();

            /**
             * @property _mass
             * @type {number}
             * @default 1.0
             * @protected
             */
            this._mass = 1.0;
            /**
             * @property _speed
             * @type {number}
             * @default 10
             * @protected
             */
            this._speed = 10;
            /**
             * @property _behavior
             * @type {string}
             * @default Vehicle.BOUNCE
             * @protected
             */
            this._behavior = Vehicle.BOUNCE;

            /**
             * padding left
             * @property left
             * @type {number}
             */
            this.left = 0;
            /**
             * padding top
             * @property top
             * @type {number}
             */
            this.top = 0;
            /**
             * padding right
             * @property right
             * @type {number}
             */
            this.right = 0;
            /**
             * padding bottom
             * @property bottom
             * @type {number}
             */
            this.bottom = 0;
        }

        Sankaku.extend( Object2D, Vehicle );

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

        p.constructor = Vehicle;

        /**
         * @method clone
         * @return {Object2D}
         */
        p.clone = function () {
            var clone = new Vehicle();

            // object 2D
            clone.position( this._position.clone() );
            clone.width = this.width;
            clone.height = this.height;
            clone.rotation = this.rotation;

            clone._velocity = this._velocity.clone();
            clone._mass = this._mass;
            clone._speed = this._speed;
            clone._behavior = this._behavior;

            return clone;
        };

        /**
         * @method padding
         * @param {number} top
         * @param {number} [right]
         * @param {number} [bottom]
         * @param {number} [left]
         */
        p.padding = function ( top, right, bottom, left ) {
            right = right || top;
            bottom = bottom || top;
            left = left || top;

            this.top = top;
            this.right = right;
            this.bottom = bottom;
            this.left = left;
        };

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

//        /**
//         * @method position
//         * @param {Vector2D} v
//         */
//        p.position = function ( v ) {
//            this._position = v;
//            this.x = v.x;
//            this.y = v.y;
//        };
//
//        /**
//         * @method getPosition
//         * @return {Vector2D}
//         */
//        p.getPosition = function () {
//            return this._position;
//        };

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
//
//        /**
//         * @method setX
//         * @param {number} x
//         */
//        p.setX = function ( x ) {
//            this.x = x;
//            this._position.x = x;
//        };
//
//        /**
//         * @method setY
//         * @param {number} y
//         */
//        p.setY = function ( y ) {
//            this.y = y;
//            this._position.y = y;
//        };

//        /**
//         * @method bounding
//         * @return {Object} {a: {x: number, y: number}, b: {x: number, y: number}, c: {x: number, y: number}, d: {x: number, y: number}}
//         */
//        p.bounding = function () {
//            var x = this.x,
//                y = this.y,
//                w2 = this.width * 0.5,
//                h2 = this.height * 0.5,
//                rotation = this.rotation,
//                a, b, c, d,
//                ax, ay,
//                bx,
//                cy,
//                sin, cos,
//
//                cos_ax,
//                cos_ay,
//                sin_ay,
//                sin_ax,
//                cos_bx,
//                cos_cy,
//                sin_bx,
//                sin_cy;
//
//            sin = _sin( rotation );
//            cos = _cos( rotation );
//
//            ax = -w2;
//            ay = -h2;
//            bx = w2;
//            cy = h2;
//
//            cos_ax = cos * ax;
//            cos_ay = cos * ay;
//            sin_ay = sin * ay;
//            sin_ax = sin * ax;
//            cos_bx = cos * bx;
//            cos_cy = cos * cy;
//            sin_bx = sin * bx;
//            sin_cy = sin * cy;
//
//            a = { x: cos_ax - sin_ay + x, y: cos_ay + sin_ax + y };
//            b = { x: cos_bx - sin_ay + x, y: cos_ay + sin_bx + y };
//            c = { x: cos_bx - sin_cy + x, y: cos_cy + sin_bx + y };
//            d = { x: cos_ax - sin_cy + x, y: cos_cy + sin_ax + y };
//
//            return { a: a, b: b, c: c, d:d };
//        };

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

            // triangle
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

            w -= this.right;
            h -= this.bottom;

            velocity.truncate( _abs( this._speed ) );
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
            var position = this._position,
                is = false,
                left = this.left,
                top = this.top;

            if ( position.x > w ) {

                position.x = left;
                is = true;
            }
            if ( position.x < left ) {

                position.x = w;
                is = true;
            }

            if ( position.y > h ) {

                position.y = top;
                is = true;
            }
            if ( position.y < top ) {

                position.y = h;
                is = true;
            }

            if ( is ) {
                // wrap event
                this.onWrap();
            }
        };

        /**
         * @method onWrap
         */
        p.onWrap  =function () {

        };

        /**
         * @method bounce
         * @param {number} w
         * @param {number} h
         */
        p.bounce = function ( w, h ) {
            var velocity = this._velocity,
                position = this._position,
                is = false,
                left = this.left,
                top = this.top;

            if ( position.x > w ) {

                position.x = w;
                velocity.x *= -1;
                is = true;
            } else if ( position.x < left ) {

                position.x = left;
                velocity.x *= -1;
                is = true;
            }

            if ( position.y > h ) {

                position.y = h;
                velocity.y *= -1;
                is = true;
            } else if ( position.y < top ) {

                position.y = top;
                velocity.y *= -1;
                is = true;
            }

            if ( is ) {
                // wrap event
                this.onBounce();
            }
        };

        /**
         * @method onBounce
         */
        p.onBounce = function () {

        };

        return Vehicle;
    }() );
}( window ) );