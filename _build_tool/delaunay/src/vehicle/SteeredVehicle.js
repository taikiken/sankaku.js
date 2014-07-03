/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/23 - 21:19
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
        Vehicle = Sankaku.Vehicle,
        Vector2D = Sankaku.Vector2D
    ;

    Sankaku.SteeredVehicle = ( function (){
        var PI_05 = Math.PI * 0.5;

        /**
         * @class SteeredVehicle
         * @extends Vehicle
         * @constructor
         */
        function SteeredVehicle () {
            Vehicle.call( this );

            this._force = new Vector2D();
            // max force
            this._force_max = 1.0;
            this._force_arrival = 100;

            // for avoid
            this._avoid_distance = 300;
            this._avoid_buffer = 20;
            this._avoid_insight = 200;
            this._avoid_close = 60;
        }

        Sankaku.extend( Vehicle, SteeredVehicle );

        var p = SteeredVehicle.prototype;

        p.constructor = SteeredVehicle;

        /**
         * @method clone
         * @return {Object2D}
         */
        p.clone = function () {
//            var clone = new SteeredVehicle();
//
//            // object 2D
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

            var clone = Vehicle.prototype.clone.call( this );

            // myself
            clone._force = this._force.clone();
            clone._force_max = this._force_max;
            clone._force_arrival = this._force_arrival;

            clone._avoid_distance = this._avoid_distance;
            clone._avoid_buffer = this._avoid_buffer;
            clone._avoid_insight = this._avoid_insight;
            clone._avoid_close = this._avoid_close;

            return clone;
        };

        /**
         * @method getMax
         * @return {number} SteeredVehicle._force_max
         */
        p.getMax = function () {
            return this._force_max;
        };

        /**
         * @method max
         * @param {number} n
         */
        p.max = function ( n ) {
            this._force_max = n;
        };

        /**
         * @method getArrival
         * @return {number} SteeredVehicle._force_arrival
         */
        p.getArrival = function () {
            return this._force_arrival;
        };

        /**
         * @method arrival
         * @param {number} n
         */
        p.arrival = function ( n ) {
            this._force_arrival = n;
        };

        /**
         * @method force
         * @param {Vector2D} v
         */
        p.force = function ( v ) {
            this._force = v;
        };

        /**
         * @method getForce
         * @return {Vector2D|SteeredVehicle._force}
         *
         */
        p.getForce = function () {
            return this._force;
        };

        /**
         * @method buffer
         * @param {number} n
         */
        p.buffer = function ( n ) {
            this._avoid_buffer = n;
        };
        /**
         * @method getBuffer
         * @return {number|*}
         */
        p.getBuffer = function () {
            return this._avoid_buffer;
        };

        /**
         * @method insight
         * @param {number} n
         */
        p.insight = function ( n ) {
            this._avoid_insight = n;
        };
        /**
         * @method getInsight
         * @return {number|*}
         */
        p.getInsight = function () {
            return this._avoid_insight;
        };

        /**
         * @method close
         * @param {number} n
         */
        p.close = function ( n ) {
            this._avoid_close = n;
        };
        /**
         * @method getClose
         * @return {number|*}
         */
        p.getClose = function () {
            return this._avoid_close;
        };

        /**
         * @method avoidDistance
         * @param {number} n
         */
        p.avoidDistance = function ( n ) {
            this._avoid_distance = n;
        };

        /**
         * @method getAvoidDistance
         * @return {number|*}
         */
        p.getAvoidDistance = function () {
            return this._avoid_distance;
        };

        /**
         * @method update
         * @param {number} w
         * @param {number} h
         */
        p.update = function ( w, h ) {
            this._force.truncate( this._force_max ).divideScalar( this._mass );
            this._velocity.add( this._force );

            this._force = new Vector2D();
            this._update( w, h );
        };

        /**
         * 追求
         * @method seek
         * @param {Vector2D} target
         */
        p.seek = function ( target ) {
            var force = target.subNew( this._position );

            force.normalize().multiplyScalar( this._speed ).sub( this._velocity );

            this._force.add( force );
        };

        /**
         * 逃避
         * @method flee
         * @param {Vector2D} target
         */
        p.flee = function ( target ) {
            var force = target.subNew( this._position );

            force.normalize().multiplyScalar( this._speed ).sub( this._velocity );

            this._force.sub( force );
        };

        /**
         * 到着
         * @method arrive
         * @param {Vector2D} target
         */
        p.arrive = function ( target ) {
            var force = target.subNew( this._position ),
                arrival = this._force_arrival,
                distance;

            force.normalize();
            distance = this._position.distance( target );

            if ( distance > arrival ) {
                // far
                force.multiplyScalar( this._speed );
            } else {
                // near
                force.multiplyScalar( this._speed * distance / arrival );
            }

            force.sub( this._velocity );
            this._force.add( force );
        };

        /**
         * 追跡
         * @method pursue
         * @param {Vehicle} target
         */
        p.pursue = function ( target ) {
            var look = this._position.distance( target.getPosition() ),
                clone = target.getPosition().clone();

            clone.add( target._velocity.multiplyNew( look ) );

            this.seek( clone );
        };

        /**
         * 回避
         * @method evade
         * @param {Vehicle} target
         */
        p.evade = function ( target ) {
            var look = this._position.distance( target.getPosition() ) / this._speed,
                clone = target.getPosition().clone();

            clone.sub( target._velocity.multiplyNew( look ) );

            this.flee( clone );
        };

        /**
         * 物体回避
         * @method avoid
         * @param {Array} targets
         */
        p.avoid = function ( targets ) {
            var target,
                heading,
                difference,
                prod,
                distance,
                feeler,
                projection,
                force,
                prf,
                i, limit;

            for ( i = 0, limit = targets.length; i < limit; i++ ) {

                target = targets[ i ];
                heading = this._velocity.clone().normalize();
                difference = target.getPosition().subNew( this._position );
                prod = difference.dot( heading );

                if ( prod > 0 ) {
                    // 前
                    feeler = heading.clone();
                    feeler.multiplyScalar( this._avoid_distance );

                    projection = heading.clone();
                    projection.multiplyScalar( prod );

                    distance = projection.subNew( difference ).length();

                    if (
                        distance < target.getRadius() + this._avoid_buffer &&
                        projection.length() < feeler.length()
                       ) {

                        force = heading.clone();
                        force.multiplyScalar( this._speed );
                        force.setAngle( difference.sign( this._velocity ) * PI_05 );

                        prf = projection.length() / feeler.length();
                        force.multiplyScalar( 1 - prf );

                        this._force.add( force );
                        this._velocity.multiplyScalar( prf );
                    }// if
                }// prod > 0
            }
        };

        return SteeredVehicle;
    }() );

}( window ) );