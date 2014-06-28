/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/25 - 21:12
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
        Vector2D = Sankaku.Vector2D
    ;

    Sankaku.Flock = ( function (){
        /**
         * 群行動
         * @class Flock
         * @extend SteeredVehicle
         * @constructor
         */
        function Flock () {
            SteeredVehicle.call( this );

            // for flock
            this._flock_insight = 200;
            this._flock_close = 60;
        }

        Sankaku.extend( SteeredVehicle, Flock );

        var p = Flock.prototype;

        p.constructor = Flock;

        /**
         * @clone
         * @return {Object2D}
         */
        p.clone = function () {
            var clone = this._clone();

            // vehicle
            clone._velocity = this._velocity.clone();
            clone._mass = this._mass;
            clone._speed = this._speed;
            clone._behavior = this._behavior;
            clone._force = this._behavior;

            // myself
            clone._force = this._force.clone();
            clone._max = this._max;
            clone._arrival = this._arrival;
            clone._avoid_distance = this._avoid_distance;
            clone._buffer = this._buffer;
            clone._insight = this._insight;
            clone._close = this._close;

            // for flock
            clone._flock_insight = this._flock_insight;
            clone._flock_close = this._flock_close;

            return clone;
        };

        /**
         * @method flockInsight
         * @param {number} n
         */
        p.flockInsight = function ( n ) {
            this._flock_insight = n;
        };
        /**
         * @method getFlockInsight
         * @return {number|*}
         */
        p.getFlockInsight = function () {
            return this._flock_insight;
        };

        /**
         * @method flockClose
         * @param {number} n
         */
        p.flockClose = function ( n ) {
            this._flock_close = n;
        };
        /**
         * @method getFlockInsight
         * @return {number|*}
         */
        p.getFlockInsight = function () {
            return this._flock_close;
        };

        /**
         * @method flock
         * @param {Array} targets
         */
        p.flock = function ( targets ) {
            var average_velocity = this._velocity.clone(),
                average_position = new Vector2D(),
                count = 0,
                vehicle,
                i, limit;

            for ( i = 0, limit = targets.length; i < limit; i++ ) {

                vehicle = targets[ i ];

                if ( vehicle !== this && this.tooInsight( vehicle ) ) {

                    average_velocity.add( vehicle.getVelocity() );
                    average_position.add( vehicle.getPosition() );

                    if ( this.tooClose( vehicle ) ) {

                        this.flee( vehicle.getPosition() );
                    }

                    ++count;
                }
            }// for

            if ( count > 0 ) {
                // count 0 over
                average_velocity.divideScalar( count );
                average_position.divideScalar( count );

                this.seek( average_position );
                this._force.add( average_velocity.sub( this._velocity ) );
            }
        };

        /**
         * @method tooInsight
         * @param {Vehicle} v
         * @return {boolean}
         */
        p.tooInsight = function ( v ) {
            var heading, difference, prod;

            if ( this._position.distance( v._position ) > this._flock_insight ) {

                return false;
            }

            heading = this._velocity.clone().normalize();
            difference = v._position.subNew( this._position );
            prod = difference.dot( heading );

            return prod < 0;
        };

        /**
         * @method tooClose
         * @param {Vehicle} v
         */
        p.tooClose = function ( v ) {
            return this._position.distance( v._position ) < this._flock_close;
        };

        return Flock;
    }() );
}( window ) );