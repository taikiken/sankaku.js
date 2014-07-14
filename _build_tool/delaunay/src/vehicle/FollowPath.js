/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/27 - 21:21
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
        SteeredVehicle = Sankaku.SteeredVehicle;

    Sankaku.FollowPath = ( function (){
        /**
         * 経路追従
         * @class FollowPath
         * @extends SteeredVehicle
         * @params {Object2D} viewModel
         * @constructor
         */
        function FollowPath ( viewModel ) {
            SteeredVehicle.call( this, viewModel );

            this._index = 0;
            this._threshold = 20;
        }

        Sankaku.extend( SteeredVehicle, FollowPath );

        var p = FollowPath.prototype;

        p.constructor = Sankaku.FollowPath;

        /**
         * @method clone
         * @return {*|FollowPath}
         */
        p.clone = function () {
//            var clone = new FollowPath();
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
//
//            // myself
//            clone._force = this._force.clone();
//            clone._force_max = this._force_max;
//            clone._force_arrival = this._force_arrival;
//            clone._avoid_distance = this._avoid_distance;
//            clone._avoid_buffer = this._avoid_buffer;
//            clone._avoid_insight = this._avoid_insight;
//            clone._avoid_close = this._avoid_close;
//
//            // follow path
//            clone._index = this._index;
//            clone._threshold = this._threshold;
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
         * @method follow
         * @param {Array} paths
         * @param {boolean=false} [loop]
         */
        p.follow = function ( paths, loop ) {
            loop = !!loop;

            var point = paths[ this._index ],
                last;

            if ( !point ) {
                return;
            }

            last = paths.length - 1;

            if ( this._position.distance( point ) < this._threshold ) {
                // under _threshold

                if ( this._index >= last ) {
                    // end
                    if ( loop ) {
                        // is loop
                        this._index = 0;
                    }
                } else {

                    this._index++;
                }
            }

            if ( this._index >= last && !loop ) {

                this.arrive( point );
            } else {

                this.seek( point );
            }
        };

        /**
         * @method setPath
         * @param {Array} paths
         * @return {FollowPath}
         */
        p.setPath = function ( paths ) {
            this._paths = paths;

            return this;
        };

        /**
         * @method setLoop
         * @param {Boolean} bool
         * @return {FollowPath}
         */
        p.setLoop = function ( bool ) {
            this._loop = bool;

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

            this.follow( this._paths, this._loop );
            this.update( w, h );
        };

        return FollowPath;
    }() );

}( window ) );