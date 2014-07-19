/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/07/05 - 14:03
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
        Object2D = Sankaku.Object2D;

    Sankaku.Scene = ( function (){
        /**
         * @class Scene
         * @constructor
         */
        function Scene () {
            Object2D.call( this );

            this.scene = this;
        }

        Sankaku.extend( Object2D, Scene );

        var p = Scene.prototype;

        p.constructor = Sankaku.Scene;

        /**
         * @method addChild
         * @param {Object2D} target
         */
        p.addChild = function ( target ) {
            target.scene = this;
        };
        /**
         * @method removeChild
         * @param {*|Object2D} target
         */
        p.removeChild = function ( target ) {
            target.scene = null;
        };

        /**
         * point が bounding box 内か外かを調べます
         * <br>Sceneはinsideを調べません
         * @method inside
         * @param {Vector2D} v 調べるpoint
         * @param {Array} 結果を格納する
         * @return {Array} inside の時は contains へthisを格納し返します
         */
        p.inside = function ( v, contains ) {
            var children = this.children,
                i, limit;

            for ( i = 0, limit = children.length; i < limit; i++ ) {

                contains = children[ i ].inside( v, contains );
            }

            return contains;
        };

        return Scene;
    }() );
}( window ) );