/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/18 - 19:08
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

    Sankaku.List = ( function (){
        var
          _rand = Math.random,
          _floor = Math.floor,
          _max = Math.max;

        /**
         * Array ヘルパー
         * @class List
         * @constructor
         */
        function List () {
            throw new Error( "List can't create instance" );
        }

        // http://stackoverflow.com/questions/1295584/most-efficient-way-to-create-a-zero-filled-javascript-array
        // http://jsperf.com/zerofill-2d-array
        /**
         * word で埋められた配列を length 分作成します
         * @method word
         * @static
         * @param {int} length
         * @param {int|string} word
         * @return {Array}
         */
        List.word = function ( length, word ) {
            var arr = [], i;

            for ( i = 0; i < length; i++ ) {
                arr[ i ] = word;
            }

            return arr;
        };

        /**
         * 0 で埋められた配列を length 分作成します
         * @method zero
         * @static
         * @param {int} length
         * @return {Array}
         */
        List.zero = function ( length ) {
            return this.word( length, 0 );
        };

        // http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
        /**
         * 配列をシャッフルします
         * @method shuffle
         * @static
         * @param {Array} array
         * @return {Array} シャッフル後の配列を返します
         */
        List.shuffle = function ( array ) {
            var
              copy = array.slice( 0 ),
              currentIndex = copy.length,
              temporaryValue,
              randomIndex ;

            // While there remain elements to shuffle...
            while ( 0 !== currentIndex ) {

                // Pick a remaining element...
                randomIndex = _floor( _rand() * currentIndex );
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = copy[ currentIndex ];
                copy[ currentIndex ] = copy[ randomIndex ];
                copy[ randomIndex ] = temporaryValue;
            }

            return copy;
        };

        /**
         * 配列内の最大数値を返します
         * @method max
         * @static
         * @param {Array} arr 検証対象の配列、内部は全部数値 [Number, [Number]]
         * @return {number} 配列内の最大数値を返します
         */
        List.max = function ( arr ) {
            return _max.apply( null, arr );
        };

        return List;
    }() );

}( window ) );