/**
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 2015/03/24 - 12:10
 *
 * Copyright (c) 2011-2015 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * @build 3/24/2015, 1:51:04 PM
 * @version 0.9.0
 * @git https://github.com/taikiken/gasane.js
 *
 * @module Gasane
 */
var Gasane = Gasane || {};

( function ( window ){
  "use strict";

  var
    self = window.self;

  /**
   * Polyfill methods として以下の関数を用意しています。
   *
   *    Date.now
   *
   *    requestAnimationFrame
   *    cancelAnimationFrame
   *
   */


  // Date.now
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Date/now
  if ( !Date.now ) {

    Date.now = function now() {

      return new Date().getTime();
    };
  }

  // requestAnimationFrame
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
  ( function (){
    var
      lastTime = 0,
      vendors = [ 'ms', 'moz', 'webkit', 'o' ],
      x,
      limit,
      currTime,
      timeToCall,
      id,
      _max;

    for ( x = 0, limit = vendors.length; x < limit && !self.requestAnimationFrame; ++ x ) {

      self.requestAnimationFrame = self[ vendors[ x ] + 'RequestAnimationFrame' ];
      self.cancelAnimationFrame = self[ vendors[ x ] + 'CancelAnimationFrame' ] || self[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
    }

    if ( self.requestAnimationFrame === undefined && self.setTimeout !== undefined ) {

      _max = Math.max;

      self.requestAnimationFrame = function ( callback ) {

        currTime = Date.now();
        timeToCall = _max( 0, 16 - ( currTime - lastTime ) );
        id = self.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );

        lastTime = currTime + timeToCall;

        return id;
      };

    }

    if( self.cancelAnimationFrame === undefined && self.clearTimeout !== undefined ) {

      self.cancelAnimationFrame = function ( id ) { self.clearTimeout( id ); };
    }

  }() );
}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2015/03/22 - 13:00
 *
 * Copyright (c) 2011-2015 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( window ){
  "use strict";
  var
    Gasane = window.Gasane;

  Gasane.EventDispatcher = ( function (){
    /**
     * カスタム Event を管理します<br>
     * 必要なClassでmixinします<br>
     * mixin 後下記の6関数が使用できるようになります<br>
     * addEventListener<br>
     * hasEventListener<br>
     * removeEventListener<br>
     * dispatchEvent<br>
     * on<br>
     * off<br>
     *
     *      function SomeClass () {}
     *      // mixin
     *      Gasane.EventDispatcher.initialize( SomeClass.prototype );
     *
     * @class EventDispatcher
     * @constructor
     */
    function EventDispatcher () {
      //this._listeners = {};
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

      this.on( type, listener );

    };
    /**
     * addEventListener alias
     * @method on
     * @param {string} type event type
     * @param {function} listener event handler
     */
    p.on = function ( type, listener ) {

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
      this.off( type, listener );
    };
    /**
     * removeEventListener alias
     * @method off
     * @param {string} type event type
     * @param {function} listener event handler
     */
    p.off = function ( type, listener ) {
      var
        listeners = this._listeners,
        listeners_types,
        index;

      if ( typeof listeners === "undefined") {

        return;
      }

      listeners_types = listeners[ type ];

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
     * @param {Object} event require event.type:String, { type: "some_event", [] }
     */
    p.dispatchEvent = function ( event ) {
      var
        listeners = this._listeners,
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
     * on<br>
     * off<br>
     * をobjectへ追加します
     *
     *      function SomeClass () {}
     *      // mixin
     *      Gasane.EventDispatcher.initialize( SomeClass.prototype );
     *
     *      var someObject = {};
     *      // mixin
     *      Gasane.EventDispatcher.initialize( someObject );
     *
     * @method initialize
     * @param {Object} object
     * @static
     */
    EventDispatcher.initialize = function ( object ) {

      object.addEventListener = p.addEventListener;
      object.on = p.on;
      object.hasEventListener = p.hasEventListener;
      object.removeEventListener = p.removeEventListener;
      object.off = p.off;
      object.dispatchEvent = p.dispatchEvent;

    };

    return EventDispatcher;
  }() );
}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2015/03/23 - 18:17
 *
 * Copyright (c) 2011-2015 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * requestAnimationFrame controller
 */
( function ( window ){
  "use strict";

  var
    Gasane = window.Gasane;

  Gasane.Cycle = ( function (){
    var
      EventDispatcher = Gasane.EventDispatcher,
      animation = window.self.requestAnimationFrame,
      cancel = window.self.cancelAnimationFrame;

    /**
     * requestAnimationFrame Event を発火します
     * @class Cycle
     * @constructor
     */
    function Cycle () {
      throw new Error( "Cycle can't create instance." );
    }

    /**
     * @property started
     * @static
     * @type {boolean}
     */
    Cycle.started = false;

    /**
     * @property id
     * @static
     * @type {number}
     */
    Cycle.id = 0;

    /**
     * @event UPDATE
     * @static
     * @type {string}
     */
    Cycle.UPDATE = "cycleUpdate";

    /**
     * @property event
     * @static
     * @type {{type: string, scope: Cycle}}
     */
    Cycle.event = { type: Cycle.UPDATE, scope: Cycle };

    EventDispatcher.initialize( Cycle );

    var p = Cycle.prototype;

    p.constructor = Cycle;

    /**
     * requestAnimationFrame を開始します
     * @method start
     * @static
     */
    Cycle.start = function () {

      if ( !Cycle.started ) {
        // start when not started
        Cycle.started = true;
        Cycle.update();

      }

    };

    /**
     * requestAnimationFrame を停止します<br>
     * 全てのlistener handlerに影響します<br>
     * 個別に止める場合は listener を off(removeEventListener) して下さい
     * @method stop
     * @static
     */
    Cycle.stop = function () {

      if ( Cycle.started ) {
        // cancel when started
        cancel( Cycle.id );
        Cycle.started = false;
        Cycle.id = 0;

      }

    };

    /**
     * requestAnimationFrame event handler
     * @method update
     * @static
     */
    Cycle.update = function () {
      // requestAnimationFrame loop
      Cycle.id = animation( Cycle.update );
      // event fire
      Cycle.dispatchEvent( Cycle.event );
    };

    return Cycle;
  }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2015/03/23 - 20:04
 *
 * Copyright (c) 2011-2015 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( window ){
  "use strict";

  var
    Gasane = window.Gasane;

  Gasane.Polling = ( function (){
    var
      EventDispatcher = Gasane.EventDispatcher,
      Cycle = Gasane.Cycle,
      _now = Date.now;

    /**
     * polling指定時間（ミリセカンド）毎に通知を行います
     * @class Polling
     * @param {number} polling milliseconds
     * @constructor
     */
    function Polling ( polling ) {
      this._polling = polling;
      /**
       * @property _started
       * @type {boolean}
       * @private
       */
      this._started = false;
      /**
       * frame 開始時間, frame rate 計算に使用
       * @property _start
       * @type {number}
       * @private
       */
      this._start = 0;
      /**
       * Cycle.UPDATE event handler binding
       * @property _boundUpdate
       * @type {function(this:Fps)|*}
       * @private
       */
      this._boundUpdate = this.update.bind( this );
      /**
       * @property _event
       * @type {{type: string, scope: Polling}}
       * @private
       */
      this._event = { type: Polling.PAST, scope: this };
    }

    /**
     * @event PAST
     * @type {string}
     */
    Polling.PAST = "pollingPast";

    var p = Polling.prototype;

    // mixin
    EventDispatcher.initialize( p );

    p.constructor = Polling;
    /**
     * polling 計算を開始します
     * @method start
     * @return {Polling}
     */
    p.start = function () {

      if ( !this._started ) {
        // not started
        this._started = true;
        this.setPolling( this._polling );

        // Cycle listener
        Cycle.on( Cycle.UPDATE, this._boundUpdate );
        Cycle.start();

      }

      return this;
    };
    /**
     * polling 計算を止めます
     * @method stop
     * @return {Polling}
     */
    p.stop = function () {

      if ( this._started ) {
        // started
        this._started = false;
        Cycle.off( Cycle.UPDATE, this._boundUpdate );

      }

      return this;
    };
    /**
     * @method polling
     * @return {Number}
     */
    p.polling = function () {

      return this._polling;

    };
    /**
     * @method setPolling
     * @param {number} polling
     * @return {Polling}
     */
    p.setPolling = function ( polling ) {

      this._start = this.now();
      this._polling = polling;

      return this;
    };
    /**
     * Polling.setPolling alias
     * @method changePolling
     * @param {number} polling
     * @return {Polling}
     */
    p.changePolling = function ( polling ) {

      this.setPolling( polling );

      return this;
    };
    /**
     * @method now
     * @return {number} 現在時間(timestamp)を返します
     */
    p.now = function () {
      return _now();
    };
    /**
     * Cycle.update event handler
     * @method update
     */
    p.update = function () {
      var
        now = this.now();

      if ( ( now - this._start ) >= this._polling ) {

        this._start = now;
        this.dispatchEvent( this._event );

      }

    };

    return Polling;
  }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2015/03/23 - 19:29
 *
 * Copyright (c) 2011-2015 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( window ){
  "use strict";

  var
    Gasane = window.Gasane;

  Gasane.Fps = ( function (){
    var
      EventDispatcher = Gasane.EventDispatcher,
      Cycle = Gasane.Cycle,
      _now = Date.now;

    /**
     * @class Fps
     * @param {int} fps frame rate
     * @constructor
     */
    function Fps ( fps ) {
      /**
       * @property _fps
       * @type {Number}
       * @private
       */
      this._fps = fps;
      /**
       * @property _started
       * @type {boolean}
       * @private
       */
      this._started = false;
      /**
       * frame 開始時間, frame rate 計算に使用
       * @property _start
       * @type {number}
       * @private
       */
      this._start = 0;
      /**
       * frame 間時間, frame rate 計算に使用。 1000 / fps
       * @property _polling
       * @type {number}
       * @private
       */
      this._polling = 0;
      /**
       * Cycle.UPDATE event handler binding
       * @property _boundUpdate
       * @type {function(this:Fps)|*}
       * @private
       */
      this._boundUpdate = this.update.bind( this );
      /**
       * @property _event
       * @type {{type: string, scope: Fps}}
       * @private
       */
      this._event = { type: Fps.ENTER_FRAME, scope: this };
    }

    /**
     * @event ENTER_FRAME
     * @type {string}
     */
    Fps.ENTER_FRAME = "enterFrame";

    var p = Fps.prototype;

    // mixin
    EventDispatcher.initialize( p );

    p.constructor = Fps;

    /**
     * Fps 計算を開始します
     * @method start
     * @return {Fps}
     */
    p.start = function () {

      if ( !this._started ) {
        // not started
        this._started = true;
        this.setFps( this._fps );

        // Cycle listener
        Cycle.on( Cycle.UPDATE, this._boundUpdate );
        Cycle.start();

      }

      return this;
    };
    /**
     * Fps 計算を止めます
     * @method stop
     * @return {Fps}
     */
    p.stop = function () {

      if ( this._started ) {
        // started
        this._started = false;
        Cycle.off( Cycle.UPDATE, this._boundUpdate );

      }

      this._polling = Number.MAX_VALUE;

      return this;

    };
    /**
     * @method fps
     * @return {int} 現在 fps を返します
     */
    p.fps = function () {

      return this._fps;

    };
    /**
     * @method setFps
     * @param {int} fps fps を設定します
     * @return {Fps}
     */
    p.setFps = function ( fps ) {

      this._start = this.now();
      this._polling = 1000 / fps;
      this._fps = fps;

      return this;

    };
    /**
     * Fps.setFps alias
     * @method changeFps
     * @param {int} fps fps を変更します
     * @return {Fps}
     */
    p.changeFps = function ( fps ) {

      this.setFps( fps );

      return this;

    };
    /**
     * @method now
     * @return {number} 現在時間(timestamp)を返します
     */
    p.now = function () {
      return _now();
    };
    /**
     * Cycle.update event handler
     * @method update
     */
    p.update = function () {
      var
        now = this.now();

      if ( ( now - this._start ) >= this._polling ) {

        this._start = now;
        this.dispatchEvent( this._event );

      }

    };


    return Fps;
  }() );

}( window ) );