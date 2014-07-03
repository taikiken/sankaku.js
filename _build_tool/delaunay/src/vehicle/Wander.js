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
         * @constructor
         */
        function Wander () {
            SteeredVehicle.call( this );

            this._angle = 0;
            this._distance = 10;
            this._radius = 5;
            this._range = 1;
            this._range2 = this._range * 0.5;
        }

        Sankaku.extend( SteeredVehicle, Wander );

        var p = Wander.prototype;

        p.constructor = Wander;

        /**
         * @method clone
         * @return {Object2D}
         */
        p.clone = function () {
            var clone = new Wander();

            // object 2D
            clone.position( this._position.clone() );
            clone.width = this.width;
            clone.height = this.height;
            clone.rotation = this.rotation;

            // vehicle
            clone._velocity = this._velocity.clone();
            clone._mass = this._mass;
            clone._speed = this._speed;
            clone._behavior = this._behavior;
            clone._force = this._behavior;

            // myself
            clone._force = this._force.clone();
            clone._force_max = this._force_max;
            clone._force_arrival = this._force_arrival;
            clone._avoid_distance = this._avoid_distance;
            clone._avoid_buffer = this._avoid_buffer;
            clone._avoid_insight = this._avoid_insight;
            clone._avoid_close = this._avoid_close;

            // wander
            clone._angle = this._angle;
            clone._distance = this._distance;
            clone._radius = this._radius;
            clone._range = this._range;
            clone._range2 = this._range2;

            return clone;
        };

        /**
         * @method angle
         * @param {number} n
         */
        p.angle = function ( n ) {
            this._angle = n;
        };

        /**
         * @method getAngle
         * @return {number}
         */
        p.getAngle = function () {
            return this._angle;
        };

        /**
         * @method distance
         * @param {number} n
         */
        p.distance = function ( n ) {
            this._distance = n;
        };

        /**
         * @method getDistance
         * @return {number}
         */
        p.getDistance = function () {
            return this._distance;
        };

        /**
         * @method radius
         * @param {number} n
         */
        p.radius = function ( n ) {
            this._radius = n;
        };

        /**
         * @method getRadius
         * @return {number}
         */
        p.getRadius = function () {
            return this._radius;
        };

        /**
         * @method range
         * @param {number} n
         */
        p.range = function ( n ) {
            this._range = n;
            this._range2 = n * 0.5;
        };

        /**
         * @method getRange
         * @return {number}
         */
        p.getRange = function () {
            return this._range;
        };

        /**
         * @method wander
         */
        p.wander = function () {
            var center = this._velocity.clone().normalize().multiplyScalar( this._distance ),
                offset = new Vector2D();

            offset.setLength( this._radius );
            offset.setAngle( this._angle );

            this._angle = _rand() * this._range - this._range2;

            center.add( offset );
            this._force.add( center );
        };

        return Wander;
    }() );

}( window ) );