/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/07/03 - 11:33
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
    var Sankaku = window.Sankaku;

    Sankaku.Zanzo = ( function (){
        /**
         * 残像感を出すためObject2Dを複数回drawします
         * @class Zanzo
         * @param {int} limit
         * @constructor
         */
        function Zanzo ( limit ) {
            this._limit = limit;
            this._objects = [];
        }

        var p = Zanzo.prototype;

        p.constructor = Zanzo;

        /**
         * @method setLimit
         * @param {int} n
         */
        p.setLimit = function ( n ) {
            this._limit = n;
        };

        /**
         * @method add
         * @param {Array} list [ Object2D, [] ]
         */
        p.add = function ( list ) {
            var objects = this._objects,
              clones = [],
              object, i, limit;

            if ( this._limit > 0 && objects.length >= this._limit ) {

                objects.shift();
            }

            for ( i = 0, limit = list.length; i < limit; i++ ) {

                object = list[ i ];
                clones.push( object.clone() );
            }

            this._objects.push( clones );
        };

        /**
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         * @param {Function} [paint]
         *
         */
        p.draw = function ( ctx, paint ) {
            var objects = this._objects,
              one,
              object,
              step,
              opacity,
              i, limit,
              n, max;


            limit = objects.length;
            step = 1 / ( limit + 1);

            ctx.save();

            for ( i = 0; i < limit; i++ ) {

                one = objects[ i ];
                opacity = step * ( i + 1 );
                ctx.globalAlpha = opacity;

                for ( n = 0, max = one.length; n < max; n++ ) {

                    object = one[ n ];

                    object.draw( ctx );

                    if ( !!paint ) {

                        paint.call( ctx );
                    }
                }
            }

            ctx.restore();
        };

        /**
         * @method length;
         * @return {Number}
         */
        p.length = function () {
            return this._objects.length;
        };

        /**
         * @method clear
         * @return {Zanzo}
         */
        p.clear = function () {
            this._objects = [];

            return this;
        };

        return Zanzo;
    }() );
}( window ) );