/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/07/13 - 17:32
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

    Sankaku.Inside = ( function (){
        /**
         * 当たり判定を行います
         * @class Inside
         * @param {Scene} scene
         * @constructor
         */
        function Inside ( scene ) {
            this._scene = scene;
            this._contains = [];
        }

        var p = Inside.prototype;

        p.constructor = Inside;

        /**
         * 座標と当たるオブジェクトを配列で返します
         * @method check
         * @param {Vector2D} v
         * @return {Array}
         */
        p.check = function ( v ) {
            var contains = this._contains;
            contains.length = 0;

            contains = this._scene.inside( v, contains );

//            console.log( "contains", contains );
            return contains.reverse();
        };

        return Inside;
    }() );
}( window ) );