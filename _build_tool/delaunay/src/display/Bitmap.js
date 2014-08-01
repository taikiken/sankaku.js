/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/07/31 - 19:09
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
        Shape = Sankaku.Shape,
        LoadImage = Sankaku.LoadImage;

    Sankaku.Bitmap = ( function (){
        /**
         * @class Bitmap
         * @extends Shape
         * @param {number} x
         * @param {number} y
         * @param {number} width
         * @param {number} height
         * @param {LoadImage} img
         * @constructor
         */
        function Bitmap ( x, y, width, height, img ) {
            Shape.call( this, x, y, width, height );

            var boundLoad = this.onLoad.bind( this ),
                boundError = this.onError.bind( this );

            this._boundLoad = boundLoad;
            this._boundError = boundError;
            this._fill = Shape.FILL;

            this._img = img;
            this._bitmap = null;

            if ( img.constructor === Sankaku.LoadImage ) {

                img.addEventListener( LoadImage.COMPLETE, boundLoad );
                img.addEventListener( LoadImage.ERROR, boundError );
                img.load();
            }
        }

        Sankaku.extend( Shape, Bitmap );

        var p = Bitmap.prototype;

        p.constructor = Bitmap;

        p.dispose = function () {
            var img = this._img;

            img.removeEventListener( LoadImage.COMPLETE, this._boundLoad );
            img.removeEventListener( LoadImage.ERROR, this._boundError );
        };

        p.onLoad = function ( event ) {
            this.dispose();
            this._bitmap = event.img;
        };

        p.onError = function () {
            this.dispose();
        };

        p.clone = function () {
        };

        p.setMode = function () {
            // empty not change mode
        };

        p._draw = function ( ctx ) {
            if ( !this._bitmap ) {
                // cant drawing
                return;
            }

            var bounding = this.bounding();

            this.fill( ctx, bounding, this._bitmap );
        };

        p.fill = function ( ctx, bounding, bitmap ) {
            var e = bounding.e,
                a = bounding.a,
                alpha = e.alpha,
                rotation = e.rotation,
                scale = e.scale,
                w, h,
                x, y;

            w = this.width * scale;
            h = this.height * scale;
            x = e.x - w * 0.5;
            y = e.y - h * 0.5;

            if ( alpha < 1 ||  rotation !== 0 ) {

                ctx.save();


                if ( alpha < 1 ) {

                    ctx.globalAlpha = alpha;
                }

                if ( rotation !== 0 ) {

                    ctx.setTransform( 1, 0, 0, 1, 0, 0 );
                    ctx.translate( e.x, e.y );
                    ctx.rotate( rotation );

                    x = - w * 0.5;
                    y = - h * 0.5;
                }

            }

            ctx.drawImage( bitmap, 0, 0, bitmap.width, bitmap.height, x, y, w, h );

            if ( alpha < 1 ||  rotation !== 0 ) {
                ctx.restore();
            }
        };

        return Bitmap;
    }() );
}( window ) );