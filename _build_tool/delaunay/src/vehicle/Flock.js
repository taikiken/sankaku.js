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
         * @extends SteeredVehicle
         * @param {Object2D} viewModel
         * @constructor
         */
        function Flock ( viewModel ) {
            SteeredVehicle.call( this, viewModel );

            // for flock
            this._flock_flockInsight = 200;
            this._flock_flockClose = 60;
        }

        Sankaku.extend( SteeredVehicle, Flock );

        var p = Flock.prototype;

        p.constructor = Flock;

        /**
         * @method clone
         * @return {*|Flock}
         */
        p.clone = function () {
////            var clone = this._clone();
//            var clone = new Flock( this._view.clone() );

            // object 2D
//            clone.position( this._position.clone() );
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
//            clone._avoid_distance = this._avoid_distance;
//            clone._avoid_buffer = this._avoid_buffer;
//            clone._avoid_flockInsight = this._avoid_flockInsight;
//            clone._avoid_flockClose = this._avoid_flockClose;
//
//            // super method
////            var clone = SteeredVehicle.prototype.clone.call( this, this._view.clone() );
//
            // for flock
//            clone._flock_flockInsight = this._flock_flockInsight;
//            clone._flock_flockClose = this._flock_flockClose;
//
//            return clone;

            var clone = Object.create( this );
            clone.setView( this._view.clone() );
            clone.position( this._position.clone() );
            clone._velocity = this._velocity.clone();
            clone._force = this._force.clone();

            return clone;
        };

        /**
         * @method setFlockInsight
         * @param {number} n
         * @return {Flock}
         */
        p.setFlockInsight = function ( n ) {
            this._flock_flockInsight = n;

            return this;
        };
        /**
         * @method flockInsight
         * @return {number|*}
         */
        p.flockInsight = function () {
            return this._flock_flockInsight;
        };

        /**
         * @method setFlockClose
         * @param {number} n
         * @return {Flock}
         */
        p.setFlockClose = function ( n ) {
            this._flock_flockClose = n;

            return this;
        };
        /**
         * @method flockClose
         * @return {number|*}
         */
        p.flockClose = function () {
            return this._flock_flockClose;
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

                    average_velocity.add( vehicle.velocity() );
                    average_position.add( vehicle.position() );

                    if ( this.tooClose( vehicle ) ) {

                        this.flee( vehicle.position() );
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

            if ( this._position.distance( v._position ) > this._flock_flockInsight ) {

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
            return this._position.distance( v._position ) < this._flock_flockClose;
        };

        p.setFlocks = function ( flocks ) {
            this._flocks = flocks;

            return this;
        };

        /**
         * prepare render
         * @method beginRender
         * @param {number} w canvas width
         * @param {number} h canvas height
         */
        p.beginRender = function ( w, h ) {
            this.prepareRender();

            this.flock( this._flocks );
            this.update( w, h );
        };

        return Flock;
    }() );
}( window ) );