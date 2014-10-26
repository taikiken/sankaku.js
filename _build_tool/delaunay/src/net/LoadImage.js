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
    var document = window.document,
        Sankaku = window.Sankaku;

    Sankaku.LoadImage = ( function (){
        /**
         * 画像を読み込みイベントを発火します
         * @class LoadImage
         * @uses EventDispatcher
         * @param {string} path 画像パス
         * @constructor
         */
        function LoadImage ( path ) {
            this._path = path;
        }

        /**
         * 画像読み込み完了イベント
         * @for LoadImage
         * @const COMPLETE
         * @static
         * @type {string}
         */
        LoadImage.COMPLETE = "load_image_complete";
        /**
         * 画像読み込みエラーイベント
         * @for LoadImage
         * @const ERROR
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
            var path = this._path,
                img = new Image(),
                _this = this;

            function dispose () {

                img.removeEventListener( "load", complete );
                img.removeEventListener( "error", error );

                return true;
            }

            function complete () {

                dispose();
                _this.dispatchEvent( { type: LoadImage.COMPLETE, currentTarget: _this, path: path, img: img } );
            }

            function error () {

                dispose();
                _this.dispatchEvent( { type: LoadImage.ERROR, currentTarget: _this, path: path } );

            }

            img.addEventListener( "load", complete, false );
            img.addEventListener( "error", error, false );

            img.src = path;
        };

        return LoadImage;
    }() );
}( window ) );