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
    var document = window.document,

        Sankaku = window.Sankaku,
        Vector2D = Sankaku.Vector2D,

        _cos = Math.cos,
        _sin = Math.sin,
        PI = Math.PI,
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
            this.rotation = 0;
        }

        var p = Vehicle.prototype;

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
         * @returns {number}
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
         * @returns {number}
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
         * @returns {string}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         */
        p.draw = function ( ctx ) {
            var x = this.x,
                y = this.y,
                rotation = this.rotation,
                x10, y5, x10_, y5_,
                rx, ry;

//            x10 = x + 10;
//            y5 = y + 5;
//            x10_ = x - 10;
//            y5_ = y - 5;
//
//            rx = x * _cos( rotation ) - y * _sin( rotation );
//            ry = x * _sin( rotation ) + y * _cos( rotation );
//            ctx.save();

//            ctx.rotate( rotation );
            ctx.beginPath();
            ctx.moveTo( x + 10, y );
            ctx.lineTo( x - 10, y + 5 );
            ctx.lineTo( x - 10, y - 5 );

//            ctx.lineTo( ( x - x10_ ) * _cos( rotation ) - ( y - y5 ) * _sin( rotation ) + x10_, ( x - x10_ ) * _sin( rotation ) - ( y - y5 ) * _cos( rotation ) + y5 );
//            ctx.lineTo( ( x - x10_ ) * _cos( rotation ) - ( y - y5_ ) * _sin( rotation ) + x10_, ( x - x10_ ) * _sin( rotation ) - ( y - y5_ ) * _cos( rotation ) + y5_ );

            ctx.lineTo( x + 10, y );
            ctx.closePath();

//            ctx.restore();
        };

        /**
         * @method update
         * @param {number} w
         * @param {number} h
         */
        p.update = function ( w, h ) {
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
//            this.rotation = velocity.angle() * ONE_RADIAN;
            // rotation is radian
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