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

            /**
             * @property _mask
             * @type {*|null}
             * @protected
             */
            this._mask = null;
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

            clone.setMask( this.mask().clone() );

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
         * @method rotate
         * @return {number} 回転角度(degree)を返します
         */
        p.rotate = function () {
            return Num.rad2deg( this.rotation );
        };

        /**
         * @method radian
         * @return {*|number|Object2D.rotation}
         */
        p.radian = function () {
            return this.rotation;
        };

        p.setMask = function ( mask ) {
            mask.parent = this;
            mask.maskMode = true;

            this._mask = mask;

            this.add( mask );

            return this;
        };

        p.removeMask = function () {
            var mask = this._mask;
            mask.parent = null;
            mask.maskMode = false;
            this._mask = null;

            return this;
        };

        p.mask = function () {
            return this._mask;
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

            if ( this.visible && this._alpha !== 0 && this.scale !== 0 ) {
                // visible true && alpha not 0 && scale not 0

                if ( !this._mask || !!this._mask && this._mask.ready ) {

                    this.beginDraw( ctx );

                    this._draw( ctx );

                    this.exitDraw( ctx );
                }
            }

            var children = this.children,
                i, limit;

            for ( i = 0, limit = children.length; i < limit; i++ ) {

                children[ i ].draw( ctx );
            }

            return this;
        };

//        p._drawMask = function ( ctx ) {
//
//            this._mask.draw( ctx );
//        };

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