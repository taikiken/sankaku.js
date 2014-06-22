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

        /**
         * ベクトルを可視化するのに用います
         * <br>デバッグなどで使用します。
         *
         * @method draw
         * @param {CanvasRenderingContext2D} ctx
         * @returns {Vector2D}
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
         * @returns {Vector2D}
         */
        p.clone = function () {
            return new Vector2D( this.x, this.y );
        };

        /**
         * ベクトルのx, yの値を 0 にします
         * @method zero
         * @returns {Vector2D}
         */
        p.zero = function () {
            this.x = 0;
            this.y = 0;

            return this;
        };

        /**
         * ベクトルの値が x, y 共 0 かどうかを判定します
         * @method isZero
         * @returns {boolean}
         */
        p.isZero = function () {
            return this.x === 0 && this.y === 0;
        };

        /**
         * ベクトルへ値を設定します
         * @method set
         * @param {number} x
         * @param {number} y
         * @returns {Vector2D}
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
         * @returns {Vector2D}
         */
        p.setX = function ( x ) {
            this.x = x;

            return this;
        };

        /**
         * ベクトルの y へ値を設定します
         * @method setY
         * @param {number} y
         * @returns {Vector2D}
         */
        p.setY = function ( y ) {
            this.y = y;

            return this;
        };

        /**
         * ベクトルへ引数ベクトルの値を複写します
         * @method copy
         * @param {Vector2D} v
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
         */
        p.addNew = function ( v ) {
            return new Vector2D( this.x + v.x, this.y + v.y );
        };

        /**
         * 二つのベクトルの値を加算します
         * @method addVector
         * @param {Vector2D} a
         * @param {Vector2D} b
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
         */
        p.subNew = function ( v ) {
            return new Vector2D( this.x - v.x, this.y - v.y );
        };

        /**
         * 二つのベクトルの値を減算します
         * @method subVector
         * @param {Vector2D} a
         * @param {Vector2D} b
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
         */
        p.multiplyNew = function ( v ) {
            return new Vector2D( this.x * v.x, this.y * v.y );
        };

        /**
         * ベクトルへ引数ベクトルの値を除算します
         * @method divide
         * @param {Vector2D} v
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
         */
        p.divideNew = function ( v ) {
            return new Vector2D( this.x / v.x, this.y / v.y );
        };

        /**
         * ベクトルへ引数ベクトルの値と比較し小さな方の値を設定します
         * @method min
         * @param {Vector2D} v
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
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
         * @returns {Vector2D}
         */
        p.floor = function () {
            this.x = Math.floor( this.x );
            this.y = Math.floor( this.y );

            return this;
        };

        /**
         * @method ceil
         * @returns {Vector2D}
         */
        p.ceil = function () {
            this.x = Math.ceil( this.x );
            this.y = Math.ceil( this.y );

            return this;
        };

        /**
         * @method round
         * @returns {Vector2D}
         */
        p.round = function () {
            this.x = Math.round( this.x );
            this.y = Math.round( this.y );

            return this;
        };

        /**
         * @method roundToZero
         * @returns {Vector2D}
         */
        p.roundToZero = function () {
            this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
            this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );

            return this;
        };

        /**
         * @method negate
         * @returns {Vector2D}
         */
        p.negate = function () {
            return this.multiplyScalar( - 1 );
        };

        /**
         * ベクトルと引数ベクトルの内積を計算します
         * @method dot
         * @param {Vector2D} v 内積をとる Vector2D インスタンス
         * @returns {number}
         */
        p.dot = function ( v ) {
            return this.x * v.x + this.y * v.y;
        };

        /**
         * ベクトルの大きさの２条を計算します
         * @method lengthSq
         * @returns {number}
         */
        p.lengthSq = function () {
            return this.x * this.x + this.y * this.y;
        };

        /**
         * ベクトルの大きさの２条の平方根を計算します
         * @method length
         * @returns {number}
         */
        p.length = function () {
            return Math.sqrt( this.lengthSq() );
        };

        /**
         * ベクトルの大きさを設定します
         * @method setLength
         * @param {number} l
         * @returns {Vector2D}
         */
        p.setLength = function ( l ) {
            var oldLength = this.length();

            if ( oldLength !== 0 && l !== oldLength ) {

                this.multiplyScalar( l / oldLength );
            }

            return this;
        };

        /**
         * @method setAngle
         * @param {number} value
         * @returns {Vector2D}
         */
        p.setAngle = function ( value ) {
            var len = this.length();

//            this.x = Math.cos( value ) * len;
//            this.y = Math.sin( value ) * len;
            this.x = Math.cos( value );
            this.y = Math.sin( value );

            return this;
        };

        /**
         * ベクトルの角度を設定します
         * @method angle
         * @returns {number}
         */
        p.angle = function () {
            return Math.atan2( this.y, this.x );
        };

        /**
         * ベクトルの大きさを正規化（大きさを1）にします
         *
         * @method normalize
         * @returns {Vector2D}
         */
        p.normalize = function () {
            return this.divideScalar( this.length() );
        };

        /**
         * ベクトルと引数ベクトル間の距離の２条を計算します
         * @method distanceSq
         * @param {Vector2D} v
         * @returns {number}
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
         * @returns {number}
         */
        p.distance = function ( v ) {
            return Math.sqrt( this.distanceSq( v ) );
        };

        /**
         * @method lerp
         * @param {Vector2D} v
         * @param {number} alpha
         * @returns {Vector2D}
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
         * @returns {boolean}
         */
        p.equals = function ( v ) {
            return ( ( v.x === this.x ) && ( v.y === this.y ) );
        };

        /**
         * 配列を使いベクトルを設定します
         * @method fomArray
         * @param {Array} array [x: number, y: number]
         * @returns {Vector2D}
         */
        p.fomArray = function ( array ) {
            this.x = array[ 0 ];
            this.y = array[ 1 ];

            return this;
        };

        /**
         * ベクトルの値を配列として返します
         * @method toArray
         * @returns {[]} [x: number, y: number]
         */
        p.toArray = function () {
            return [ this.x, this.y ];
        };

        /**
         * ベクトルの値を設定した値以下にします
         * @method truncate
         * @param {number} max
         * @returns {Vector2D}
         */
        p.truncate = function ( max ) {
            var min = Math.min( max, this.length() );
            return this.setLength( min );
        };

        /**
         * ベクトルの値を反転します
         * @method reverse
         * @returns {Vector2D}
         */
        p.reverse = function () {
            this.x *= -1;
            this.y *= -1;

            return this;
        };

        /**
         * ベクトルが正規化されているかを判定します
         * @method isNormalize
         * @returns {boolean}
         */
        p.isNormalize = function () {
            return this.length() === 1;
        };

        /**
         * このベクトルに垂直なベクトルを生成し返します
         * @method prev
         * @returns {Vector2D} このベクトルに垂直なベクトル
         */
        p.prev = function () {
            return new Vector2D( -this.y, this.x );
        };

        /**
         * 引数ベクトルが、このベクトルの左側にあるか右側かを判定します
         *
         * @method sign
         * @param {Vector2D} v
         * @returns {number} -1: 左側, 1: 右側
         */
        p.sign = function ( v ) {
            return this.prev().dot( v ) < 0 ? -1 : 1;
        };

        /**
         * ２つのベクトル間の角度を計算します
         * @method angleBetween
         * @static
         * @param {Vector2D} v1
         * @param {Vector2D} v2
         * @returns {number}
         */
        Vector2D.angleBetween = function ( v1, v2 ) {

            if ( !v1.isNormalize() ) {

                v1 = v1.clone().normalize();
            }
            if ( !v2.isNormalize() ) {

                v2 = v2.clone().normalize();
            }

            return Math.acos( v1.dot( v2 ) );
        };

        return Vector2D;
    }() );
}( window ) );