/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/23 - 12:25
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

    Sankaku.Num = ( function (){
        var parseFloat = window.parseFloat,
          _rand = Math.random,
          _floor = Math.floor,
          _PI = Math.PI;

        /**
         * 数値ヘルパー
         * @class Num
         * @constructor
         */
        function Num () {
            throw new Error( "Num can't create instance" );
        }

        var n = Num;

        /**
         * @const ONE_DEG
         * @static
         * @type {number}
         * @default Math.PI / 180
         */
        n.ONE_DEG = _PI / 180;
        /**
         * @const ONE_RAD
         * @static
         * @type {number}
         * @default 180 / Math.PI
         */
        n.ONE_RAD = 180 / _PI;
        /**
         * @const FORTY_FIVE
         * @static
         * @type {number}
         * @default Math.PI / 4
         */
        n.FORTY_FIVE = _PI / 4;
        /**
         * @const NINETY
         * @static
         * @type {number}
         * @default Math.PI / 2
         */
        n.NINETY = _PI / 2;
        /**
         * @const ONE_EIGHTY
         * @static
         * @type {number}
         * @default Math.PI
         */
        n.ONE_EIGHTY = _PI;
        /**
         * @const THREE_SIXTY
         * @static
         * @type {number}
         * @default Math.PI * 2
         */
        n.THREE_SIXTY = _PI * 2;

        /**
         * 数値か否かをチェックします
         * @method is
         * @static
         * @param {Object} obj
         * @return {boolean} true: 数値
         */
        n.is = function ( obj ) {
            return !isNaN( parseFloat( obj ) ) && isFinite( obj );
        };

        /**
         * 範囲指定し乱数を生成します
         * <br>結果は int になります
         * <br>max 省略時は 0 ~ min 間の乱数を発生させます
         * @method random
         * @static
         * @param {number} min
         * @param {number} [max]
         * @return {int} 乱数を返します
         */
        n.random = function ( min, max ) {
            if ( !n.is( max ) ) {

                max = min;
                min = 0;
            }
            return min + _floor( _rand() * ( max - min + 1 ) );
        };

        /**
         * degree を radian へ変換します
         * @method deg2rad
         * @static
         * @param {number} degree degree 0 ~ 360
         * @return {number} radian 0 ~ 2 * PI
         */
        n.deg2rad = function ( degree ) {
            return degree * n.ONE_DEG;
        };

        /**
         * radian を degree へ変換します
         * @method rad2deg
         * @static
         * @param {number} radian
         * @return {number} degree 0 ~ 360
         */
        n.rad2deg = function ( radian ) {
            return radian * n.ONE_RAD;
        };

        return Num;
    }() );
}( window ) );