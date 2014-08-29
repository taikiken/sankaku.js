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
         * @param {LoadImage|Image} img
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
            this.ready = false;

            if ( img.constructor === Sankaku.LoadImage ) {

                img.addEventListener( LoadImage.COMPLETE, boundLoad );
                img.addEventListener( LoadImage.ERROR, boundError );
                img.load();
            } else if ( img.constructor === Image ) {

                this._bitmap = img;
            }
        }

        Sankaku.extend( Shape, Bitmap );

        var p = Bitmap.prototype;

        p.constructor = Bitmap;

        /**
         * @method dispose
         */
        p.dispose = function () {
            var img = this._img;

            img.removeEventListener( LoadImage.COMPLETE, this._boundLoad );
            img.removeEventListener( LoadImage.ERROR, this._boundError );
        };

        /**
         * @method onLoad
         * @param {Object} event
         */
        p.onLoad = function ( event ) {
            this.dispose();
            this._bitmap = event.img;
        };

        /**
         * @method onError
         */
        p.onError = function () {
            this.dispose();
        };

        /**
         * @method clone
         * @return {Bitmap}
         */
        p.clone = function () {
            var img = this._img,
                clone_img, clone;

            if ( img.constructor === Sankaku.LoadImage ) {

                clone_img = img.clone();
            } else {

                clone_img = new Image();
                clone_img.src = img.src;
            }

            clone = new Bitmap( this.x, this.y, this.width, this.height, clone_img );
            clone.rotation = this.rotation;
            clone.scale = this.scale;
            clone.visible = this.visible;
            clone._alpha = this._alpha;

            return clone;
        };

        /**
         * @method setMode
         */
        p.setMode = function () {
            // empty not change mode
        };

        /**
         * @method if
         * @param {CanvasRenderingContext2D} ctx
         * @protected
         */
        p._draw = function ( ctx ) {
            if ( !this._bitmap ) {
                // cant drawing
                return;
            }

            var bounding = this.bounding(),
                e = bounding.e;

            this.ready = true;

            if ( e.visible && e.alpha > 0 && e.scale > 0 ) {
                // parent visible is true
                this.fill( ctx, bounding, this._bitmap );
            }
        };

        /**
         * @method fill
         * @param {CanvasRenderingContext2D} ctx
         * @param {Object} bounding
         * @param {Image} bitmap
         */
        p.fill = function ( ctx, bounding, bitmap ) {
            var e = bounding.e,
                alpha = e.alpha,
                rotation = e.rotation,
                scale = e.scale,
                is_save = false,
                w, h,
                x, y;

            w = this.width * scale;
            h = this.height * scale;
            x = e.x - w * 0.5;
            y = e.y - h * 0.5;

            if ( this.maskMode || alpha < 1 || rotation !== 0 ) {

                ctx.save();
                is_save = true;

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

                if ( this.maskMode ) {

                    ctx.globalCompositeOperation = 'destination-in';
                }

            }

            ctx.drawImage( bitmap, 0, 0, bitmap.width, bitmap.height, x, y, w, h );

            if ( is_save ) {
                ctx.restore();
            }
        };

        return Bitmap;
    }() );
}( window ) );