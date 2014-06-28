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
         * @extend Vehicle
         * @constructor
         */
        function SteeredVehicle () {
            Vehicle.call( this );

            this._force = new Vector2D();
            // max force
            this._max = 1.0;
            this._arrival = 100;

            // for avoid
            this._avoid_distance = 300;
            this._buffer = 20;
            this._insight = 200;
            this._close = 60;
        }

        Sankaku.extend( Vehicle, SteeredVehicle );

        var p = SteeredVehicle.prototype;

        p.constructor = SteeredVehicle;

        /**
         * @method clone
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

            return clone;
        };

        /**
         * @method getMax
         * @return {number} SteeredVehicle._max
         */
        p.getMax = function () {
            return this._max;
        };

        /**
         * @method max
         * @param {number} n
         */
        p.max = function ( n ) {
            this._max = n;
        };

        /**
         * @method getArrival
         * @return {number} SteeredVehicle._arrival
         */
        p.getArrival = function () {
            return this._arrival;
        };

        /**
         * @method arrival
         * @param {number} n
         */
        p.arrival = function ( n ) {
            this._arrival = n;
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
            this._buffer = n;
        };
        /**
         * @method getBuffer
         * @return {number|*}
         */
        p.getBuffer = function () {
            return this._buffer;
        };

        /**
         * @method insight
         * @param {number} n
         */
        p.insight = function ( n ) {
            this._insight = n;
        };
        /**
         * @method getInsight
         * @return {number|*}
         */
        p.getInsight = function () {
            return this._insight;
        };

        /**
         * @method close
         * @param {number} n
         */
        p.close = function ( n ) {
            this._close = n;
        };
        /**
         * @method getClose
         * @return {number|*}
         */
        p.getClose = function () {
            return this._close;
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
         * @override
         * @param {number} w
         * @param {number} h
         */
        p.update = function ( w, h ) {
            this._force.truncate( this._max ).divideScalar( this._mass );
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
                arrival = this._arrival,
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
                        distance < target.getRadius() + this._buffer &&
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