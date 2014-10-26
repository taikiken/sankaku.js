/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/26 - 11:40
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

    Sankaku.Distribute = ( function (){
        var _sqrt = Math.sqrt,
            _sin = Math.sin,
            _cos = Math.cos,
            _rand = Math.random,
            PI2 = Math.PI * 2;

        /**
         * 平均化した円形分布を行います
         * @class Distribute
         * @constructor
         */
        function Distribute () {
            throw new Error( "Distribute can't create instance" );
        }

        var d = Distribute;

        /**
         * @method circle
         * @static
         * @param {int} n 乱数 max 値
         * @param {number} w 分布幅
         * @param {number} h 分布高
         * @return {{x: number, y: number}}
         */
        d.circle = function ( n, w, h ) {
            var radius, angle;

            radius = _sqrt( _rand() ) * n;
            angle = _rand() * PI2;

            return {
                x: w * 0.5 + _cos( angle ) * radius,
                y: h * 0.5 + _sin( angle ) * radius
            };
        };

        return Distribute;
    }() );

}( window ) );