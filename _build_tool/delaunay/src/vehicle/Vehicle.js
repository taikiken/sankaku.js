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
         * @uses EventDispatcher
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
             * setPadding left
             * @property left
             * @type {number}
             */
            this.left = 0;
            /**
             * setPadding top
             * @property top
             * @type {number}
             */
            this.top = 0;
            /**
             * setPadding right
             * @property right
             * @type {number}
             */
            this.right = 0;
            /**
             * setPadding bottom
             * @property bottom
             * @type {number}
             */
            this.bottom = 0;

            /**
             * @property maskMode
             * @type {boolean}
             */
            this.maskMode = false;

            // 描画形状
            this.setView( viewModel || new Tripod( this.x, this.y, this.width, this.height ) );
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

        /**
         * @method setView
         * @param {*|Object2D|Shape} view
         */
        p.setView = function ( view ) {

            // copy to view
            view.setPosition( this._position );

            // copy properties from view
            this.width = view.width;
            this.height = view.height;
            this.rotation = view.rotation;
            this.alpha = view.alpha;
            this.scale = view.scale;

            // copy to view
//            view.scale = this.scale;

            this._view = view;
        };

        /**
         * @method view
         * @return {*|Object2D|Shape}
         */
        p.view = function () {
            return this._view;
        };


        /**
         * @method clone
         * @return {Object2D}
         */
        p.clone = function () {
            var clone = new Vehicle( this._view.clone() );

            // object 2D
            clone.setPosition( this._position.clone() );
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
         * @method setPadding
         * @param {number} top
         * @param {number} [right]
         * @param {number} [bottom]
         * @param {number} [left]
         * @return {Vehicle}
         */
        p.setPadding = function ( top, right, bottom, left ) {
            right = right || top;
            bottom = bottom || top;
            left = left || top;

            this.top = top;
            this.right = right;
            this.bottom = bottom;
            this.left = left;

            return this;
        };

        /**
         * 質量を設定します
         * @method setMass
         * @param {number} n
         * @return {Vehicle}
         */
        p.setMass = function ( n ) {
            this._mass = n;
            return this;
        };

        /**
         * @method mass
         * @return {number}
         */
        p.mass = function () {
            return this._mass;
        };

        /**
         * 最大スピードを設定します
         * @method setSpeed
         * @param {number} n
         * @return {Vehicle}
         */
        p.setSpeed = function ( n ) {
            this._speed = n;
            return this;
        };

        /**
         * @method speed
         * @return {number}
         */
        p.speed = function () {
            return this._speed;
        };

        /**
         * @method setBehavior
         * @param {string} str
         * @return {Vehicle}
         */
        p.setBehavior = function ( str ) {
            this._behavior = str;
            return this;
        };

        /**
         * @method behavior
         * @return {string}
         */
        p.behavior = function () {
            return this._behavior;
        };

        /**
         * @method setVelocity
         * @param {Vector2D} v
         * @return {Vehicle}
         */
        p.setVelocity = function ( v ) {
            this._velocity = v;
            return this;
        };

        /**
         * @method getVelocity
         * @return {Vector2D}
         */
        p.velocity = function () {
            return this._velocity;
        };

        /**
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         */
        p.draw = function ( ctx ) {

            if ( this.visible && this._alpha > 0 && this.scale > 0 ) {
                // can draw
                this._view.draw( ctx );
            }
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
         * @param {number} w canvas width
         * @param {number} h canvas height
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

        /**
         * prepare render
         * @method beginRender
         * @param {number} w canvas width
         * @param {number} h canvas height
         */
        p.beginRender = function ( w, h ) {
            this.prepareRender();

            this.update( w, h );
        };

        return Vehicle;
    }() );
}( window ) );