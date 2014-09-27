/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/24 - 20:37
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
        SteeredVehicle = Sankaku.SteeredVehicle,
        Vector2D = Sankaku.Vector2D;

    Sankaku.Wander = ( function (){
        var _rand = Math.random;

        /**
         * 徘徊
         * @class Wander
         * @extends SteeredVehicle
         * @param {Object2D} viewModel
         * @constructor
         */
        function Wander ( viewModel ) {
            SteeredVehicle.call( this, viewModel );

            this._wander_angle = 0;
            this._wander_distance = 10;
            this._wnder_radius = 5;
            this._wander_range = 1;
            this._wander_range2 = this._wander_range * 0.5;
        }

        Sankaku.extend( SteeredVehicle, Wander );

        var p = Wander.prototype;

        p.constructor = Wander;

        /**
         * @method clone
         * @return {*|Object2D}
         */
        p.clone = function () {
//            var clone = new Wander();
//
//            // object 2D
//            clone.setPosition( this._position.clone() );
//            clone.width = this.width;
//            clone.height = this.height;
//            clone.rotation = this.rotation;
//
//            // vehicle
//            clone._velocity = this._velocity.clone();
//            clone._mass = this._mass;
//            clone._speed = this._speed;
//            clone._behavior = this._behavior;
//            clone._force = this._behavior;
//
//            // myself
//            clone._force = this._force.clone();
//            clone._force_max = this._force_max;
//            clone._force_arrival = this._force_arrival;
//            clone._avoid_setWanderDistance = this._avoid_setWanderDistance;
//            clone._avoid_buffer = this._avoid_buffer;
//            clone._avoid_insight = this._avoid_insight;
//            clone._avoid_close = this._avoid_close;
//
//            // wander
//            clone._wander_angle = this._wander_angle;
//            clone._wander_distance = this._wander_distance;
//            clone._wnder_radius = this._wnder_radius;
//            clone._wander_range = this._wander_range;
//            clone._wander_range2 = this._wander_range2;
//
//            return clone;
            var clone = Object.create( this );
            clone.setView( this._view.clone() );

            return clone;
        };

        /**
         * @method setWanderAngle
         * @param {number} n
         * @return {Wander}
         */
        p.setWanderAngle = function ( n ) {
            this._wander_angle = n;
            return this;
        };

        /**
         * @method wanderAngle
         * @return {number}
         */
        p.wanderAngle = function () {
            return this._wander_angle;
        };

        /**
         * @method setWanderDistance
         * @param {number} n
         * @return {Wander}
         */
        p.setWanderDistance = function ( n ) {
            this._wander_distance = n;
            return this;
        };

        /**
         * @method wanderDistance
         * @return {number}
         */
        p.wanderDistance = function () {
            return this._wander_distance;
        };

        /**
         * @method setWanderRadius
         * @param {number} n
         * @return {Wander}
         */
        p.setWanderRadius = function ( n ) {
            this._wnder_radius = n;
            return this;
        };

        /**
         * @method wanderRadius
         * @return {number}
         */
        p.wanderRadius = function () {
            return this._wnder_radius;
        };

        /**
         * @method setWanderRange
         * @param {number} n
         * @return {Wander}
         */
        p.setWanderRange = function ( n ) {
            this._wander_range = n;
            this._wander_range2 = n * 0.5;
            return this;
        };

        /**
         * @method wanderRange
         * @return {number}
         */
        p.wanderRange = function () {
            return this._wander_range;
        };

        /**
         * @method wander
         */
        p.wander = function () {
            var center = this._velocity.clone().normalize().multiplyScalar( this._wander_distance ),
                offset = new Vector2D();

            offset.setLength( this._wnder_radius );
            offset.setAngle( this._wander_angle );

            this._wander_angle += _rand() * this._wander_range - this._wander_range2;

            center.add( offset );
            this._force.add( center );
        };

        /**
         * prepare render
         * @method beginRender
         * @param {number} w canvas width
         * @param {number} h canvas height
         */
        p.beginRender = function ( w, h ) {
            this.prepareRender();

            this.wander( this._paths, this._loop );
            this.update( w, h );
        };

        return Wander;
    }() );

}( window ) );