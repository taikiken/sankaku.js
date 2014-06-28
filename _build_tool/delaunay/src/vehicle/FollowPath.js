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
         * @constructor
         */
        function FollowPath () {
            SteeredVehicle.call( this );

            this._index = 0;
            this._threshold = 20;
        }

        Sankaku.extend( SteeredVehicle, FollowPath );

        var p = FollowPath.prototype;

        p.constructor = Sankaku.FollowPath;

        /**
         * @method follow
         * @param {Array} paths
         * @param {boolean=false} [loop]
         */
        p.follow = function ( paths, loop ) {
            loop = !!loop;

            var point = paths[ this._index ];
            if ( !point ) {
                return;
            }

            if ( this._position.distance( point ) < this._threshold ) {
                // under _threshold

                if ( this._index >= paths.length - 1 ) {
                    // end
                    if ( loop ) {
                        // is loop
                        this._index = 0;
                    }
                } else {

                    this._index++;
                }
            }

            if ( this._index > paths.length - 1 && !loop ) {

                this.arrive( point );
            } else {

                this.seek( point );
            }
        };

        return FollowPath;
    }() );

}( window ) );