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
    var document = window.document,

        Sankaku = window.Sankaku,
        Object2D = Sankaku.Object2D
    ;

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
         * @param {*|Object2D} target
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

        return Scene;
    }() );
}( window ) );