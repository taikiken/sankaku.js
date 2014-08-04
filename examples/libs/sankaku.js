/**
 * @module Sankaku
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 2014/06/20 - 11:55
 *
 * Copyright (c) 2011-2014 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * delaunay
 * original: https://github.com/ironwallaby/delaunay
 *
 * canvas-toBlob.js
 * A canvas.toBlob() implementation.
 * 2011-07-13
 *
 * By Eli Grey, http://eligrey.com and Devin Samarin, https://github.com/eboyjr
 * License: X11/MIT
 *   See LICENSE.md
 * @source http://purl.eligrey.com/github/canvas-toBlob.js/blob/master/canvas-toBlob.js
 *
 * FileSaver.js
 * A saveAs() FileSaver implementation.
 * 2014-05-27
 *
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 * @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js
 *
 * hosted on
 * https://github.com/taikiken/sankaku.js
 */
var Sankaku = {};
/**
 * @for Sankaku
 * @const version
 * @static
 * @type {string}
 */
Sankaku.version = "0.2.10";

// polyfill
( function ( self ){
    "use strict";

    // console
    if ( !self.console ) {
        self.console = {
            info: function (){},
            log: function  (){},
            debug: function (){},
            warn: function (){},
            error: function (){},
            table: function (){}
        };
    }

    // Date.now
    if ( !Date.now ) {
        Date.now = function now() {
            return new Date().getTime();
        };
    }

    ( function() {
        // requestAnimationFrame
        // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        var lastTime = 0;
        var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

        for ( var x = 0; x < vendors.length && !self.requestAnimationFrame; ++ x ) {

            self.requestAnimationFrame = self[ vendors[ x ] + 'RequestAnimationFrame' ];
            self.cancelAnimationFrame = self[ vendors[ x ] + 'CancelAnimationFrame' ] || self[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
        }

        if ( self.requestAnimationFrame === undefined && self.setTimeout !== undefined ) {

            self.requestAnimationFrame = function ( callback ) {

                var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
                var id = self.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
                lastTime = currTime + timeToCall;
                return id;
            };

        }

        if( self.cancelAnimationFrame === undefined && self.clearTimeout !== undefined ) {

            self.cancelAnimationFrame = function ( id ) { self.clearTimeout( id ); };
        }

        // Object.create
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
        if (!Object.create) {
            Object.create = (function(){
                function F(){}

                return function(o){
                    if (arguments.length !== 1) {
                        throw new Error('Object.create implementation only accepts one parameter.');
                    }
                    F.prototype = o;
                    return new F();
                };
            })();
        }

        // Array.isArray
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
        if(!Array.isArray) {
            Array.isArray = function (vArg) {
                return Object.prototype.toString.call(vArg) === "[object Array]";
            };
        }

        // Array.indexOf
        // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function (searchElement , fromIndex) {
                var i,
                    pivot = (fromIndex) ? fromIndex : 0,
                    length;

                if (!this) {
                    throw new TypeError();
                }

                length = this.length;

                if (length === 0 || pivot >= length) {
                    return -1;
                }

                if (pivot < 0) {
                    pivot = length - Math.abs(pivot);
                }

                for (i = pivot; i < length; i++) {
                    if (this[i] === searchElement) {
                        return i;
                    }
                }
                return -1;
            };
        }

        // Array.forEach
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
        if (!Array.prototype.forEach) {
            Array.prototype.forEach = function (fn, scope) {
                var i, len;
                for (i = 0, len = this.length; i < len; ++i) {
                    if (i in this) {
                        fn.call(scope, this[i], i, this);
                    }
                }
            };
        }

        // Function.prototype.bind
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
        if (!Function.prototype.bind) {
            Function.prototype.bind = function (oThis) {
                if (typeof this !== "function") {
                    // closest thing possible to the ECMAScript 5 internal IsCallable function
                    throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                }

                var aArgs = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    fNOP = function () {},
                    fBound = function () {
                        return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
                    };

                fNOP.prototype = this.prototype;
                fBound.prototype = new fNOP();

                return fBound;
            };
        }

        // trim
        // three.js
        String.prototype.trim = String.prototype.trim || function () {

            return this.replace( /^\s+|\s+$/g, '' );

        };

        // getUserMedia
        navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        // URL
        window.URL = window.URL ||
            window.webkitURL ||
            window.mozURL ||
            window.msURL;
    }());

}( window.self ) );

( function ( window ){
    "use strict";
    var Sankaku = window.Sankaku;

    /**
     * 継承に使用します
     * @for Sankaku
     * @method extend
     * @static
     * @param {Function} P 親クラス
     * @param {Function} C 子クラス
     */
    Sankaku.extend = function ( P, C ) {
        C.prototype = Object.create( P.prototype );
        C.prototype.constructor = C;
    };

}( window ) );

/*! canvas-toBlob.js
 * A canvas.toBlob() implementation.
 * 2011-07-13
 *
 * By Eli Grey, http://eligrey.com and Devin Samarin, https://github.com/eboyjr
 * License: X11/MIT
 *   See LICENSE.md
 */

/* global self */
/* jslint bitwise: true, regexp: true, confusion: true, vars: true, white: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/canvas-toBlob.js/blob/master/canvas-toBlob.js */

(function(view) {
    "use strict";
    var Uint8Array = view.Uint8Array,
        HTMLCanvasElement = view.HTMLCanvasElement,
        is_base64_regex = /\s*;\s*base64\s*(?:;|$)/i,
        base64_ranks,
        decode_base64 = function( base64 ) {
            var len = base64.length,
                buffer = new Uint8Array(len / 4 * 3 | 0),
                i = 0,
                outptr = 0,
                last = [0, 0],
                state = 0,
                save = 0,
                rank,
                code,
                undef;

            while ( len-- ) {

                code = base64.charCodeAt(i++);
                rank = base64_ranks[code-43];

                if (rank !== 255 && rank !== undef) {

                    last[1] = last[0];
                    last[0] = code;
                    save = (save << 6) | rank;
                    state++;

                    if (state === 4) {

                        buffer[outptr++] = save >>> 16;

                        if ( last[1] !== 61 ) {
                            /* padding character */
                            buffer[outptr++] = save >>> 8;
                        }

                        if ( last[0] !== 61 ) {
                            /* padding character */
                            buffer[outptr++] = save;
                        }

                        state = 0;
                    }
                }
            }
            // 2/3 chance there's going to be some null bytes at the end, but that
            // doesn't really matter with most image formats.
            // If it somehow matters for you, truncate the buffer up outptr.
            return buffer.buffer;
        };

    if ( Uint8Array ) {

        base64_ranks = new Uint8Array( [
            62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1,
            -1, -1,  0, -1, -1, -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9,
            10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
            -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
            36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
        ] );
    }

    if ( HTMLCanvasElement && !HTMLCanvasElement.prototype.toBlob ) {

        HTMLCanvasElement.prototype.toBlob = function( callback, type /*, ...args*/) {

            if (!type) {

                type = "image/png";
            }

            if ( !!this.mozGetAsFile ) {

                callback( this.mozGetAsFile( "canvas", type ) );
                return;
            }

            var args = Array.prototype.slice.call(arguments, 1),
                dataURI = this.toDataURL.apply(this, args),
                header_end = dataURI.indexOf(","),
                data = dataURI.substring(header_end + 1),
                is_base64 = is_base64_regex.test(dataURI.substring(0, header_end)),
                blob;

            if ( Blob.fake ) {
                // no reason to decode a data: URI that's just going to become a data URI again
                blob = new Blob();

                if ( is_base64 ) {

                    blob.encoding = "base64";
                } else {

                    blob.encoding = "URI";
                }

                blob.data = data;
                blob.size = data.length;

            } else if ( Uint8Array ) {

                if ( is_base64 ) {

                    blob = new Blob( [ new Uint8Array( decode_base64( data ) ) ], { type: type } );
                } else {

                    blob = new Blob( [ new Uint8Array( decodeURIComponent( data ) ) ], { type: type } );
                }
            }
            callback(blob);
        };
    }
}(self));
( function ( Sankaku ){
    "use strict";

    Sankaku.EventDispatcher = ( function (){
        /**
         * カスタム Event を管理します<br>
         * 必要なClassでmixinします<br>
         * mixin 後下記の4関数が使用できるようになります<br>
         * addEventListener<br>
         * hasEventListener<br>
         * removeEventListener<br>
         * dispatchEvent<br>
         *
         *      function SomeClass () {}
         *      // mixin
         *      Sankaku.EventDispatcher.initialize( SomeClass.prototype );
         *
         * @class EventDispatcher
         * @constructor
         */
        function EventDispatcher () {
//            this._listeners = {};
        }

        var p = EventDispatcher.prototype;

        p.constructor = EventDispatcher;

        /**
         * イベントにハンドラを登録します<br>
         * ハンドラ内のthisはイベント発生元になるので注意が必要です<br>
         * this参照を変えないために bind を使用する方法があります
         *
         *      function EventReceive () {
         *          var example = new ExampleClass();
         *
         *          example.addEventListener( "other", onOtherHandler );
         *          example.addEventListener( "example", this.onBoundHandler.bind( this ) );
         *      }
         *
         *      EventReceive.prototype.onOtherHandler ( event ) {
         *          console.log( this );// ExampleClass
         *      }
         *
         *      EventReceive.prototype.onBoundHandler ( event ) {
         *          console.log( this );// EventReceive
         *      }
         *
         * @method addEventListener
         * @param {string} type event type
         * @param {function} listener event handler
         */
        p.addEventListener = function ( type, listener ) {

            if ( typeof this._listeners === "undefined") {

                this._listeners = {};
            }

            var listeners = this._listeners;

            if ( typeof listeners[ type ] === "undefined" ) {

                listeners[ type ] = [];
            }

            if ( listeners[ type ].indexOf( listener ) === - 1 ) {

                listeners[ type ].push( listener );
            }
        };

        /**
         * @method hasEventListener
         * @param {string} type event type
         * @param {function} listener event handler
         * @return {boolean} event type へ listener 登録が有るか無いかの真偽値を返します
         */
        p.hasEventListener = function ( type, listener ) {

            var listeners = this._listeners;

            if ( typeof listeners === "undefined") {

                return false;
            } else if ( typeof listener[ type ] !== "undefined" && listeners[ type ].indexOf( listener ) !== - 1 ) {

                return true;
            }

            return false;
        };

        /**
         * event type から listener を削除します<br>
         * メモリーリークの原因になるので不要になったlistenerは必ずremoveEventListenerを実行します
         *
         * @method removeEventListener
         * @param {string} type event type
         * @param {function} listener event handler
         */
        p.removeEventListener = function ( type, listener ) {
            if ( typeof this._listeners === "undefined") {

                return;
            }

            var listeners = this._listeners,
                listeners_types = listeners[ type ],
                index;

            if ( typeof listeners_types !== "undefined" ) {

                index = listeners_types.indexOf( listener );

                if ( index !== -1 ) {

                    listeners_types.splice( index, 1 );
                }
            }
        };

        /**
         * event発生をlistenerに通知します
         *
         * @method dispatchEvent
         * @param {Object} event require event.type:String, { type: "some_event", [currentTarget: this] }
         */
        p.dispatchEvent = function ( event ) {
            var listeners = this._listeners,
                listeners_types,
                i, limit;

            if ( typeof listeners === "undefined" || typeof event.type === "undefined" ) {

                return;
            }

            listeners_types = listeners[ event.type ];

            if ( typeof listeners_types !== "undefined" ) {

                event.target = this;

                for ( i = 0, limit = listeners_types.length; i < limit; i++ ) {

                    listeners_types[ i ].call( this, event );
                }
            }
        };

        /**
         * EventDispatcher mixin <br>
         *
         * addEventListener<br>
         * hasEventListener<br>
         * removeEventListener<br>
         * dispatchEvent<br>
         * をobjectへ追加します
         *
         *      function SomeClass () {}
         *      // mixin
         *      Sankaku.EventDispatcher.initialize( SomeClass.prototype );
         *
         *      var someObject = {};
         *      // mixin
         *      Sankaku.EventDispatcher.initialize( someObject );
         *
         * @method initialize
         * @param {Object} object
         * @static
         */
        EventDispatcher.initialize = function ( object ) {
            object.addEventListener = p.addEventListener;
            object.hasEventListener = p.hasEventListener;
            object.removeEventListener = p.removeEventListener;
            object.dispatchEvent = p.dispatchEvent;
        };

        return EventDispatcher;
    }() );

}( window.Sankaku ) );
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
         * @param path
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
/**
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 2014/07/20 - 20:31
 *
 * Copyright (c) 2011-2014 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
/*! FileSaver.js
 * A saveAs() FileSaver implementation.
 * 2014-05-27
 *
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
( function ( window ){
    "use strict";
    var Sankaku = window.Sankaku;

    var saveAs = saveAs ||
        // IE 10+ (native saveAs)
        (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator)) ||
        // Everyone else
        ( function ( view ) {
            // IE <10 is explicitly unsupported
            if ( typeof navigator !== "undefined" && /MSIE [1-9]\./.test( navigator.userAgent ) ) {
                return;
            }

            var doc = view.document,

                get_URL = function() {
                    // only get URL when necessary in case Blob.js hasn't overridden it yet
                    return view.URL || view.webkitURL || view;
                },
                save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"),
                can_use_save_link = !view.externalHost && "download" in save_link,
                click = function(node) {
                    var event = doc.createEvent("MouseEvents");
                    event.initMouseEvent(
                        "click", true, false, view, 0, 0, 0, 0, 0
                        , false, false, false, false, 0, null
                    );
                    node.dispatchEvent(event);
                },
                webkit_req_fs = view.webkitRequestFileSystem,
                req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem,

                throw_outside = function ( ex ) {
                    ( view.setImmediate || view.setTimeout )(function() {
                        throw ex;
                    }, 0);
                },
                force_saveable_type = "application/octet-stream",
                fs_min_size = 0,
                deletion_queue = [],

                process_deletion_queue = function() {
                    var i = deletion_queue.length;
                    while (i--) {
                        var file = deletion_queue[i];
                        if (typeof file === "string") {
                            // file is an object URL
                            get_URL().revokeObjectURL( file );
                        } else {
                            // file is a File
                            file.remove();
                        }
                    }
                    // clear queue
                    deletion_queue.length = 0;
                },
                dispatch = function ( filesaver, event_types, event ) {
                    event_types = [].concat( event_types );

                    var i = event_types.length;

                    while ( i-- ) {
                        var listener = filesaver["on" + event_types[i]];

                        if (typeof listener === "function") {
                            try {
                                listener.call(filesaver, event || filesaver);
                            } catch (ex) {
                                throw_outside(ex);
                            }
                        }
                    }
                },
                FileSaver = function ( blob, name ) {
                    // First try a.download, then web filesystem, then object URLs
                    var filesaver = this,
                        type = blob.type,
                        blob_changed = false,
                        object_url,
                        target_view,
                        get_object_url = function() {
                            var object_url = get_URL().createObjectURL(blob);

                            deletion_queue.push(object_url);

                            return object_url;
                        },
                        dispatch_all = function() {
                            dispatch(filesaver, "writestart progress write writeend".split(" "));
                        },
                        fs_error = function() {
                            // on any filesys errors revert to saving with object URLs

                            // don't create more object URLs than needed
                            if (blob_changed || !object_url) {
                                object_url = get_object_url(blob);
                            }

                            if (target_view) {
                                target_view.location.href = object_url;
                            } else {
                                window.open(object_url, "_blank");
                            }

                            filesaver.readyState = filesaver.DONE;
                            dispatch_all();
                        },
                        abortable = function(func) {
                            return function() {
                                if (filesaver.readyState !== filesaver.DONE) {
                                    return func.apply(this, arguments);
                                }
                            };
                        },
                        create_if_not_found = {create: true, exclusive: false},
                        slice;

                    filesaver.readyState = filesaver.INIT;

                    if (!name) {

                        name = "download";
                    }

                    if (can_use_save_link) {

                        object_url = get_object_url(blob);
                        save_link.href = object_url;
                        save_link.download = name;
                        click(save_link);
                        filesaver.readyState = filesaver.DONE;
                        dispatch_all();
                        return;
                    }
                    // Object and web filesystem URLs have a problem saving in Google Chrome when
                    // viewed in a tab, so I force save with application/octet-stream
                    // http://code.google.com/p/chromium/issues/detail?id=91158
                    if (view.chrome && type && type !== force_saveable_type) {
                        slice = blob.slice || blob.webkitSlice;
                        blob = slice.call(blob, 0, blob.size, force_saveable_type);
                        blob_changed = true;
                    }
                    // Since I can't be sure that the guessed media type will trigger a download
                    // in WebKit, I append .download to the filename.
                    // https://bugs.webkit.org/show_bug.cgi?id=65440
                    if (webkit_req_fs && name !== "download") {
                        name += ".download";
                    }

                    if (type === force_saveable_type || webkit_req_fs) {
                        target_view = view;
                    }

                    if (!req_fs) {
                        fs_error();
                        return;
                    }

                    fs_min_size += blob.size;

                    req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
                        fs.root.getDirectory("saved", create_if_not_found, abortable( function( dir ) {
                            var save = function() {
                                dir.getFile( name, create_if_not_found, abortable( function( file ) {
                                    file.createWriter(abortable(function(writer) {

                                        writer.onwriteend = function(event) {
                                            target_view.location.href = file.toURL();
                                            deletion_queue.push(file);
                                            filesaver.readyState = filesaver.DONE;
                                            dispatch(filesaver, "writeend", event);
                                        };

                                        writer.onerror = function() {
                                            var error = writer.error;
                                            if (error.code !== error.ABORT_ERR) {
                                                fs_error();
                                            }
                                        };

                                        "writestart progress write abort".split(" ").forEach(function(event) {
                                            writer[ "on" + event ] = filesaver[ "on" + event ];
                                        });

                                        writer.write( blob );

                                        filesaver.abort = function() {
                                            writer.abort();
                                            filesaver.readyState = filesaver.DONE;
                                        };

                                        filesaver.readyState = filesaver.WRITING;

                                    }), fs_error);

                                }), fs_error);

                            };
                            dir.getFile( name, {create: false}, abortable( function( file ) {
                                // delete file if it already exists
                                file.remove();
                                save();

                            } ), abortable(function(ex) {

                                if (ex.code === ex.NOT_FOUND_ERR) {

                                    save();
                                } else {

                                    fs_error();
                                }
                            }));
                        }), fs_error);
                    }), fs_error);
                },
                FS_proto = FileSaver.prototype,

                saveAs = function(blob, name) {
                    return new FileSaver(blob, name);
                };

            FS_proto.abort = function() {
                var filesaver = this;

                filesaver.readyState = filesaver.DONE;
                dispatch(filesaver, "abort");
            };
            FS_proto.readyState = FS_proto.INIT = 0;
            FS_proto.WRITING = 1;
            FS_proto.DONE = 2;

            FS_proto.error =
                FS_proto.onwritestart =
                    FS_proto.onprogress =
                        FS_proto.onwrite =
                            FS_proto.onabort =
                                FS_proto.onerror =
                                    FS_proto.onwriteend =
                                        null;

            view.addEventListener("unload", process_deletion_queue, false);

            saveAs.unload = function() {
                process_deletion_queue();
                view.removeEventListener("unload", process_deletion_queue, false);
            };
            return saveAs;
        }(
                typeof self !== "undefined" && self
                || typeof window !== "undefined" && window
                || this.content
        ));

    /**
     * @class FileSave
     * @constructor
     */
    function FileSave () {}

    FileSave.prototype.constructor = Sankaku.FileSave;

    /**
     * @method saveAs
     * @static
     * @type {*|boolean}
     */
    FileSave.saveAs = saveAs;

    Sankaku.FileSave = FileSave;

}( window ) );


