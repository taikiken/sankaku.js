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
        /**
         * @class SteeredVehicle
         * @extend Vehicle
         * @constructor
         */
        function SteeredVehicle () {
            Vehicle.call( this );

            this._force = new Vector2D();
            this._max = 1;
        }

        Sankaku.extend( Vehicle, SteeredVehicle );

        var p = SteeredVehicle.prototype;

        p.getMax = function () {
            return this._max;
        };

        p.max = function ( n ) {
            this._max = n;
        };

        /**
         * @method update
         * @override
         * @param {number} w
         * @param {number} h
         */
        p.update = function ( w, h ) {
            var force = this._force,
                velocity = this._velocity;

            force.truncate( this._max ).divideScalar( this.getMass() );
            velocity.add( force );

            this._update( w, h );
        };

        /**
         * @method seek
         * @param {Vector2D} target
         */
        p.seek = function ( target ) {
            var desired_velocity = target.subNew( this._position ),
                force;

            desired_velocity.normalize().multiplyScalar( this._speed );

            force = desired_velocity.subNew( this._velocity );

            this._force = new Vector2D();
            this._force.add( force );
        };

        /**
         * @method flee
         * @param {Vector2D} target
         */
        p.flee = function ( target ) {
            var desired_velocity = target.subNew( this._position ),
                force;

            desired_velocity.normalize().multiplyScalar( this._speed );

            force = desired_velocity.subNew( this._velocity );

            this._force = new Vector2D();
            this._force.sub( force );
        };

        return SteeredVehicle;
    }() );

}( window ) );