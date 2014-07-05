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

        Sankaku = window.Sankaku
    ;

    Sankaku.Stage = ( function (){
        // @class Stage
        function Stage ( canvas ) {
            if ( typeof canvas === "undefined" || canvas === null ) {
                canvas = document.createElement( "canvas" );
            }

            this.context = canvas.getContext( "2d" );
            this.element = canvas;
            this._targets = [];
        }

        var p = Stage.prototype;

        p.constructor = Stage;

        p.size = function ( width, height ) {
            var canvas = this.element;

            canvas.width = width;
            canvas.height = height;
        };

        p.getSize = function () {
            var canvas = this.element;

            return {
                width: canvas.width,
                height: canvas.height
            };
        };

        p.getOffset = function () {
            var canvas = this.element;

            return {
                top: canvas.offsetTop,
                left: canvas.offsetLeft
            };
        };

        p.cursor = function ( type ) {

            document.body.style.cursor = type;
        };

        p.append = function ( target ) {
            target.appendChild( this.element );
        };

        p.add = function ( target ) {

            this._targets.push( target );
        };

        return Stage;
    }() );
}( window ) );