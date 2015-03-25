/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/07/31 - 19:12
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

    Sankaku.LoadImage = ( function (){
        /**
         * 画像を読み込みイベントを発火します
         * @class LoadImage
         * @uses EventDispatcher
         * @param {string} path 画像パス
         * @constructor
         */
        function LoadImage ( path ) {
            /**
             * path 画像パス
             * @property _path
             * @type {string}
             * @private
             */
            this._path = path;
            /**
             * load する Image instance
             * @property _img
             * @type {null|Image}
             * @private
             */
            this._img = null;
            /**
             * @property _boundComplete
             * @type {function(this:LoadImage)|*}
             * @private
             */
            this._boundComplete = this.onComplete.bind( this );
            /**
             * @property _boundError
             * @type {function(this:LoadImage)|*}
             * @private
             */
            this._boundError = this.onError.bind( this );
        }

        /**
         * 画像読み込み完了イベント
         * @for LoadImage
         * @event COMPLETE
         * @static
         * @type {string}
         */
        LoadImage.COMPLETE = "load_image_complete";
        /**
         * 画像読み込みエラーイベント
         * @for LoadImage
         * @event ERROR
         * @static
         * @type {string}
         */
        LoadImage.ERROR = "load_image_error";

        var p = LoadImage.prototype;

        p.constructor = LoadImage;

        Sankaku.EventDispatcher.initialize( p );

        /**
         * @method clone
         * @return {LoadImage}
         */
        p.clone = function () {
            return new LoadImage( this._path );
        };

        /**
         * 画像読み込みを開始します
         * @method load
         */
        p.load = function () {
            var img = new Image();

            this._img = img;

            //function dispose () {
            //
            //    img.removeEventListener( "load", complete );
            //    img.removeEventListener( "error", error );
            //
            //    return true;
            //}
            //
            //function complete () {
            //
            //    dispose();
            //    _this.dispatchEvent( { type: LoadImage.COMPLETE, currentTarget: _this, path: path, img: img } );
            //}
            //
            //function error () {
            //
            //    dispose();
            //    _this.dispatchEvent( { type: LoadImage.ERROR, currentTarget: _this, path: path } );
            //
            //}
            //
            //img.addEventListener( "load", complete, false );
            //img.addEventListener( "error", error, false );

            img.addEventListener( "load", this._boundComplete, false );
            img.addEventListener( "error", this._boundError, false );

            img.src = this._path;
        };
        /**
         * @method dispose
         */
        p.dispose = function () {
            var img = this._img;

            img.removeEventListener( "load", this._boundComplete );
            img.removeEventListener( "error", this._boundError );
        };
        /**
         * @method onComplete
         */
        p.onComplete = function () {
            this.dispose();
            this.dispatchEvent( { type: LoadImage.COMPLETE, currentTarget: this, path: this._path, img: this._img } );
        };
        /**
         * @method onError
         */
        p.onError = function () {
            this.dispose();
            this.dispatchEvent( { type: LoadImage.ERROR, currentTarget: this, path: this._path } );
        };

        return LoadImage;
    }() );
}( window ) );