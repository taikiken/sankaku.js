/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/23 - 13:25
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

    Sankaku.Point = ( function (){

        /**
         * @class Point
         * @param {number=0} [x]
         * @param {number=0} [y]
         * @constructor
         */
        function Point ( x, y ) {
            this.x = x || 0;
            this.y = y || 0;
        }

        var p = Point.prototype;

        /**
         * @method set
         * @param {number} x
         * @param {number} y
         * @return {Point}
         */
        p.set = function ( x, y ) {
            this.x = x;
            this.y = y;

            return this;
        };

        /**
         * @method copy
         * @param {Point} point
         * @return {Point}
         */
        p.copy = function ( point ) {
            this.x = point.x;
            this.y = point.y;

            return this;
        };

        /**
         * @method clone
         * @return {Point}
         */
        p.clone = function () {
            return new Point( this.x, this.y );
        };

        return Point;
    }() );

}( window ) );