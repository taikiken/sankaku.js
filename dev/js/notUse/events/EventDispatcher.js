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