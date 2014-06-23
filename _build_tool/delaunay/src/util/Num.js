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
            _floor = Math.floor;

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

        return Num;
    }() );
}( window ) );