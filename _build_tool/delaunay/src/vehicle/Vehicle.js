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
        Object2D = Sankaku.Object2D,
        Tripod = Sankaku.Tripod;

    Sankaku.Vehicle = ( function (){
        var _abs = Math.abs;

        /**
         * @class Vehicle
         * @extends Object2D
         * @use EventDispatcher
         * @param {Object2D} [viewModel]
         * @constructor
         */
        function Vehicle ( viewModel ) {
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

            // 描画形状
            this.view( viewModel || new Tripod( this.x, this.y, this.width, this.height ) );
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

        Sankaku.EventDispatcher.initialize( p );

        p.view = function ( view ) {

            view.position( this._position );

//            view.width = this.width;
//            view.height = this.height;
//            view.rotation = this.rotation;
//            view.scale = this.scale;
            // copy from view
            this.width = view.width;
            this.height = view.height;
            this.rotation = view.rotation;

            // copy to view
            view.scale = this.scale;

//            view._velocity = this._velocity;
//            view._mass = this._mass;
//            view._speed = this._speed;
//            view._behavior = this._behavior;

            this._view = view;
        };

        /**
         * @method clone
         * @return {Object2D}
         */
        p.clone = function () {
            var clone = new Vehicle( this._view.clone() );

            // object 2D
            clone.position( this._position.clone() );
            clone.width = this.width;
            clone.height = this.height;
            clone.rotation = this.rotation;
            clone.scale = this.scale;

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
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         */
        p.draw = function ( ctx ) {
            this._view.draw( ctx );
        };

        /**
         * @method getView
         * @return {Shape}
         */
        p.getView = function () {
            return this._view;
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
                position = this._position,
                view = this._view;

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

            view.x = position.x;
            view.y = position.y;
            view.rotation = velocity.angle();
            view.width = this.width;
            view.height = this.height;
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
                this.dispatchEvent( { type: "wrap", currentTarget: this } );
            }
        };
//
//        /**
//         * @method onWrap
//         */
//        p.onWrap  =function () {
//
//        };

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
                // bounce event
                this.dispatchEvent( { type: "bounce", currentTarget: this } );
            }
        };
//
//        /**
//         * @method onBounce
//         */
//        p.onBounce = function () {
//
//        };

        return Vehicle;
    }() );
}( window ) );