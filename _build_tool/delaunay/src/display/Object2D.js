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
        Num = Sankaku.Num
        ;

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
             * @type {*|Object2D}
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

        p.constructor = Sankaku.Object2D;

        // mixin EventDispatcher
        Sankaku.EventDispatcher.initialize( p );

        /**
         * @method setAlpha
         * @param {Number} n
         * @return {Shape}
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
         */
        p.setPosition = function ( v ) {
            this._position = v;
            this.x = v.x;
            this.y = v.y;
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
         */
        p.setX = function ( x ) {
            this.x = x;
            this._position.x = x;
        };

        /**
         * @method setY
         * @param {number} y
         */
        p.setY = function ( y ) {
            this.y = y;
            this._position.y = y;
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

                cos_ax,
                cos_ay,
                sin_ay,
                sin_ax,
                cos_bx,
                cos_cy,
                sin_bx,
                sin_cy;

            e = {
                scale: this.scale,
                rotation: this.rotation,
                x: this.x,
                y: this.y
            };

            if ( !!parent && this.scene !== parent ) {
                // not scene
                x = parent.x + x * parent.scale;
                y = parent.y + y * parent.scale;

                w1 = this.width * parent.scale;
                h1 = this.height * parent.scale;

                w2 = w1 * 0.5;
                h2 = h1 * 0.5;

                rotation = parent.rotation + this.rotation;

                e.scale = parent.scale * this.scale;
                e.rotation = rotation;
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

            e.x = ( a.x + c.x ) * 0.5;
            e.y = ( a.y + c.y ) * 0.5;

            return { a: a, b: b, c: c, d:d, e: e };
        };

        /**
         * 角度を degree を元に radian 設定します
         * @method rotate
         * @param {number} degree 0 ~ 360
         */
        p.rotate = function ( degree ) {
            this.rotation = Num.deg2rad( degree );
        };

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


            return clone;
        };

        // http://www.emanueleferonato.com/2012/03/09/algorithm-to-determine-if-a-point-is-inside-a-square-with-mathematics-no-hit-test-involved/
        /**
         * point が bounding box 内か外かを調べます
         * @param {Vector2D} v 調べるpoint
         * @return {boolean} true: inside, false: outside
         */
        p.inside = function ( v ) {

            function area ( A, B, C ) {
                return ( C.x * B.y - B.x * C.y ) - ( C.x * A.y - A.x * C.y ) + ( B.x * A.y - A.x * B.y );
            }

            var bounding = this.bounding();

            if (
                area( bounding.a, v ) > 0 ||
                area( bounding.b, v ) > 0 ||
                area( bounding.c, v ) > 0
                ) {
                // outside
                return false;
            }
            // inside
            return true;
        };

        /**
         * @method add
         * @param {*|Object2D} target
         */
        p.add = function ( target ) {

            if ( target === this ) {

                return;
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
        };
        /**
         * @method remove
         * @param {*|Object2D} target
         */
        p.remove = function ( target ) {
            var index, scene;

            index = this.children.indexOf( target );

            if ( index === -1 ) {

                return;
            }

            target.parent = null;
            this.children.splice( index, 1 );

            // remove from scene
            scene = this.scene;

            if ( !!scene ) {

                scene.removeChild( target );
            }
        };

        /**
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         */
        p.draw = function ( ctx ) {
            this._draw( ctx );

            var children = this.children,
                child,
                i, limit;

            for ( i = 0, limit = children.length; i < limit; i++ ) {

                child = children[ i ];

                if ( child.visible && child.alpha() > 0 ) {
                    // visible && alpha not 0
                    children[ i ].draw( ctx );
                }
            }
        };
        /**
         * @method _draw
         * @param {CanvasRenderingContext2D} ctx
         * @protected
         */
        p._draw = function ( ctx ) {

        };

        // children index change
        p.swap = function ( o1, o2 ) {
            var children = this.children,
                index1 = children.indexOf( o1 ),
                index2 = children.indexOf( o2 );

            children[ index2 ] = o1;
            children[ index1 ] = o2;
        };

        p.highest = function ( o ) {
            var children = this.children,
                index = children.indexOf( o );

            children.splice( index, 1 );
            children.push( o );
        };

        return Object2D;
    }() );

}( window ) );