//
//// `self` is undefined in Firefox for Android content script context
//// while `this` is nsIContentFrameMessageManager
//// with an attribute `content` that corresponds to the window
//
//if (typeof module !== "undefined" && module !== null) {
//    module.exports = saveAs;
//} else if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
//    define([], function() {
//        return saveAs;
//    });
//}
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/20 - 18:44
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

    Sankaku.Iro = ( function (){
        /**
         * https://github.com/less/less.js/blob/master/lib/less/functions.js
         * <br>http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
         *
         * @class Iro
         * @constructor
         */
        function Iro () {
            throw new Error( "Iro can't create instance" );
        }

        var iro = Iro;

        // https://github.com/less/less.js/blob/master/lib/less/functions.js
        // http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
        /**
         *
         * @method rgb2hsl
         * @static
         * @param {int} r
         * @param {int} g
         * @param {int} b
         * @return {object} {h: number, s: number, l: number}
         */
        iro.rgb2hsl = function ( r, g, b ){
            r /= 255;
            g /= 255;
            b /= 255;

            var max = Math.max( r, g, b ),
                min = Math.min( r, g, b ),
                h, s, l, d;

            l = ( max + min ) / 2;

            if ( max === min ) {

                h = s = 0; // achromatic
            } else {

                d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                switch( max ){
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }

                h /= 6;
            }

            return { h: h, s: s, l: l };
        };

        /**
         * @method hsl2rgb
         * @static
         * @param {number} h
         * @param {number} s
         * @param {number} l
         * @return {object} {r: number, g: number, b: number}
         */
        iro.hsl2rgb = function ( h, s, l ) {
            var r, g, b;

            function hue2rgb ( p, q, t ) {

                if (t < 0) {t += 1;}
                if (t > 1) {t -= 1;}
                if (t < 1/6) {return p + (q - p) * 6 * t;}
                if (t < 1/2) {return q;}
                if (t < 2/3) {return p + (q - p) * (2/3 - t) * 6;}

                return p;
            }

            if( s === 0 ) {

                r = g = b = l; // achromatic
            }else{

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s,
                    p = 2 * l - q;

                r = hue2rgb( p, q, h + 1/3 );
                g = hue2rgb( p, q, h );
                b = hue2rgb( p, q, h - 1/3 );
            }

            return {
                r: r * 255,
                g: g * 255,
                b: b * 255
            };
        };

        /**
         * @method rgb2hsv
         * @static
         * @param {int} r
         * @param {int} g
         * @param {int} b
         * @return {object} {h: number, s: number, v: number}
         */
        iro.rgb2hsv = function ( r, g, b ) {
            r /= 255;
            g /= 255;
            b /= 255;

            var max = Math.max( r, g, b ),
                min = Math.min( r, g, b ),
                h, s, v = max,
                d = max - min;

            s = max === 0 ? 0 : d / max;

            if ( max === min ) {
                h = 0; // achromatic
            } else {
                switch ( max ) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }

                h /= 6;
            }

            return { h: h, s: s, v: v };
        };

        /**
         * @method hsv2rgb
         * @static
         * @param {number} h
         * @param {number} s
         * @param {number} v
         * @return {object} {r: number, g: number, b: number}
         */
        iro.hsv2rgb = function ( h, s, v ) {
            var r, g, b,
                i = Math.floor( h * 6 ),
                f = h * 6 - i,
                p = v * ( 1 - s ),
                q = v * ( 1 - f * s ),
                t = v * ( 1 - ( 1 - f ) * s );

            switch ( i % 6 ) {
                case 0: r = v; g = t; b = p; break;
                case 1: r = q; g = v; b = p; break;
                case 2: r = p; g = v; b = t; break;
                case 3: r = p; g = q; b = v; break;
                case 4: r = t; g = p; b = v; break;
                case 5: r = v; g = p; b = q; break;
            }

            return {
                r: parseInt( r * 255, 10),
                g: parseInt( g * 255, 10),
                b: parseInt( b * 255, 10)
            };
        };

        // http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
        /**
         * @method hex2rgb
         * @static
         * @param {string} hex CSS 色設定文字 #ff0000
         * @return {object} {r: number, g: number, b: number}
         */
        iro.hex2rgb = function ( hex ) {
            if ( typeof hex !== "string" ) {
                // order string
                return null;
            }

            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function( m, r, g, b ) {
                return r + r + g + g + b + b;
            });

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );
            return result ? {
                r: parseInt( result[1], 16 ),
                g: parseInt( result[2], 16 ),
                b: parseInt( result[3], 16 )
            } : null;
        };

        /**
         * @method rgb2hex
         * @static
         * @param {int} r
         * @param {int} g
         * @param {int} b
         * @return {string}
         */
        iro.rgb2hex = function ( r, g, b ) {
            function componentToHex( c ) {

                var hex = c.toString( 16 );
                return hex.length === 1 ? "0" + hex : hex;
            }

            return "#" + componentToHex( r ) + componentToHex( g ) + componentToHex( b );
        };

        /**
         * @method int2hex
         * @static
         * @param {number} num
         * @return {string}
         */
        iro.int2hex = function ( num ) {
            num = Math.floor( num );

            var hex = num.toString( 16 );

            if ( hex.length < 6 ) {

                var i = hex.length,
                    sub = 6 - i;

                while( sub ) {

                    hex = "0" + hex;
                    --sub;
                }
            }

            return "#" + hex;
        };

        return Iro;
    }() );
}( window ) );
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
        var _rand = Math.random,
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

        var l = List;

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
        l.word = function ( length, word ) {
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
        l.zero = function ( length ) {
            return this.word( length, 0 );
        };

        /**
         * 配列をシャッフルします
         * @method shuffle
         * @static
         * @param {Array} array
         * @return {Array} シャッフル後の配列を返します
         */
        l.shuffle = function ( array ) {
            var copy = [], n = array.length, i;

            // While there remain elements to shuffle…
            while ( n ) {

                // Pick a remaining element…
                i = _floor( _rand() * array.length );

                // If not already shuffled, move it to the new array.
                if ( i in array ) {

                    copy.push( array[ i ] );
                    delete array[ i ];
                    --n;
                }
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
        l.max = function ( arr ) {
            return _max.apply( null, arr );
        };

        return List;
    }() );

}( window ) );
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
            _floor = Math.floor,
            _PI = Math.PI;

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
         * @const ONE_DEG
         * @type {number}
         * @default Math.PI / 180
         */
        n.ONE_DEG = _PI / 180;
        /**
         * @const FORTY_FIVE
         * @type {number}
         * @default Math.PI / 4
         */
        n.FORTY_FIVE = _PI / 4;
        /**
         * @const NINETY
         * @type {number}
         * @default Math.PI / 2
         */
        n.NINETY = _PI / 2;
        /**
         * @const ONE_EIGHTY
         * @type {number}
         * @default Math.PI
         */
        n.ONE_EIGHTY = _PI;
        /**
         * @const THREE_SIXTY
         * @type {number}
         * @default Math.PI * 2
         */
        n.THREE_SIXTY = _PI * 2;

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

        /**
         * degree を radian へ変換します
         * @method deg2rad
         * @param {number} degree degree 0 ~ 360
         * @return {number} radian 0 ~ 2 * PI
         */
        n.deg2rad = function ( degree ) {
            return degree * n.ONE_DEG;
        };

        return Num;
    }() );
}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/26 - 11:40
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

    Sankaku.Distribute = ( function (){
        var _sqrt = Math.sqrt,
            _sin = Math.sin,
            _cos = Math.cos,
            _rand = Math.random,
            PI2 = Math.PI * 2;

        /**
         * @class Distribute
         * @constructor
         */
        function Distribute () {
            throw new Error( "Distribute can't create instance" );
        }

        var d = Distribute;

        /**
         * @method circle
         * @static
         * @param {int} n 乱数 max 値
         * @param {number} w 分布幅
         * @param {number} h 分布高
         * @return {{x: number, y: number}}
         */
        d.circle = function ( n, w, h ) {
            var radius, angle;

            radius = _sqrt( _rand() ) * n;
            angle = _rand() * PI2;

            return {
                x: w * 0.5 + _cos( angle ) * radius,
                y: h * 0.5 + _sin( angle ) * radius
            };
        };

        return Distribute;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/22 - 17:33
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

    Sankaku.Vector2D = ( function (){
        var _floor = Math.floor,
            _ceil = Math.ceil,
            _round = Math.round,
            _cos = Math.cos,
            _sin = Math.sin,
            _atan2 = Math.atan2,
            _sqrt = Math.sqrt,
            _min = Math.min,
            _acos = Math.acos;
        /**
         * 二次元ベクトルクラス
         * @class Vector2D
         * @param {number=0} [x]
         * @param {number=0} [y]
         * @constructor
         */
        function Vector2D ( x, y ) {
            this.x = x || 0;
            this.y = y || 0;
        }

        var p = Vector2D.prototype;

        p.constructor = Vector2D;

        /**
         * ベクトルを可視化するのに用います
         * <br>デバッグなどで使用します。
         *
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         * @return {Vector2D}
         */
        p.draw = function ( ctx ) {

            ctx.beginPath();
            ctx.moveTo( 0, 0 );
            ctx.lineTo( this.x, this.y );
            ctx.closePath();

            return this;
        };

        /**
         * ベクトルのコピーを作成します
         * @method clone
         * @return {Vector2D}
         */
        p.clone = function () {
            return new Vector2D( this.x, this.y );
        };

        /**
         * ベクトルのx, yの値を 0 にします
         * @method zero
         * @return {Vector2D}
         */
        p.zero = function () {
            this.x = 0;
            this.y = 0;

            return this;
        };

        /**
         * ベクトルの値が x, y 共 0 かどうかを判定します
         * @method isZero
         * @return {boolean}
         */
        p.isZero = function () {
            return this.x === 0 && this.y === 0;
        };

        /**
         * ベクトルへ値を設定します
         * @method set
         * @param {number} x
         * @param {number} y
         * @return {Vector2D}
         */
        p.set = function ( x, y ) {
            this.x = x;
            this.y = y;

            return this;
        };

        /**
         * ベクトルの x へ値を設定します
         * @method setX
         * @param {number} x
         * @return {Vector2D}
         */
        p.setX = function ( x ) {
            this.x = x;

            return this;
        };

        /**
         * ベクトルの y へ値を設定します
         * @method setY
         * @param {number} y
         * @return {Vector2D}
         */
        p.setY = function ( y ) {
            this.y = y;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を複写します
         * @method copy
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.copy = function ( v ) {
            this.x = v.x;
            this.y = v.y;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を加算します
         * @method add
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.add = function ( v ) {
            this.x += v.x;
            this.y += v.y;

            return this;
        };

        /**
         * ベクトルへ値を加算します
         * @method add
         * @param {number} s
         * @return {Vector2D}
         */
        p.addScalar = function ( s ) {
            this.x += s;
            this.y += s;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を加算し新しいVector2Dを作成します
         * @method addNew
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.addNew = function ( v ) {
            return new Vector2D( this.x + v.x, this.y + v.y );
        };

        /**
         * 二つのベクトルの値を加算します
         * @method addVector
         * @param {Vector2D} a
         * @param {Vector2D} b
         * @return {Vector2D}
         */
        p.addVector = function ( a, b ) {
            this.x = a.x + b.x;
            this.y = a.y + b.y;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を減算します
         * @method sub
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.sub = function ( v ) {
            this.x -= v.x;
            this.y -= v.y;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を減算し新しいVector2Dを作成します
         * @method subNew
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.subNew = function ( v ) {
            return new Vector2D( this.x - v.x, this.y - v.y );
        };

        /**
         * 二つのベクトルの値を減算します
         * @method subVector
         * @param {Vector2D} a
         * @param {Vector2D} b
         * @return {Vector2D}
         */
        p.subVector = function ( a, b ) {

            this.x = a.x - b.x;
            this.y = a.y - b.y;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を乗算します
         * @method multiply
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.multiply = function ( v ) {
            this.x *= v.x;
            this.y *= v.y;

            return this;
        };

        /**
         * ベクトルの値を乗算します
         * @method multiplyScalar
         * @param {number} s
         * @return {Vector2D}
         */
        p.multiplyScalar = function ( s ) {

            this.x *= s;
            this.y *= s;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を乗算し新しいVector2Dを作成します
         * @method multiplyNew
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.multiplyNew = function ( v ) {
            return new Vector2D( this.x * v.x, this.y * v.y );
        };

        /**
         * ベクトルへ引数ベクトルの値を除算します
         * @method divide
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.divide = function ( v ) {
            this.x /= v.x;
            this.y /= v.y;

            return this;
        };

        /**
         * ベクトルの値を除算します
         * @method divideScalar
         * @param {number} scalar
         * @return {Vector2D}
         */
        p.divideScalar = function ( scalar ) {
            if ( scalar !== 0 ) {

                var invScalar = 1 / scalar;

                this.x *= invScalar;
                this.y *= invScalar;

            } else {

                this.x = 0;
                this.y = 0;

            }

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を除算し新しいVector2Dを作成します
         * @method divideNew
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.divideNew = function ( v ) {
            return new Vector2D( this.x / v.x, this.y / v.y );
        };

        /**
         * ベクトルへ引数ベクトルの値と比較し小さな方の値を設定します
         * @method min
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.min = function ( v ) {
            if ( this.x > v.x ) {

                this.x = v.x;
            }

            if ( this.y > v.y ) {

                this.y = v.y;
            }

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値と比較し大きな方の値を設定します
         * @method max
         * @param {Vector2D} v
         * @return {Vector2D}
         */
        p.max = function ( v ) {
            if ( this.x < v.x ) {

                this.x = v.x;
            }

            if ( this.y < v.y ) {

                this.y = v.y;
            }

            return this;
        };

        /**
         * this.min( min_v ), this.max( max_v ) を実行します
         * @method clamp
         * @param {Vector2D} min_v
         * @param {Vector2D} max_v
         * @return {Vector2D}
         */
        p.clamp = function ( min_v, max_v ) {
//            if ( this.x < min.x ) {
//
//                this.x = min.x;
//            } else if ( this.x > max.x ) {
//
//                this.x = max.x;
//            }
//
//            if ( this.y < min.y ) {
//
//                this.y = min.y;
//            } else if ( this.y > max.y ) {
//
//                this.y = max.y;
//            }
            this.min( min_v );
            this.max( max_v );

            return this;
        };

        /**
         * スカラ値を使用しclampします
         * @method clampScalar
         * @param {number} minVal
         * @param {number} maxVal
         * @return {Vector2D}
         */
        p.clampScalar = function ( minVal, maxVal ) {
            var min, max;

            min = new Vector2D();
            max = new Vector2D();

            min.set( minVal, minVal );
            max.set( maxVal, maxVal );

            return this.clamp( min, max );
        };

        /**
         * @method floor
         * @return {Vector2D}
         */
        p.floor = function () {
            this.x = _floor( this.x );
            this.y = _floor( this.y );

            return this;
        };

        /**
         * @method ceil
         * @return {Vector2D}
         */
        p.ceil = function () {
            this.x = _ceil( this.x );
            this.y = _ceil( this.y );

            return this;
        };

        /**
         * @method round
         * @return {Vector2D}
         */
        p.round = function () {
            this.x = _round( this.x );
            this.y = _round( this.y );

            return this;
        };

        /**
         * @method roundToZero
         * @return {Vector2D}
         */
        p.roundToZero = function () {
            this.x = ( this.x < 0 ) ? _ceil( this.x ) : _floor( this.x );
            this.y = ( this.y < 0 ) ? _ceil( this.y ) : _floor( this.y );

            return this;
        };

        /**
         * @method negate
         * @return {Vector2D}
         */
        p.negate = function () {
            return this.multiplyScalar( - 1 );
        };

        /**
         * ベクトルと引数ベクトルの内積を計算します
         * @method dot
         * @param {Vector2D} v 内積をとる Vector2D インスタンス
         * @return {number}
         */
        p.dot = function ( v ) {
            return this.x * v.x + this.y * v.y;
        };

        /**
         * ベクトルの大きさの２条を計算します
         * @method lengthSq
         * @return {number}
         */
        p.lengthSq = function () {
            return this.x * this.x + this.y * this.y;
        };

        /**
         * ベクトルの大きさの２条の平方根を計算します
         * @method length
         * @return {number}
         */
        p.length = function () {
            return _sqrt( this.lengthSq() );
        };

        /**
         * ベクトルの大きさを設定します
         * @method setLength
         * @param {number} l
         * @return {Vector2D}
         */
        p.setLength = function ( l ) {
            var oldLength = this.length();

            if ( oldLength !== 0 && l !== oldLength ) {

                this.multiplyScalar( l / oldLength );
            }

            return this;
        };

        /**
         * ベクトルの角度を設定します
         * @method setAngle
         * @param {number} value radian
         * @return {Vector2D}
         */
        p.setAngle = function ( value ) {
            var len = this.length();

            len = len || 0.001;

            this.x = _cos( value ) * len;
            this.y = _sin( value ) * len;

            return this;
        };

        /**
         * ベクトルの角度を計算します
         * @method angle
         * @return {number}
         */
        p.angle = function () {
            return _atan2( this.y, this.x );
        };

        /**
         * ベクトルの大きさを正規化（大きさを1）にします
         *
         * @method normalize
         * @return {Vector2D}
         */
        p.normalize = function () {
            return this.divideScalar( this.length() );
        };

        /**
         * ベクトルと引数ベクトル間の距離の２条を計算します
         * @method distanceSq
         * @param {Vector2D} v
         * @return {number}
         */
        p.distanceSq = function ( v ) {
            var dx = this.x - v.x,
                dy = this.y - v.y;

            return dx * dx + dy * dy;
        };

        /**
         * ベクトルと引数ベクトル間の距離を計算します
         * @method distance
         * @param {Vector2D} v
         * @return {number}
         */
        p.distance = function ( v ) {
            return _sqrt( this.distanceSq( v ) );
        };

        /**
         * @method lerp
         * @param {Vector2D} v
         * @param {number} alpha
         * @return {Vector2D}
         */
        p.lerp = function ( v, alpha ) {
            this.x += ( v.x - this.x ) * alpha;
            this.y += ( v.y - this.y ) * alpha;

            return this;
        };

        /**
         * ベクトルと引数ベクトルの値が等しいかを判定します
         * @method equals
         * @param {Vector2D} v
         * @return {boolean}
         */
        p.equals = function ( v ) {
            return ( ( v.x === this.x ) && ( v.y === this.y ) );
        };

        /**
         * 配列を使いベクトルを設定します
         * @method fromArray
         * @param {Array} array [x: number, y: number]
         * @return {Vector2D}
         */
        p.fromArray = function ( array ) {
            this.x = array[ 0 ];
            this.y = array[ 1 ];

            return this;
        };

        /**
         * ベクトルの値を配列として返します
         * @method toArray
         * @return {[]} [x: number, y: number]
         */
        p.toArray = function () {
            return [ this.x, this.y ];
        };

        /**
         * ベクトルの値を設定した値以下にします
         * @method truncate
         * @param {number} max
         * @return {Vector2D}
         */
        p.truncate = function ( max ) {
            var min = _min( max, this.length() );
            return this.setLength( min );
        };

        /**
         * ベクトルの値を反転します
         * @method reverse
         * @return {Vector2D}
         */
        p.reverse = function () {
//            this.x *= -1;
//            this.y *= -1;
            this.negate();

            return this;
        };

        /**
         * ベクトルが正規化されているかを判定します
         * @method isNormalize
         * @return {boolean}
         */
        p.isNormalize = function () {
            return this.length() === 1;
        };

        /**
         * このベクトルに垂直なベクトルを生成し返します
         * @method perpendicular
         * @return {Vector2D} このベクトルに垂直なベクトル
         */
        p.perpendicular = function () {
            return new Vector2D( -this.y, this.x );
        };

        /**
         * 引数ベクトルが、このベクトルの左側にあるか右側かを判定します
         *
         * @method sign
         * @param {Vector2D} v
         * @return {number} -1: 左側, 1: 右側
         */
        p.sign = function ( v ) {
            return this.perpendicular().dot( v ) < 0 ? -1 : 1;
        };

        /**
         * ２つのベクトル間の角度を計算します
         * @method angleBetween
         * @static
         * @param {Vector2D} v1
         * @param {Vector2D} v2
         * @return {number}
         */
        Vector2D.angleBetween = function ( v1, v2 ) {

            if ( !v1.isNormalize() ) {

                v1 = v1.clone().normalize();
            }
            if ( !v2.isNormalize() ) {

                v2 = v2.clone().normalize();
            }

            return _acos( v1.dot( v2 ) );
        };

        return Vector2D;
    }() );
}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/23 - 15:57
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

    var _abs = Math.abs,
        _min = Math.min,
        _max = Math.max,
        _round = Math.round,

        Sankaku = window.Sankaku;

    Sankaku.Triangle = ( function (){
        /**
         *
         * @class Triangle
         * @param {Object} a
         * @param {Object} b
         * @param {Object} c
         * @constructor
         */
        function Triangle ( a, b, c ) {
            this.a = a;
            this.b = b;
            this.c = c;

            var A = b.x - a.x,
                B = b.y - a.y,
                C = c.x - a.x,
                D = c.y - a.y,
                E = A * ( a.x + b.x ) + B * ( a.y + b.y ),
                F = C * ( a.x + c.x ) + D * ( a.y + c.y ),
                G = 2 * ( A * ( c.y - b.y ) - B * ( c.x - b.x ) ),
                minx, miny, dx, dy,
                x, y;

            // If the points of the triangle are collinear, then just find the
            // extremes and use the midpoint as the center of the circumcircle.
            if( _abs( G ) < 0.000001 ) {
                // under
                minx = _min( a.x, b.x, c.x );
                miny = _min( a.y, b.y, c.y );
                dx   = ( _max( a.x, b.x, c.x ) - minx ) * 0.5;
                dy   = ( _max( a.y, b.y, c.y ) - miny ) * 0.5;

                this.x = minx + dx;
                this.y = miny + dy;
                this.r = dx * dx + dy * dy;
            } else {
                // over
                x = ( D*E - B*F ) / G;
                y = ( A*F - C*E ) / G;
                dx = x - a.x;
                dy = y - a.y;

                this.x = x;
                this.y = y;
                this.r = dx * dx + dy * dy;
            }
        }

        var p = Triangle.prototype;

        p.constructor = Triangle;

        /**
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         */
        p.draw = function ( ctx ) {
            var a = this.a,
                b = this.b,
                c = this.c;

            ctx.beginPath();
            ctx.moveTo( a.x, a.y );
            ctx.lineTo( b.x, b.y );
            ctx.lineTo( c.x, c.y );
            ctx.closePath();
        };

        /**
         * @method centroid
         * @return {{x: number, y: number}}
         */
        p.centroid = function() {

            return (
            {
                x: _round( ( this.a.x + this.b.x + this.c.x ) / 3 ),
                y: _round( ( this.a.y + this.b.y + this.c.y ) / 3 )
            }
                );
        };

        return Triangle;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/23 - 15:55
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
        Triangle = Sankaku.Triangle;

    Sankaku.Delaunay = ( function (){
        /**
         * https://github.com/ironwallaby/delaunay
         *
         * @class Delaunay
         * @constructor
         */
        function Delaunay () {
            throw new Error( "Sankaku can't create instance." );
        }

        var s = Delaunay;
//
//        /**
//         * @method byX
//         * @static
//         * @param {object} a
//         * @param {object} b
//         * @return {number}
//         */
//        s.byX = function ( a, b ) {
//            return b.x - a.x;
//        };
//
//        /**
//         * @method dedup
//         * @static
//         * @param {Array} edges
//         */
//        s.dedup = function ( edges ) {
//            var j = edges.length,
//                a, b, i, m, n;
//
//            outer: while( j ) {
//                b = edges[ --j ];
//                a = edges[ --j ];
//                i = j;
//
//                while( i ) {
//                    n = edges[ --i ];
//                    m = edges[ --i ];
//
//                    if( ( a === m && b === n ) || ( a === n && b === m ) ) {
//
//                        edges.splice( j, 2 );
//                        edges.splice( i, 2 );
//                        j -= 2;
//
//                        continue outer;
//                    }// if
//                }// while i
//            }// while j
//        };

        /**
         * @method triangulate
         * @static
         * @param vertices
         * @return {Array}
         */
        s.triangulate = function ( vertices ) {
            // if there aren't enough vertices to form any triangles.
            if(vertices.length < 3) {
                return [];
            }

            var vertex,
                i,
                x_min, x_max,
                y_min, y_max,

                dx, dy,
                d_max,
                x_mid,
                y_mid,
                open,
                closed,
                close_i,
                edges,
                j, a, b,
                open_j;

            var byX = function ( a, b ) {
                return b.x - a.x;
            };

            var dedup = function ( edges ) {
                var j = edges.length,
                    a, b, i, m, n;

                outer: while( j ) {
                    b = edges[ --j ];
                    a = edges[ --j ];
                    i = j;

                    while( i ) {
                        n = edges[ --i ];
                        m = edges[ --i ];

                        if( ( a === m && b === n ) || ( a === n && b === m ) ) {

                            edges.splice( j, 2 );
                            edges.splice( i, 2 );
                            j -= 2;

                            continue outer;
                        }// if
                    }// while i
                }// while j
            };

            // Ensure the vertex array is in order of descending X coordinate
            // (which is needed to ensure a subquadratic runtime), and then find
            // the bounding box around the points.
            vertices.sort( byX );

            i = vertices.length - 1;
            vertex = vertices[ i ];

            x_min = vertex.x;
            x_max = vertices[ 0 ].x;
            y_min = vertex.y;
            y_max = y_min;

            while( i-- ) {
                if ( vertex.y < y_min) {

                    y_min = vertex.y;
                }
                if ( vertex.y > y_max ) {

                    y_max = vertex.y;
                }
            }

            // Find a super triangle, which is a triangle that surrounds all the vertices.
            // This is used like something of a sentinel value to remove
            // cases in the main algorithm, and is removed before we return any results.
            //
            // Once found, put it in the "open" list.
            // (The "open" list is for triangles who may still need to be considered; the "closed" list is for triangles which do not.)
            dx = x_max - x_min;
            dy = y_max - y_min;
            d_max = ( dx > dy ) ? dx : dy;
            x_mid = ( x_max + x_min ) * 0.5;
            y_mid = ( y_max + y_min ) * 0.5;
            open = [
                new Triangle(
                    { x: x_mid - 20 * d_max, y: y_mid -      d_max, __sentinel: true },
                    { x: x_mid             , y: y_mid + 20 * d_max, __sentinel: true },
                    { x: x_mid + 20 * d_max, y: y_mid -      d_max, __sentinel: true }
                )
            ];
            closed = [];
            edges = [];

            // Incrementally add each vertex to the mesh.
            i = vertices.length;

            // For each open triangle, check to see if the current point is
            // inside it's circumcircle. If it is, remove the triangle and add
            // it's edges to an edge list.
            while( i-- ) {

                edges.length = 0;

                j = open.length;

                vertex = vertices[ i ];

                while( j-- ) {

                    open_j = open[ j ];

                    // If this point is to the right of this triangle's circumcircle,
                    // then this triangle should never get checked again. Remove it
                    // from the open list, add it to the closed list, and skip.
                    dx = vertex.x - open_j.x;

                    if( dx > 0 && dx * dx > open_j.r ) {

                        closed.push( open_j );
                        open.splice( j, 1 );
                        continue;
                    }

                    // If not, skip this triangle.
                    dy = vertex.y - open_j.y;

                    if ( dx * dx + dy * dy > open_j.r ) {
                        // skip
                        continue;
                    }

                    // Remove the triangle and add it's edges to the edge list.
                    edges.push(
                        open_j.a, open_j.b,
                        open_j.b, open_j.c,
                        open_j.c, open_j.a
                    );

                    open.splice( j, 1 );
                }// while j

                // Remove any doubled edges.
                dedup( edges );

                // Add a new triangle for each edge.
                j = edges.length;

                while(j) {

                    b = edges[ --j ];
                    a = edges[ --j ];
                    open.push( new Triangle( a, b, vertex ) );
                }

            }// while i

            // Copy any remaining open triangles to the closed list, and then
            // remove any triangles that share a vertex with the super triangle.

            // http://qiita.com/kaz2ngt/items/6e08acc537fd77273cff
            // 配列の連結
            Array.prototype.push.apply( closed, open );

            i = closed.length;

            while( i-- ) {

                close_i = closed[ i ];

                if(
                    close_i.a.__sentinel ||
                    close_i.b.__sentinel ||
                    close_i.c.__sentinel ) {

                    closed.splice( i, 1 );
                }
            }// while

            return closed;
        };

        return Delaunay;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/25 - 11:19
 *
 * Copyright (c) 2011-2014 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * for display object
 */
( function ( window ){
    "use strict";
    var Sankaku = window.Sankaku,
        Vector2D = Sankaku.Vector2D,
        Num = Sankaku.Num,
        Iro = Sankaku.Iro;

    Sankaku.Object2D = ( function (){
        var _cos = Math.cos,
            _sin = Math.sin;

        /**
         * @class Object2D
         * @uses EventDispatcher
         * @constructor
         */
        function Object2D () {
            /**
             * @property _position
             * @type {Vector2D}
             * @default new Vector2D( 0, 0 )
             * @protected
             */
            this._position = new Vector2D();

            /**
             * @property x
             * @type {number}
             * @default 0
             */
            this.x = 0;
            /**
             * @property y
             * @type {number}
             * @default 0
             */
            this.y = 0;
            /**
             * radian
             * @property rotation
             * @type {number}
             * @default 0
             */
            this.rotation = 0;
            /**
             * @property width
             * @type {number}
             * @default 20
             */
            this.width = 20;
            /**
             * @property height
             * @type {number}
             * @default 10
             */
            this.height = 10;

            /**
             * @property scale
             * @type {number}
             * @default 1
             */
            this.scale = 1;

            /**
             * @property scene
             * @type {*|null|Scene|Object2D}
             */
            this.scene = null;
            /**
             * @property parent
             * @type {*}
             */
            this.parent = null;
            /**
             * @property children
             * @type {Array}
             */
            this.children = [];
            /**
             * @property visible
             * @type {boolean}
             */
            this.visible = true;
            /**
             * @property _alpha
             * @type {number}
             * @default 1
             * @protected
             */
            this._alpha = 1;
        }

        var p = Object2D.prototype;

        p.constructor = Object2D;

        // mixin EventDispatcher
        Sankaku.EventDispatcher.initialize( p );

        /**
         * @method clone
         * @return {Object2D}
         */
        p.clone = function () {
            return this._clone();
        };

        /**
         * @method _clone
         * @return {Object2D}
         * @protected
         */
        p._clone = function () {
            var clone = new Object2D();
            clone.setPosition( this._position.clone() );
            clone.width = this.width;
            clone.height = this.height;
            clone.rotation = this.rotation;
            clone.scale = this.scale;
            clone.parent = parent && parent.clone();

            clone._alpha = this._alpha;
            clone.visible = this.visible;
            clone.children = this.children.splice();
            clone.setColor( this._color );

            return clone;
        };

        /**
         * @method setColor
         * @param {String} hex
         * @return {Object2D}
         */
        p.setColor = function ( hex ) {
            this._color = hex;

            this._rgb = Iro.hex2rgb( hex );
            this._rgb.a = this._alpha;

            return this;
        };

        /**
         * @method setRGB
         * @param {Object} rgb
         * @return {Object2D}
         */
        p.setRGB = function ( rgb ) {
            var _rgba = this._rgb;
            _rgba.r= rgb.r;
            _rgba.g= rgb.g;
            _rgba.b= rgb.b;

            this._color = Iro.rgb2hex( rgb.r, rgb.g, rgb.b );

            return this;
        };

        /**
         * @method rgba
         * @return {Object|*|Object2D._rgb}
         */
        p.rgba = function () {
            return this._rgb;
        };

        /**
         * @method setAlpha
         * @param {Number} n 0 ~ 1
         * @return {Object2D}
         */
        p.setAlpha = function ( n ) {
            this._alpha = n;
            return this.setColor( this._color );
        };

        p.alpha = function () {
            return this._alpha;
        };

        /**
         * @method setPosition
         * @param {Vector2D} v
         * @return {Object2D}
         */
        p.setPosition = function ( v ) {
            this._position = v;
            this.x = v.x;
            this.y = v.y;

            return this;
        };

        /**
         * @method position
         * @return {Vector2D}
         */
        p.position = function () {
            return this._position;
        };

        /**
         * @method setX
         * @param {number} x
         * @return {Object2D}
         */
        p.setX = function ( x ) {
            this.x = x;
            this._position.x = x;

            return this;
        };

        /**
         * @method setY
         * @param {number} y
         * @return {Object2D}
         */
        p.setY = function ( y ) {
            this.y = y;
            this._position.y = y;

            return this;
        };

        /**
         * @method bounding
         * @return {Object} {a: {x: number, y: number}, b: {x: number, y: number}, c: {x: number, y: number}, d: {x: number, y: number}}
         */
        p.bounding = function () {
            var parent = this.parent,
                x = this.x,
                y = this.y,
                w1 = this.width * this.scale,
                h1 = this.height * this.scale,
                w2 = w1 * 0.5,
                h2 = h1 * 0.5,
                rotation = this.rotation,
                a, b, c, d, e,
                ax, ay,
                bx,
                cy,
                sin, cos,
                xd, yd,

                cos_ax,
                cos_ay,
                sin_ay,
                sin_ax,
                cos_bx,
                cos_cy,
                sin_bx,
                sin_cy,
                my_bounding,
                p_bounding;

            e = {
                scale: this.scale,
                rotation: this.rotation,
                alpha: this._alpha,
                visible: this.visible,
                x: this.x,
                y: this.y
            };

            if ( !!parent && this.scene !== parent ) {

                // not scene
                p_bounding = parent.bounding();

                e.visible = p_bounding.e.visible;

                if ( e.visible ) {
                    // parent is visible

//                x = x * parent.scale;
//                y = y * parent.scale;

                    x = x * p_bounding.e.scale;
                    y = y * p_bounding.e.scale;

//                w1 = this.width * parent.scale;
//                h1 = this.height * parent.scale;

                    w1 = this.width * p_bounding.e.scale;
                    h1 = this.height * p_bounding.e.scale;

                    w2 = w1 * 0.5;
                    h2 = h1 * 0.5;

//                rotation = parent.rotation + this.rotation;

                    rotation = p_bounding.e.rotation + this.rotation;

//                xd = parent.x + x * _cos( parent.rotation ) - y * _sin( parent.rotation );
//                yd = parent.y + x * _sin( parent.rotation ) + y * _cos( parent.rotation );

                    xd = parent.x + x * _cos( p_bounding.e.rotation ) - y * _sin( p_bounding.e.rotation );
                    yd = parent.y + x * _sin( p_bounding.e.rotation ) + y * _cos( p_bounding.e.rotation );

                    x = xd;
                    y = yd;

//                e.scale = parent.scale * this.scale;
//                e.alpha = parent.alpha() * this._alpha;
                    e.scale = p_bounding.e.scale * this.scale;
                    e.alpha = p_bounding.e.alpha * this._alpha;

                    e.rotation = rotation;
                }

            }

            sin = _sin( rotation );
            cos = _cos( rotation );

            //  a    b
            //  ------
            //  |    |
            //  |  e |
            //  |    |
            //  ------
            //  d    c

            ax = -w2;
            ay = -h2;
            bx = w2;
            cy = h2;

            cos_ax = cos * ax;
            cos_ay = cos * ay;
            sin_ay = sin * ay;
            sin_ax = sin * ax;
            cos_bx = cos * bx;
            cos_cy = cos * cy;
            sin_bx = sin * bx;
            sin_cy = sin * cy;

            a = { x: cos_ax - sin_ay + x, y: cos_ay + sin_ax + y };
            b = { x: cos_bx - sin_ay + x, y: cos_ay + sin_bx + y };
            c = { x: cos_bx - sin_cy + x, y: cos_cy + sin_bx + y };
            d = { x: cos_ax - sin_cy + x, y: cos_cy + sin_ax + y };

            e.x = x;
            e.y = y;

            my_bounding = { a: a, b: b, c: c, d:d, e: e };
            this._bounding = my_bounding;

            return my_bounding;
        };

        /**
         * 角度を degree を元に radian 設定します
         * @method setRotate
         * @param {number} degree 0 ~ 360
         * @return {Object2D}
         */
        p.setRotate = function ( degree ) {
            this.rotation = Num.deg2rad( degree );

            return this;
        };

        /**
         * @method add
         * @param {Object2D} target
         * @return {*|Object2D}
         */
        p.add = function ( target ) {

            if ( target === this ) {

                return this;
            }

            if ( !!target.parent ) {

                target.parent.remove( target );
            }

            target.parent = this;
            this.children.push( target );

            // find scene and target add to scene
            var scene = this.scene;

            if ( !!scene ) {

                scene.addChild( target );
            }

            return this;
        };
        /**
         * @method remove
         * @param {*|Object2D} target
         * @return {Object2D}
         */
        p.remove = function ( target ) {
            var index, scene;

            index = this.children.indexOf( target );

            if ( index === -1 ) {

                return this;
            }

            target.parent = null;
            this.children.splice( index, 1 );

            // remove from scene
            scene = this.scene;

            if ( !!scene ) {

                scene.removeChild( target );
            }

            return this;
        };

        /**
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         * @return {Object2D}
         */
        p.draw = function ( ctx ) {

            if ( this.visible && this._alpha > 0 && this.scale > 0 ) {
                // visible true && alpha not 0 && scale not 0
                this.beginDraw( ctx );
                this._draw( ctx );
                this.exitDraw( ctx );
            }

            var children = this.children,
                i, limit;

            for ( i = 0, limit = children.length; i < limit; i++ ) {

                children[ i ].draw( ctx );
            }

            return this;
        };
        /**
         * @method _draw
         * @param {CanvasRenderingContext2D} ctx
         * @protected
         */
        p._draw = function ( ctx ) {

        };

        /**
         * @method beginDraw
         * @param {CanvasRenderingContext2D} ctx
         */
        p.beginDraw = function ( ctx ) {

        };

        /**
         * @method exitDraw
         * @param {CanvasRenderingContext2D} ctx
         */
        p.exitDraw = function ( ctx ) {

        };

        // http://www.emanueleferonato.com/2012/03/09/algorithm-to-determine-if-a-point-is-inside-a-square-with-mathematics-no-hit-test-involved/
        /**
         * point が bounding box 内か外かを調べます
         * @method inside
         * @param {Vector2D} v 調べるpoint
         * @param {Array} 結果を格納する
         * @return {Array} inside の時は contains へthisを格納し返します
         */
        p.inside = function ( v, contains ) {
            if ( this.visible ) {
                // visible true && alpha not 0
                contains = this._inside( v, contains );
            }

            var children = this.children,
                i, limit;

            for ( i = 0, limit = children.length; i < limit; i++ ) {

                contains = children[ i ].inside( v, contains );
            }

            return contains;
        };

        /**
         * @method _area
         * @param {Object|Vector2D} A
         * @param {Object|Vector2D} B
         * @param {Object|Vector2D} C
         * @return {number}
         * @protected
         */
        p._area = function ( A, B, C ) {
            return ( C.x * B.y - B.x * C.y ) - ( C.x * A.y - A.x * C.y ) + ( B.x * A.y - A.x * B.y );
        };

        /**
         * @method _inside
         * @param {Vector2D} v
         * @param {Array} contains
         * @return {Array}
         * @protected
         */
        p._inside = function ( v, contains ) {
            var bounding = this.bounding();

            if (
                    this._area( bounding.a, bounding.b, v ) > 0 ||
                    this._area( bounding.b, bounding.c, v ) > 0 ||
                    this._area( bounding.c, bounding.d, v ) > 0 ||
                    this._area( bounding.d, bounding.a, v ) > 0
                ) {
                // outside
                return contains;
            } else {

                contains.push( this );
            }
            // inside
            return contains;
        };

        // children index change
        /**
         * @method swap
         * @param {Object2D} o1 置き換え先
         * @param {Object2D} o2 対象ターゲット
         * @return {Object2D}
         */
        p.swap = function ( o1, o2 ) {
            var children = this.children,
                index1 = children.indexOf( o1 ),
                index2 = children.indexOf( o2 );

            if ( index1 !== -1 && index2 !== -1 ) {
                children[ index2 ] = o1;
                children[ index1 ] = o2;
            }

            return this;
        };

        /**
         * @method highest
         * @param {Object2D} o ターゲットオブジェクト
         * @return {Object2D}
         */
        p.highest = function ( o ) {
            var children = this.children,
                index = children.indexOf( o );

            if ( index !== -1 ) {

                children.splice( index, 1 );
                children.push( o );
            }

            return this;
        };

        /**
         * @method render
         * @return {Object2D}
         * @param {number} w canvas width
         */
        p.render = function ( w, h ) {
            this.beginRender( w, h );

            var children = this.children,
                i, limit;

            for ( i = 0, limit = children.length; i < limit; i++ ) {

                children[ i ].render( w, h );
            }

            return this;
        };

        /**
         * prepare render
         * @method beginRender
         * @param {number} w canvas width
         * @param {number} h canvas height
         */
        p.beginRender = function ( w, h ) {
            this.prepareRender( w, h );
        };

        /**
         * @method prepareRender
         * @param {number} w canvas width
         * @param {number} h canvas height
         */
        p.prepareRender = function ( w, h ) {

        };

        /**
         * @method _rgba
         * @param {Object} rgb { r: number, g: number, b: number}
         * @param {Number} alpha
         * @return {{r: *, g: *, b: *, a: number}}
         * @protected
         */
        p._rgba = function ( rgb, alpha ) {
            var _rgb = rgb;

            return {
                r: _rgb.r,
                g: _rgb.g,
                b: _rgb.b,
                a: _rgb.a * alpha
            };
        };

        return Object2D;
    }() );

}( window ) );
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

        p.constructor = Scene;

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
         * @param {Array} contains 結果を格納する配列
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
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/25 - 12:19
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
        Object2D = Sankaku.Object2D,
        Vector2D = Sankaku.Vector2D,
        Iro = Sankaku.Iro
    ;

    Sankaku.Shape = ( function (){

        /**
         * @class Shape
         * @extends Object2D
         * @param {number} x
         * @param {number} y
         * @param {number=20} [width]
         * @param {number=10} [height]
         * @param {String} [color] default #000000
         * @param {string=stroke} [fill] fill or stroke or both, Shape.FILL, Shape.STROKE, Shape.BOTH
         * @constructor
         */
        function Shape ( x, y, width, height, color, fill ) {
            Object2D.call( this );

            this.setX( x );
            this.setY( y );

            this.width = width || 20;
            this.height = height || 10;

            /**
             * @property _fill
             * @type {string}
             * @default Shape.STROKE
             * @protected
             */
            this._fill = fill || Shape.STROKE;

            /**
             * @property _line
             * @type {number}
             * @default 1
             * @protected
             */
            this._line = 1;

            /**
             * @property _rgb
             * @type {{r: number, g: number, b: number}}
             * @protected
             */
            this._rgb = {
                r: 0,
                g: 0,
                b: 0
            };

            color = color || "#000000";
            /**
             * @property _color
             * @type {String}
             * @default #000000
             * @protected
             */
            this._color = color;
            this.setColor( color );

            this.setBorder( this.setLine, this._color );
        }

        Sankaku.extend( Object2D, Shape );

        /**
         * @const FILL
         * @static
         * @type {string}
         */
        Shape.FILL = "shape_fill";
        /**
         * @const STROKE
         * @static
         * @type {string}
         */
        Shape.STROKE = "shape_stroke";
        /**
         * @const BOTH
         * @static
         * @type {string}
         */
        Shape.BOTH = "shape_both";

        var p = Shape.prototype;

        p.constructor = Shape;

        /**
         * @method clone
         * @return {Shape}
         */
        p.clone = function () {
            var clone = new Shape( this.x, this.y, this.width, this.height, this._color, this._fill );

//            clone.setPosition( this._position.clone() );
//            clone.width = this.width;
//            clone.height = this.height;
            clone.rotation = this.rotation;
            clone.scale = this.scale;
            clone._alpha = this._alpha;
            clone._rgb = Object.create( this._rgb );

            clone._line = this._line;
            clone._border = {
                setLine: this._border.setLine,
                rgb: this._border.rgb
            };

            return clone;
        };

        /**
         * @method radius
         * @return {number}
         */
        p.radius = function () {
            var bounding = this.bounding(),
                a = bounding.a,
                c = bounding.c;

            return new Vector2D( a.x, a.y ).distance( new Vector2D( c.x, c.y ) ) * 0.5;
        };

        /**
         * @method setBorder
         * @param {number} line
         * @param {string} color hex
         * @return {Shape}
         */
        p.setBorder = function ( line, color ) {
            var rgb = Iro.hex2rgb( color );
            rgb.a = this._alpha;

            this._border = {
                setLine: line,
                rgb: rgb
            };

            return this;
        };

        /**
         * @method setMode
         * @param {string} fill
         * @return {Shape}
         */
        p.setMode = function ( fill ) {
            this._fill = fill;
            return this;
        };
        /**
         * @method mode
         * @return {boolean}
         */
        p.mode = function () {
            return this._fill;
        };

        /**
         * @method setLine
         * @param {number} n
         * @return {Shape}
         */
        p.setLine = function ( n ) {
            this._line = n;
            return this;
        };

        /**
         * @method line
         * @return {number}
         */
        p.line = function () {
            return this._line;
        };

        /**
         * @method _draw
         * @protected
         * @param {CanvasRenderingContext2D} ctx
         */
        p._draw = function ( ctx ) {
            var bounding = this.paint( ctx ),
                rgba,
                border_rgba;

            if ( !bounding.e.visible ) {
                // parent is invisible
                return;
            }

            rgba = this._rgba( this._rgb, bounding.e.alpha );

            switch ( this._fill ) {

                case Shape.STROKE:
                    this.stroke( ctx, this._line, rgba );
                    break;

                case Shape.FILL:
                    this.fill( ctx, rgba );
                    break;

                case Shape.BOTH:
                    border_rgba = this._rgba( this._border._rgb, bounding.e.alpha );
                    this.stroke( ctx, this._border._line, border_rgba );
                    this.fill( ctx, rgba );
                    break;
            }
        };

        /**
         * @method fill
         * @param {CanvasRenderingContext2D} ctx
         * @param {object} color
         */
        p.fill = function ( ctx, color ) {
            ctx.fillStyle = "rgba(" + color.r +","+color.g+","+color.b+","+color.a+")";

//            this.paint( ctx );

            ctx.fill();
        };

        /**
         * @method stroke
         * @param {CanvasRenderingContext2D} ctx
         * @param {number} line
         * @param {object} color
         */
        p.stroke = function ( ctx, line, color ) {
            ctx.lineWidth = line;
            ctx.strokeStyle = "rgba(" + color.r +","+color.g+","+color.b+","+color.a+")";

//            this.paint( ctx );

            ctx.stroke();
        };

        /**
         * @method paint
         * @param {CanvasRenderingContext2D} ctx
         * @return {Object} bounding
         */
        p.paint = function ( ctx ) {
            var bounding = this.bounding(),
                a = bounding.a,
                b = bounding.b,
                c = bounding.c,
                d = bounding.d;
//            console.log( "paint ", bounding.e.visible, this.parent );
            if ( bounding.e.visible ) {
                // parent is visible
                ctx.beginPath();

                // rect
                ctx.moveTo( a.x, a.y );
                ctx.lineTo( b.x, b.y );
                ctx.lineTo( c.x, c.y );
                ctx.lineTo( d.x, d.y );
                ctx.lineTo( a.x, a.y );

                ctx.closePath();
            }

            return bounding;
        };

        return Shape;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/25 - 16:22
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
        Vector2D = Sankaku.Vector2D;

    Sankaku.Circle = ( function (){
        var PI2 = Math.PI * 2,
            _sin = Math.sin,
            _cos = Math.cos,
            _pow = Math.pow;

        /**
         * @class Circle
         * @extends Shape
         * @param {number} x
         * @param {number} y
         * @param {number=20} [radius]
         * @param {string} [color] default #000000
         * @param {string=stroke} [fill] fill or stroke or both, Shape.FILL, Shape.STROKE, Shape.BOTH
         * @constructor
         */
        function Circle ( x, y, radius, color, fill ) {
            Shape.call( this, x, y, radius * 2, radius * 2, color, fill );

            this._radius = radius || this.width;
        }

        Sankaku.extend( Shape, Circle );

        var p = Circle.prototype;

        p.constructor = Circle;

        /**
         * @method getRadius
         * @return {number}
         */
        p.radius = function () {
            return this._radius * this.scale;
        };

        /**
         * @method clone
         * @return {Circle}
         */
        p.clone = function () {

            var clone =  new Circle( this.x, this.y, this._radius, this._color, this._fill );

            clone.rotation = this.rotation;
            clone.scale = this.scale;
            clone._alpha = this._alpha;
            clone._rgb = Object.create( this._rgb );

            clone._line = this._line;
            clone._border = {
                line: this._border.line,
                rgb: this._border.rgb
            };

            return clone;
        };

        /**
         * @method paint
         * @param {CanvasRenderingContext2D} ctx
         * @return {Object} bounding
         */
        p.paint = function ( ctx ) {
            var bounding = this.bounding(),
                e = bounding.e;

            if ( e.visible ) {

                ctx.beginPath();

                ctx.arc( e.x, e.y, this._radius * e.scale, 0, PI2, false );

                ctx.closePath();
            }

            return bounding;
        };

        /**
         * @method _inside
         * @param {Vector2D} v
         * @param {Array} contains
         * @return {Array}
         * @protected
         */
        p._inside = function ( v, contains ) {
            var r = this._radius;

            if ( _pow( this.x - v.x, 2 ) + _pow( this.y - v.y, 2 ) < r * r ) {
                // inside
                contains.push( this );
            }

            return contains;
        };

        /**
         * @method contain
         * @param {Vector2D} v
         * @return {boolean}
         */
        p.contain = function ( v ) {
            var results = [];

            this._inside( v, results );

            return results.length > 0;
        };

        /**
         * @method intersect
         * @param {Line} o
         * @return {boolean}
         */
        p.intersect = function ( o ) {
            var segment = o.segment(),
                v1 = segment.start,
                v2 = segment.end,
                v1_e, v2_e,
                v1_v, v2_v,
                radius,
                bounding,
                e,
                AB, BC, AC, BD,
                x_min, x_max, y_min, y_max,
                center;

            v1_e = v1.bounding().e;
            v2_e = v2.bounding().e;
            v1_v = new Vector2D( v1_e.x, v1_e.y );
            v2_v = new Vector2D( v2_e.x, v2_e.y );

            // check point inside
            if ( this.contain( v1_v ) ) {

                return true;
            }
            // check point inside
            if ( this.contain( v2_v ) ) {

                return true;
            }

            radius = this.radius();
            bounding = this.bounding();
            e = bounding.e;

            x_min = e.x - radius;
            x_max = e.x + radius;
            y_min = e.y - radius;
            y_max = e.y + radius;

            // x check
            if ( ( v1_e.x < x_min  && v2_e.x < x_min ) || ( v1_e.x > x_max && v2_e.x > x_max ) ) {
                // outside x
                return false;
            }

            // y check
            if ( ( v1_e.y < y_min && v2_e.y < y_min ) || ( v1_e.y > y_max && v2_e.y > y_max ) ) {
                // outside y
                return false;
            }

            // contain check
            center = new Vector2D( e.x, e.y );

            AB = v1_v.distance( center );
            BC = v2_v.distance( center );
            AC = v1_v.distance( v2_v );
            BD = Math.sqrt( ( ( AC+BC+AB )*( AC-BC+AB )*( -AC+BC+AB )*( AC+BC-AB ) ) / ( 4*AC*AC ) );

//            if ( BD <= radius ) {
//                // contain
//                return true;
//            }
//
//            return false;

            return BD <= radius;
        };

        return Circle;
    }() );
}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/07/04 - 16:54
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
        Shape = Sankaku.Shape
        ;

    Sankaku.Tripod = ( function (){

        /**
         * @class Tripod
         * @extends Object2D
         * @param {number} x
         * @param {number} y
         * @param {number=20} [width]
         * @param {number=10} [height]
         * @param {String} [color] default #000000
         * @param {string=stroke} [fill] fill or stroke or both, Shape.FILL, Shape.STROKE, Shape.BOTH
         * @constructor
         */
        function Tripod ( x, y, width, height, color, fill ) {
            Shape.call( this, x, y, width, height, color, fill );
        }

        Sankaku.extend( Shape, Tripod );

        var p = Tripod.prototype;

        p.constructor = Tripod;

        /**
         * @method clone
         * @return {Tripod}
         */
        p.clone = function () {
            var clone = new Tripod( this.x, this.y, this.width, this.height, this._color, this._fill );

            clone.rotation = this.rotation;
            clone.scale = this.scale;
            clone._alpha = this._alpha;
            clone._rgb = Object.create( this._rgb );

            clone._line = this._line;
            clone._border = {
                line: this._border.line,
                rgb: this._border.rgb
            };

            return clone;
        };

        /**
         * @method paint
         * @param {CanvasRenderingContext2D} ctx
         * @return {Object} bounding
         */
        p.paint = function ( ctx ) {
            var bounding = this.bounding(),
                a = bounding.a,
                b = bounding.b,
                c = bounding.c,
                d = bounding.d;

            if ( bounding.e.visible ) {
                ctx.beginPath();

                // triangle
                ctx.moveTo( a.x, a.y );
//            ctx.lineTo( b.x, b.y + ( (c.y - b.y) * 0.5 ) );
                ctx.lineTo( ( b.x + c.x ) * 0.5, ( b.y + c.y ) * 0.5 );
                ctx.lineTo( d.x, d.y );
                ctx.lineTo( a.x, a.y );

                ctx.closePath();
            }

            return bounding;
        };

        /**
         * @method _inside
         * @param {Vector2D} v
         * @param {Array} contains
         * @return {Array}
         * @protected
         */
        p._inside = function ( v, contains ) {
            var bounding = this.bounding(),
                b = bounding.b,
                c = bounding.c,
                p = {
                    x: ( b.x + c.x ) * 0.5,
                    y: ( b.y + c.y ) * 0.5
                };

            if (
                this._area( bounding.a, p, v ) > 0 ||
                this._area( p, bounding.d, v ) > 0 ||
                this._area( bounding.d, bounding.a, v ) > 0
                ) {
                // outside
                return contains;
            } else {

                contains.push( this );
            }
            // inside
            return contains;
        };

        return Tripod;
    }() );
}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/07/05 - 17:00
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
        Num = Sankaku.Num;

    Sankaku.Star = ( function (){
        var _sin = Math.sin,
            _cos = Math.cos;

        /**
         * @class Star
         * @extends Shape
         * @param {number} x
         * @param {number} y
         * @param {number=20} [radius]
         * @param {string} [color] default #000000
         * @param {string=stroke} [fill] fill or stroke or both, Shape.FILL, Shape.STROKE, Shape.BOTH
         * @param {int=5} [points]
         * @param {int} [inner]
         * @default radius * 0.475
         * @constructor
         */
        function Star ( x, y, radius, color, fill, points, inner ) {
            Shape.call( this, x, y, radius, radius, color, fill );

            this._radius = radius || this.width;
            this._points = points || 5;
            this._inner = inner || radius * 0.475;
        }

        Sankaku.extend( Shape, Star );

        var p = Star.prototype;

        p.constructor = Star;

        /**
         * @method getRadius
         * @return {number}
         */
        p.radius = function () {
            return this._radius;
        };

        /**
         * @method clone
         * @return {Star}
         */
        p.clone = function () {
            var clone =  new Star( this.x, this.y, this._radius, this._color, this._fill, this._points );

            clone.rotation = this.rotation;
            clone.scale = this.scale;
            clone._alpha = this._alpha;
            clone._rgb = Object.create( this._rgb );

            clone._line = this._line;
            clone._border = {
                line: this._border.line,
                rgb: this._border.rgb
            };

            return clone;
        };

        //http://www.fascinatedwithsoftware.com/blog/post/2012/11/03/How-to-Draw-a-Star-with-HTML5.aspx
        /**
         * @method paint
         * @param {CanvasRenderingContext2D} ctx
         * @return {Object} bounding
         */
        p.paint = function ( ctx ) {
            var bounding = this.bounding(),
                e = bounding.e,
                points,
                limit,
                step,
                ninety,
                scale,
                outer,
                inner,
                x,
                y,
                rotation,
                i, angle, r;

            if ( e.visible ) {

                points = this._points;
                limit = points * 2;
                step = Num.ONE_EIGHTY / points;
                ninety = Num.NINETY;
                scale = e.scale;
                outer = this._radius * scale;
                inner = this._inner * scale;
                x = e.x;
                y = e.y;
                rotation = e.rotation;

                ctx.beginPath();

                for ( i = 0; i <= limit; ++ i ) {

                    angle = i * step - ninety + rotation;
                    r = i % 2 ? inner : outer;

                    ctx.lineTo( x + r * _cos( angle ), y + r * _sin( angle ) );
                }

                ctx.closePath();
            }

            return bounding;
        };

        return Star;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/07/16 - 12:44
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
        Object2D = Sankaku.Object2D,
        Shape = Sankaku.Shape,
        Vector2D = Sankaku.Vector2D;

    Sankaku.Line = ( function (){
        /**
         * @class Line
         * @extends Object2D
         * @param {Object2D} v1
         * @param {Object2D} v2
         * @param {string} [color] hex, default #000000
         * @default #000000
         * @param {Number=1} [line] line width
         * @constructor
         */
        function Line ( v1, v2, color, line ) {
            Object2D.call( this );

            /**
             * @property _v1
             * @type {Object2D}
             * @protected
             */
            this._v1 = v1;
            /**
             * @property _v2
             * @type {Object2D}
             * @protected
             */
            this._v2 = v2;

            /**
             * @property _fill
             * @type {string}
             * @default Shape.STROKE
             * @protected
             */
            this._fill = Shape.STROKE;

            line = line || 1;
            /**
             * @property _line
             * @type {number}
             * @default 1
             * @protected
             */
            this._line = line;

            /**
             * @property _rgb
             * @type {{r: number, g: number, b: number}}
             * @protected
             */
            this._rgb = {
                r: 0,
                g: 0,
                b: 0
            };

            color = color || "#000000";
            /**
             * @property _color
             * @type {String}
             * @default #000000
             * @protected
             */
            this._color = color;
            this.setColor( color );
        }

        Sankaku.extend( Object2D, Line );

        var p = Line.prototype;

        p.constructor = Line;

        /**
         * @method _clone
         * @return {Line}
         * @protected
         */
        p._clone = function () {
            var clone = new Line( this._v1, this._v2, this._color, this._line );
            clone.setAlpha( this._alpha );
            clone.scale = this.scale;
            clone.visible = this.visible;
            clone.setColor( this._color );

            return clone;
        };

        /**
         * @method segment
         * @return {{start: *|Vector2D, end: |Vector2D}}
         */
        p.segment = function () {
            return {
                start: this._v1,
                end: this._v2
            };
        };

        /**
         * not use
         * @method setPosition
         * @param {Vector2D} v
         * @return {Object2D}
         */
        p.setPosition = function ( v ) {
            // empty

            return this;
        };
        /**
         * @method setX
         * @param {number} x
         * @return {Object2D}
         */
        p.setX = function ( x ) {
            // empty

            return this;
        };
        /**
         * not use
         * @method setY
         * @param {number} y
         * @return {Object2D}
         */
        p.setY = function ( y ) {
            // empty

            return this;
        };
        /**
         * not use
         * @method setRotate
         * @param {number} degree 0 ~ 360
         * @return {Object2D}
         */
        p.setRotate = function ( degree ) {
            // empty

            return this;
        };
        /**
         * not use
         * @method add
         * @param {Object2D} target
         * @return {*|Object2D}
         */
        p.add = function ( target ) {
            // empty
            return this;
        };
        /**
         * not use
         * @method remove
         * @param {*|Object2D} target
         * @return {Object2D}
         */
        p.remove = function () {
            // empty
            return this;
        };

        // ////////////////////////////////////////////////////////////////
        // override
        /**
         * @method bounding
         */
        p.bounding = function () {
            var parent = this.parent,
                my_bounding,
                e;

            e = {
                scale: this.scale,
                rotation: this.rotation,
                alpha: this._alpha,
                x: this.x,
                y: this.y
            };

            if ( !!parent && this.scene !== parent ) {

                e.scale = parent.scale * this.scale;
                e.alpha = parent.alpha() * this._alpha;
            }

            my_bounding = { e: e, a: this._v1.bounding().e, b: this._v2.bounding().e };
            this._bounding = my_bounding;

            return my_bounding;
        };

        /**
         * @method _inside
         * @param {Vector2D} v
         * @param {Array} contains
         * @return {Array}
         * @protected
         */
        p._inside = function ( v, contains ) {

//            var bounding = this.bounding();
//
//            if (
//                this._area( bounding.a, bounding.b, v ) > 0 ||
//                this._area( bounding.b, bounding.c, v ) > 0 ||
//                this._area( bounding.c, bounding.d, v ) > 0 ||
//                this._area( bounding.d, bounding.a, v ) > 0
//                ) {
//                // outside
//                return contains;
//            } else {
//
//                contains.push( this );
//            }
            // inside
            return contains;
        };

        /**
         * @method _draw
         * @param {CanvasRenderingContext2D} ctx
         * @protected
         */
        p._draw = function ( ctx ) {
            var bounding = this.paint( ctx ),
                rgba = this._rgba( this._rgb, bounding.e.alpha );

            this.stroke( ctx, this._line, rgba );
        };

        /**
         * @method stroke
         * @param {CanvasRenderingContext2D} ctx
         * @param {number} line
         * @param {object} color
         */
        p.stroke = function ( ctx, line, color ) {
            ctx.lineWidth = line;
            ctx.strokeStyle = "rgba(" + color.r +","+color.g+","+color.b+","+color.a+")";

            ctx.stroke();
        };

        /**
         * @method paint
         * @param {CanvasRenderingContext2D} ctx
         * @return {Object} bounding
         */
        p.paint = function ( ctx ) {
            var v1 = this._v1,
                v1_bounding = v1.bounding(),
                v1_e = v1_bounding.e,
                v2 = this._v2,
                v2_bounding = v2.bounding(),
                v2_e = v2_bounding.e,
                bounding = this.bounding();

            ctx.beginPath();

            // line, v1 to v2
            ctx.lineTo( v1_e.x, v1_e.y );
            ctx.lineTo( v2_e.x, v2_e.y );

            ctx.closePath();

            return bounding;
        };

        return Line;
    }() );
}( window ) );
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
                clone_img;

            if ( img.constructor === Sankaku.LoadImage ) {

                clone_img = img.clone();
            } else {

                clone_img = new Image();
                clone_img.src = img.src;
            }

            return new Bitmap( this.x, this.y, this.width, this.height, clone_img );
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

            var bounding = this.bounding();

            if ( bounding.e.visible ) {
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

            if ( alpha < 1 ||  rotation !== 0 ) {

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

            }

            ctx.drawImage( bitmap, 0, 0, bitmap.width, bitmap.height, x, y, w, h );

            if ( is_save ) {
                ctx.restore();
            }
        };

        return Bitmap;
    }() );
}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/22 - 21:01
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
        Vector2D = Sankaku.Vector2D,
        Object2D = Sankaku.Object2D,
        Tripod = Sankaku.Tripod;

    Sankaku.Vehicle = ( function (){
        var _abs = Math.abs;

        /**
         * @class Vehicle
         * @extends Object2D
         * @uses EventDispatcher
         * @param {Object2D} [viewModel]
         * @constructor
         */
        function Vehicle ( viewModel ) {
            Object2D.call( this );

            /**
             * @property _velocity
             * @type {Vector2D}
             * @default new Vector2D( 0, 0 )
             * @protected
             */
            this._velocity = new Vector2D();

            /**
             * @property _mass
             * @type {number}
             * @default 1.0
             * @protected
             */
            this._mass = 1.0;
            /**
             * @property _speed
             * @type {number}
             * @default 10
             * @protected
             */
            this._speed = 10;
            /**
             * @property _behavior
             * @type {string}
             * @default Vehicle.BOUNCE
             * @protected
             */
            this._behavior = Vehicle.BOUNCE;

            /**
             * setPadding left
             * @property left
             * @type {number}
             */
            this.left = 0;
            /**
             * setPadding top
             * @property top
             * @type {number}
             */
            this.top = 0;
            /**
             * setPadding right
             * @property right
             * @type {number}
             */
            this.right = 0;
            /**
             * setPadding bottom
             * @property bottom
             * @type {number}
             */
            this.bottom = 0;

            // 描画形状
            this.setView( viewModel || new Tripod( this.x, this.y, this.width, this.height ) );
        }

        Sankaku.extend( Object2D, Vehicle );

        /**
         * @const WRAP
         * @static
         * @type {string}
         */
        Vehicle.WRAP = "vehicle_wrap";
        /**
         * @const BOUNCE
         * @static
         * @type {string}
         */
        Vehicle.BOUNCE = "vehicle_bounce";

        var p = Vehicle.prototype;

        p.constructor = Vehicle;

        Sankaku.EventDispatcher.initialize( p );

        /**
         * @method setView
         * @param {*|Object2D|Shape} view
         */
        p.setView = function ( view ) {

            view.setPosition( this._position );

//            setView.width = this.width;
//            setView.height = this.height;
//            setView.rotation = this.rotation;
//            setView.scale = this.scale;
            // copy from setView
            this.width = view.width;
            this.height = view.height;
            this.rotation = view.rotation;

            // copy to setView
            view.scale = this.scale;

//            setView._velocity = this._velocity;
//            setView._mass = this._mass;
//            setView._speed = this._speed;
//            setView._behavior = this._behavior;

            this._view = view;
        };

        /**
         * @method view
         * @return {*|Object2D|Shape}
         */
        p.view = function () {
            return this._view;
        };


        /**
         * @method clone
         * @return {Object2D}
         */
        p.clone = function () {
            var clone = new Vehicle( this._view.clone() );

            // object 2D
            clone.setPosition( this._position.clone() );
            clone.width = this.width;
            clone.height = this.height;
            clone.rotation = this.rotation;
            clone.scale = this.scale;

            clone._velocity = this._velocity.clone();
            clone._mass = this._mass;
            clone._speed = this._speed;
            clone._behavior = this._behavior;

            return clone;
        };

        /**
         * @method setPadding
         * @param {number} top
         * @param {number} [right]
         * @param {number} [bottom]
         * @param {number} [left]
         * @return {Vehicle}
         */
        p.setPadding = function ( top, right, bottom, left ) {
            right = right || top;
            bottom = bottom || top;
            left = left || top;

            this.top = top;
            this.right = right;
            this.bottom = bottom;
            this.left = left;

            return this;
        };

        /**
         * 質量を設定します
         * @method setMass
         * @param {number} n
         * @return {Vehicle}
         */
        p.setMass = function ( n ) {
            this._mass = n;
            return this;
        };

        /**
         * @method mass
         * @return {number}
         */
        p.mass = function () {
            return this._mass;
        };

        /**
         * 最大スピードを設定します
         * @method setSpeed
         * @param {number} n
         * @return {Vehicle}
         */
        p.setSpeed = function ( n ) {
            this._speed = n;
            return this;
        };

        /**
         * @method speed
         * @return {number}
         */
        p.speed = function () {
            return this._speed;
        };

        /**
         * @method setBehavior
         * @param {string} str
         * @return {Vehicle}
         */
        p.setBehavior = function ( str ) {
            this._behavior = str;
            return this;
        };

        /**
         * @method behavior
         * @return {string}
         */
        p.behavior = function () {
            return this._behavior;
        };

        /**
         * @method setVelocity
         * @param {Vector2D} v
         * @return {Vehicle}
         */
        p.setVelocity = function ( v ) {
            this._velocity = v;
            return this;
        };

        /**
         * @method getVelocity
         * @return {Vector2D}
         */
        p.velocity = function () {
            return this._velocity;
        };

        /**
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         */
        p.draw = function ( ctx ) {

            if ( this.visible && this._alpha > 0 ) {
                this._view.draw( ctx );
            }
        };

        /**
         * @method update
         * @param {number} w
         * @param {number} h
         */
        p.update = function ( w, h ) {
            this._update( w, h );
        };

        /**
         * @method _update
         * @param {number} w canvas width
         * @param {number} h canvas height
         * @protected
         */
        p._update = function ( w, h ) {
            var velocity = this._velocity,
                position = this._position,
                view = this._view;

            w -= this.right;
            h -= this.bottom;

            velocity.truncate( _abs( this._speed ) );
            position.add( velocity );

            switch ( this._behavior ) {

                case Vehicle.WRAP:
                    this.wrap( w, h );
                    break;

                default :
                    this.bounce( w, h );
                    break;
            }

            this.x = position.x;
            this.y = position.y;
            this.rotation = velocity.angle();

            view.x = position.x;
            view.y = position.y;
            view.rotation = velocity.angle();
            view.width = this.width;
            view.height = this.height;
        };

        /**
         * @method wrap
         * @param {number} w
         * @param {number} h
         */
        p.wrap = function ( w, h ) {
            var position = this._position,
                is = false,
                left = this.left,
                top = this.top;

            if ( position.x > w ) {

                position.x = left;
                is = true;
            }
            if ( position.x < left ) {

                position.x = w;
                is = true;
            }

            if ( position.y > h ) {

                position.y = top;
                is = true;
            }
            if ( position.y < top ) {

                position.y = h;
                is = true;
            }

            if ( is ) {
                // wrap event
                this.dispatchEvent( { type: "wrap", currentTarget: this } );
            }
        };

        /**
         * @method bounce
         * @param {number} w
         * @param {number} h
         */
        p.bounce = function ( w, h ) {
            var velocity = this._velocity,
                position = this._position,
                is = false,
                left = this.left,
                top = this.top;

            if ( position.x > w ) {

                position.x = w;
                velocity.x *= -1;
                is = true;
            } else if ( position.x < left ) {

                position.x = left;
                velocity.x *= -1;
                is = true;
            }

            if ( position.y > h ) {

                position.y = h;
                velocity.y *= -1;
                is = true;
            } else if ( position.y < top ) {

                position.y = top;
                velocity.y *= -1;
                is = true;
            }

            if ( is ) {
                // bounce event
                this.dispatchEvent( { type: "bounce", currentTarget: this } );
            }
        };

        /**
         * prepare render
         * @method beginRender
         * @param {number} w canvas width
         * @param {number} h canvas height
         */
        p.beginRender = function ( w, h ) {
            this.prepareRender();

            this.update( w, h );
        };

        return Vehicle;
    }() );
}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/23 - 21:19
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
        Vehicle = Sankaku.Vehicle,
        Vector2D = Sankaku.Vector2D
    ;

    Sankaku.SteeredVehicle = ( function (){
        var PI_05 = Math.PI * 0.5;

        /**
         * @class SteeredVehicle
         * @extends Vehicle
         * @param {Object2D} [viewModel]
         * @constructor
         */
        function SteeredVehicle ( viewModel ) {
            Vehicle.call( this, viewModel );

            this._force = new Vector2D();
            // setMax setForce
            this._force_max = 1.0;
            this._force_arrival = 100;

            // for avoid
            this._avoid_distance = 300;
            this._avoid_buffer = 20;
            this._avoid_insight = 200;
            this._avoid_close = 60;
        }

        Sankaku.extend( Vehicle, SteeredVehicle );

        var p = SteeredVehicle.prototype;

        p.constructor = SteeredVehicle;

        /**
         * @method clone
         * @return {*|SteeredVehicle}
         */
        p.clone = function () {
//            var clone = new SteeredVehicle( this._view );
//
//            // object 2D
//            clone.setPosition( this._position.clone() );
//            clone.width = this.width;
//            clone.height = this.height;
//            clone.rotation = this.rotation;
//
//            // vehicle
//            clone._velocity = this._velocity.clone();
//            clone._mass = this._mass;
//            clone._speed = this._speed;
//            clone._behavior = this._behavior;
//            clone._force = this._behavior;
////
//////            var clone = Vehicle.prototype.clone.call( this, this._view.clone() );
//
//            // myself
//            clone._force = this._force.clone();
//            clone._force_max = this._force_max;
//            clone._force_arrival = this._force_arrival;
//
//            clone._avoid_distance = this._avoid_distance;
//            clone._avoid_buffer = this._avoid_buffer;
//            clone._avoid_insight = this._avoid_insight;
//            clone._avoid_close = this._avoid_close;
//
//            return clone;

            var clone = Object.create( this );
            clone.setView( this._view.clone() );
            clone._force = this._force.clone();
            clone.setPosition( this._position.clone() );

            return clone;
        };

        /**
         * @method max
         * @return {number} SteeredVehicle._force_max
         */
        p.max = function () {
            return this._force_max;
        };

        /**
         * @method setMax
         * @param {number} n
         * @return {SteeredVehicle}
         */
        p.setMax = function ( n ) {
            this._force_max = n;
            return this;
        };

        /**
         * @method arrival
         * @return {number} SteeredVehicle._force_arrival
         */
        p.arrival = function () {
            return this._force_arrival;
        };

        /**
         * @method setArrival
         * @param {number} n
         * @return {SteeredVehicle}
         */
        p.setArrival = function ( n ) {
            this._force_arrival = n;
            return this;
        };

        /**
         * @method setForce
         * @param {Vector2D} v
         * @return {SteeredVehicle}
         */
        p.setForce = function ( v ) {
            this._force = v;
            return this;
        };

        /**
         * @method force
         * @return {Vector2D|SteeredVehicle._force}
         *
         */
        p.force = function () {
            return this._force;
        };

        /**
         * @method setBuffer
         * @param {number} n
         * @return {SteeredVehicle}
         */
        p.setBuffer = function ( n ) {
            this._avoid_buffer = n;
            return this;
        };
        /**
         * @method buffer
         * @return {number|*}
         */
        p.buffer = function () {
            return this._avoid_buffer;
        };

        /**
         * @method setInsight
         * @param {number} n
         * @return {SteeredVehicle}
         */
        p.setInsight = function ( n ) {
            this._avoid_insight = n;
            return this;
        };
        /**
         * @method insight
         * @return {number|*}
         */
        p.insight = function () {
            return this._avoid_insight;
        };

        /**
         * @method setClose
         * @param {number} n
         * @return {SteeredVehicle}
         */
        p.setClose = function ( n ) {
            this._avoid_close = n;
            return this;
        };
        /**
         * @method close
         * @return {number|*}
         */
        p.close = function () {
            return this._avoid_close;
        };

        /**
         * @method avoidDistance
         * @param {number} n
         * @return {SteeredVehicle}
         */
        p.setAvoidDistance = function ( n ) {
            this._avoid_distance = n;
            return this;
        };

        /**
         * @method avoidDistance
         * @return {number|*}
         */
        p.avoidDistance = function () {
            return this._avoid_distance;
        };

        /**
         * @method update
         * @param {number} w
         * @param {number} h
         */
        p.update = function ( w, h ) {
            this._force.truncate( this._force_max ).divideScalar( this._mass );
            this._velocity.add( this._force );

            this._force = new Vector2D();
            this._update( w, h );
        };

        /**
         * 追求
         * @method seek
         * @param {Vector2D} target
         */
        p.seek = function ( target ) {
            var force = target.subNew( this._position );

            force.normalize().multiplyScalar( this._speed ).sub( this._velocity );

            this._force.add( force );
        };

        /**
         * 逃避
         * @method flee
         * @param {Vector2D} target
         */
        p.flee = function ( target ) {
            var force = target.subNew( this._position );

            force.normalize().multiplyScalar( this._speed ).sub( this._velocity );

            this._force.sub( force );
        };

        /**
         * 到着
         * @method arrive
         * @param {Vector2D} target
         */
        p.arrive = function ( target ) {
            var force = target.subNew( this._position ),
                arrival = this._force_arrival,
                distance;

            force.normalize();
            distance = this._position.distance( target );

            if ( distance > arrival ) {
                // far
                force.multiplyScalar( this._speed );
            } else {
                // near
                force.multiplyScalar( this._speed * distance / arrival );
            }

            force.sub( this._velocity );
            this._force.add( force );
        };

        /**
         * 追跡
         * @method pursue
         * @param {Vehicle} target
         */
        p.pursue = function ( target ) {
            var look = this._position.distance( target.position() ),
                clone = target.position().clone();

            clone.add( target._velocity.multiplyNew( look ) );

            this.seek( clone );
        };

        /**
         * 回避
         * @method evade
         * @param {Vehicle} target
         */
        p.evade = function ( target ) {
            var look = this._position.distance( target.position() ) / this._speed,
                clone = target.position().clone();

            clone.sub( target._velocity.multiplyNew( look ) );

            this.flee( clone );
        };

        /**
         * 物体回避
         * @method avoid
         * @param {Array} targets
         */
        p.avoid = function ( targets ) {
            var target,
                heading,
                difference,
                prod,
                distance,
                feeler,
                projection,
                force,
                prf,
                i, limit;

            for ( i = 0, limit = targets.length; i < limit; i++ ) {

                target = targets[ i ];
                heading = this._velocity.clone().normalize();
                difference = target.position().subNew( this._position );
                prod = difference.dot( heading );

                if ( prod > 0 ) {
                    // 前
                    feeler = heading.clone();
                    feeler.multiplyScalar( this._avoid_distance );

                    projection = heading.clone();
                    projection.multiplyScalar( prod );

                    distance = projection.subNew( difference ).length();

                    if (
                        distance < target.radius() + this._avoid_buffer &&
                        projection.length() < feeler.length()
                       ) {

                        force = heading.clone();
                        force.multiplyScalar( this._speed );
                        force.setAngle( force.angle() + difference.sign( this._velocity ) * PI_05 );

                        prf = projection.length() / feeler.length();
                        force.multiplyScalar( 1 - prf );

                        this._force.add( force );
                        this._velocity.multiplyScalar( prf );
                    }// if
                }// prod > 0
            }
        };

        return SteeredVehicle;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/24 - 20:37
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
        SteeredVehicle = Sankaku.SteeredVehicle,
        Vector2D = Sankaku.Vector2D;

    Sankaku.Wander = ( function (){
        var _rand = Math.random;

        /**
         * 徘徊
         * @class Wander
         * @extends SteeredVehicle
         * @params {Object2D} viewModel
         * @constructor
         */
        function Wander ( viewModel ) {
            SteeredVehicle.call( this, viewModel );

            this._wander_angle = 0;
            this._wander_distance = 10;
            this._wnder_radius = 5;
            this._wander_range = 1;
            this._wander_range2 = this._wander_range * 0.5;
        }

        Sankaku.extend( SteeredVehicle, Wander );

        var p = Wander.prototype;

        p.constructor = Wander;

        /**
         * @method clone
         * @return {*|Object2D}
         */
        p.clone = function () {
//            var clone = new Wander();
//
//            // object 2D
//            clone.setPosition( this._position.clone() );
//            clone.width = this.width;
//            clone.height = this.height;
//            clone.rotation = this.rotation;
//
//            // vehicle
//            clone._velocity = this._velocity.clone();
//            clone._mass = this._mass;
//            clone._speed = this._speed;
//            clone._behavior = this._behavior;
//            clone._force = this._behavior;
//
//            // myself
//            clone._force = this._force.clone();
//            clone._force_max = this._force_max;
//            clone._force_arrival = this._force_arrival;
//            clone._avoid_setWanderDistance = this._avoid_setWanderDistance;
//            clone._avoid_buffer = this._avoid_buffer;
//            clone._avoid_insight = this._avoid_insight;
//            clone._avoid_close = this._avoid_close;
//
//            // wander
//            clone._wander_angle = this._wander_angle;
//            clone._wander_distance = this._wander_distance;
//            clone._wnder_radius = this._wnder_radius;
//            clone._wander_range = this._wander_range;
//            clone._wander_range2 = this._wander_range2;
//
//            return clone;
            var clone = Object.create( this );
            clone.setView( this._view.clone() );

            return clone;
        };

        /**
         * @method setWanderAngle
         * @param {number} n
         * @return {Wander}
         */
        p.setWanderAngle = function ( n ) {
            this._wander_angle = n;
            return this;
        };

        /**
         * @method wanderAngle
         * @return {number}
         */
        p.wanderAngle = function () {
            return this._wander_angle;
        };

        /**
         * @method setWanderDistance
         * @param {number} n
         * @return {Wander}
         */
        p.setWanderDistance = function ( n ) {
            this._wander_distance = n;
            return this;
        };

        /**
         * @method wanderDistance
         * @return {number}
         */
        p.wanderDistance = function () {
            return this._wander_distance;
        };

        /**
         * @method setWanderRadius
         * @param {number} n
         * @return {Wander}
         */
        p.setWanderRadius = function ( n ) {
            this._wnder_radius = n;
            return this;
        };

        /**
         * @method wanderRadius
         * @return {number}
         */
        p.wanderRadius = function () {
            return this._wnder_radius;
        };

        /**
         * @method setWanderRange
         * @param {number} n
         * @return {Wander}
         */
        p.setWanderRange = function ( n ) {
            this._wander_range = n;
            this._wander_range2 = n * 0.5;
            return this;
        };

        /**
         * @method wanderRange
         * @return {number}
         */
        p.wanderRange = function () {
            return this._wander_range;
        };

        /**
         * @method wander
         */
        p.wander = function () {
            var center = this._velocity.clone().normalize().multiplyScalar( this._wander_distance ),
                offset = new Vector2D();

            offset.setLength( this._wnder_radius );
            offset.setAngle( this._wander_angle );

            this._wander_angle += _rand() * this._wander_range - this._wander_range2;

            center.add( offset );
            this._force.add( center );
        };

        /**
         * prepare render
         * @method beginRender
         * @param {number} w canvas width
         * @param {number} h canvas height
         */
        p.beginRender = function ( w, h ) {
            this.prepareRender();

            this.wander( this._paths, this._loop );
            this.update( w, h );
        };

        return Wander;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/25 - 21:12
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
        SteeredVehicle = Sankaku.SteeredVehicle,
        Vector2D = Sankaku.Vector2D
    ;

    Sankaku.Flock = ( function (){
        /**
         * 群行動
         * @class Flock
         * @extends SteeredVehicle
         * @params {Object2D} viewModel
         * @constructor
         */
        function Flock ( viewModel ) {
            SteeredVehicle.call( this, viewModel );

            // for flock
            this._flock_flockInsight = 200;
            this._flock_flockClose = 60;
        }

        Sankaku.extend( SteeredVehicle, Flock );

        var p = Flock.prototype;

        p.constructor = Flock;

        /**
         * @method clone
         * @return {*|Flock}
         */
        p.clone = function () {
////            var clone = this._clone();
//            var clone = new Flock( this._view.clone() );

            // object 2D
//            clone.position( this._position.clone() );
//            clone.width = this.width;
//            clone.height = this.height;
//            clone.rotation = this.rotation;
//
//            // vehicle
//            clone._velocity = this._velocity.clone();
//            clone._mass = this._mass;
//            clone._speed = this._speed;
//            clone._behavior = this._behavior;
//            clone._force = this._behavior;
//
//            // myself
//            clone._force = this._force.clone();
//            clone._force_max = this._force_max;
//            clone._force_arrival = this._force_arrival;
//            clone._avoid_distance = this._avoid_distance;
//            clone._avoid_buffer = this._avoid_buffer;
//            clone._avoid_flockInsight = this._avoid_flockInsight;
//            clone._avoid_flockClose = this._avoid_flockClose;
//
//            // super method
////            var clone = SteeredVehicle.prototype.clone.call( this, this._view.clone() );
//
            // for flock
//            clone._flock_flockInsight = this._flock_flockInsight;
//            clone._flock_flockClose = this._flock_flockClose;
//
//            return clone;

            var clone = Object.create( this );
            clone.setView( this._view.clone() );
            clone.position( this._position.clone() );
            clone._velocity = this._velocity.clone();
            clone._force = this._force.clone();

            return clone;
        };

        /**
         * @method setFlockInsight
         * @param {number} n
         * @return {Flock}
         */
        p.setFlockInsight = function ( n ) {
            this._flock_flockInsight = n;

            return this;
        };
        /**
         * @method flockInsight
         * @return {number|*}
         */
        p.flockInsight = function () {
            return this._flock_flockInsight;
        };

        /**
         * @method setFlockClose
         * @param {number} n
         * @return {Flock}
         */
        p.setFlockClose = function ( n ) {
            this._flock_flockClose = n;

            return this;
        };
        /**
         * @method flockClose
         * @return {number|*}
         */
        p.flockClose = function () {
            return this._flock_flockClose;
        };

        /**
         * @method flock
         * @param {Array} targets
         */
        p.flock = function ( targets ) {
            var average_velocity = this._velocity.clone(),
                average_position = new Vector2D(),
                count = 0,
                vehicle,
                i, limit;

            for ( i = 0, limit = targets.length; i < limit; i++ ) {

                vehicle = targets[ i ];

                if ( vehicle !== this && this.tooInsight( vehicle ) ) {

                    average_velocity.add( vehicle.velocity() );
                    average_position.add( vehicle.position() );

                    if ( this.tooClose( vehicle ) ) {

                        this.flee( vehicle.position() );
                    }

                    ++count;
                }
            }// for

            if ( count > 0 ) {
                // count 0 over
                average_velocity.divideScalar( count );
                average_position.divideScalar( count );

                this.seek( average_position );
                this._force.add( average_velocity.sub( this._velocity ) );
            }
        };

        /**
         * @method tooInsight
         * @param {Vehicle} v
         * @return {boolean}
         */
        p.tooInsight = function ( v ) {
            var heading, difference, prod;

            if ( this._position.distance( v._position ) > this._flock_flockInsight ) {

                return false;
            }

            heading = this._velocity.clone().normalize();
            difference = v._position.subNew( this._position );
            prod = difference.dot( heading );

            return prod < 0;
        };

        /**
         * @method tooClose
         * @param {Vehicle} v
         */
        p.tooClose = function ( v ) {
            return this._position.distance( v._position ) < this._flock_flockClose;
        };

        p.setFlocks = function ( flocks ) {
            this._flocks = flocks;

            return this;
        };

        /**
         * prepare render
         * @method beginRender
         * @param {number} w canvas width
         * @param {number} h canvas height
         */
        p.beginRender = function ( w, h ) {
            this.prepareRender();

            this.flock( this._flocks );
            this.update( w, h );
        };

        return Flock;
    }() );
}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/27 - 21:21
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
        SteeredVehicle = Sankaku.SteeredVehicle;

    Sankaku.FollowPath = ( function (){
        /**
         * 経路追従
         * @class FollowPath
         * @extends SteeredVehicle
         * @params {Object2D} viewModel
         * @constructor
         */
        function FollowPath ( viewModel ) {
            SteeredVehicle.call( this, viewModel );

            this._index = 0;
            this._threshold = 20;
        }

        Sankaku.extend( SteeredVehicle, FollowPath );

        var p = FollowPath.prototype;

        p.constructor = FollowPath;

        /**
         * @method clone
         * @return {*|FollowPath}
         */
        p.clone = function () {
//            var clone = new FollowPath();
//
//            // object 2D
//            clone.position( this._position.clone() );
//            clone.width = this.width;
//            clone.height = this.height;
//            clone.rotation = this.rotation;
//
//            // vehicle
//            clone._velocity = this._velocity.clone();
//            clone._mass = this._mass;
//            clone._speed = this._speed;
//            clone._behavior = this._behavior;
//            clone._force = this._behavior;
//
//            // myself
//            clone._force = this._force.clone();
//            clone._force_max = this._force_max;
//            clone._force_arrival = this._force_arrival;
//            clone._avoid_distance = this._avoid_distance;
//            clone._avoid_buffer = this._avoid_buffer;
//            clone._avoid_insight = this._avoid_insight;
//            clone._avoid_close = this._avoid_close;
//
//            // follow path
//            clone._index = this._index;
//            clone._threshold = this._threshold;
//
//            return clone;

            var clone = Object.create( this );
            clone.setView( this._view.clone() );
            clone.position( this._position.clone() );
            clone._velocity = this._velocity.clone();
            clone._force = this._force.clone();

            return clone;
        };

        /**
         * @method follow
         * @param {Array} paths
         * @param {boolean=false} [loop]
         */
        p.follow = function ( paths, loop ) {
            loop = !!loop;

            var point = paths[ this._index ],
                last;

            if ( !point ) {
                return;
            }

            last = paths.length - 1;

            if ( this._position.distance( point ) < this._threshold ) {
                // under _threshold

                if ( this._index >= last ) {
                    // end
                    if ( loop ) {
                        // is loop
                        this._index = 0;
                    }
                } else {

                    this._index++;
                }
            }

            if ( this._index >= last && !loop ) {

                this.arrive( point );
            } else {

                this.seek( point );
            }
        };

        /**
         * @method setPath
         * @param {Array} paths
         * @return {FollowPath}
         */
        p.setPath = function ( paths ) {
            this._paths = paths;

            return this;
        };

        /**
         * @method setLoop
         * @param {Boolean} bool
         * @return {FollowPath}
         */
        p.setLoop = function ( bool ) {
            this._loop = bool;

            return this;
        };

        /**
         * prepare render
         * @method beginRender
         * @param {number} w canvas width
         * @param {number} h canvas height
         */
        p.beginRender = function ( w, h ) {
            this.prepareRender();

            this.follow( this._paths, this._loop );
            this.update( w, h );
        };

        return FollowPath;
    }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/07/03 - 11:33
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

    Sankaku.Zanzo = ( function (){
        /**
         * @class Zanzo
         * @param {int} limit
         * @constructor
         */
        function Zanzo ( limit ) {
            this._limit = limit;
            this._objects = [];
        }

        var p = Zanzo.prototype;

        p.constructor = Zanzo;

        /**
         * @method setLimit
         * @param {int} n
         */
        p.setLimit = function ( n ) {
            this._limit = n;
        };

        /**
         * @method add
         * @param {Array} list [ Object2D, [] ]
         */
        p.add = function ( list ) {
            var objects = this._objects,
                clones = [],
                object, i, limit;

            if ( this._limit > 0 && objects.length >= this._limit ) {

                objects.shift();
            }

            for ( i = 0, limit = list.length; i < limit; i++ ) {

                object = list[ i ];
                clones.push( object.clone() );
            }

            this._objects.push( clones );
        };

        /**
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         * @param {Function} [paint]
         *
         */
        p.draw = function ( ctx, paint ) {
            var objects = this._objects,
                one,
                object,
                step,
                opacity,
                i, limit,
                n, max;


            limit = objects.length;
            step = 1 / ( limit + 1);

            ctx.save();

            for ( i = 0; i < limit; i++ ) {

                one = objects[ i ];
                opacity = step * ( i + 1 );
                ctx.globalAlpha = opacity;

                for ( n = 0, max = one.length; n < max; n++ ) {

                    object = one[ n ];
                    
                    object.draw( ctx );

                    if ( !!paint ) {

                        paint.call( ctx );
                    }
                }
            }

            ctx.restore();
        };

        /**
         * @method length;
         * @return {Number}
         */
        p.length = function () {
            return this._objects.length;
        };

        /**
         * @method clear
         * @return {Zanzo}
         */
        p.clear = function () {
            this._objects = [];

            return this;
        };

        return Zanzo;
    }() );
}( window ) );
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
    var Sankaku = window.Sankaku,
        Scene = Sankaku.Scene
    ;

    Sankaku.Inside = ( function (){
        /**
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
