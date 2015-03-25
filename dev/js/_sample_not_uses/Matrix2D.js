/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/23 - 12:13
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
        Point = Sankaku.Point,
        Num = Sankaku.Num;

    Sankaku.Matrix2D = ( function (){
        var _cos = Math.cos,
            _sin = Math.sin,
            _PI = Math.PI,
            _tan = Math.tan;

        /**
         *      a   c   tx
         *
         *      b   d   ty
         *
         *      0   0   1
         *
         *
         * @class Matrix2D
         * @param {Number=1} [a]
         * @param {Number=0} [b]
         * @param {Number=0} [c]
         * @param {Number=1} [d]
         * @param {Number=0} [tx]
         * @param {Number=0} [ty]
         * @constructor
         */
        function Matrix2D ( a, b, c, d, tx, ty ) {
            this.a = Num.is( a ) ? a : 1;
            this.b = b || 0;
            this.c = c || 0;
            this.d = Num.is( d ) ? d : 1;
            this.tx = tx || 0;
            this.ty = ty || 0;
        }

        Matrix2D.ONE_RAD = _PI / 180;

        var p = Matrix2D.prototype;

        /**
         * @method append
         * @param {number} a
         * @param {number} b
         * @param {number} c
         * @param {number} d
         * @param {number} tx
         * @param {number} ty
         * @return {Matrix2D}
         */
        p.append = function(a, b, c, d, tx, ty) {
            var a1 = this.a,
                b1 = this.b,
                c1 = this.c,
                d1 = this.d;

            this.a  = a * a1 + b * c1;
            this.b  = a * b1 + b * d1;
            this.c  = c * a1 + d * c1;
            this.d  = c * b1 + d * d1;

            this.tx = tx * a1 + ty * c1 + this.tx;
            this.ty = tx * b1 + ty * d1 + this.ty;

            return this;
        };

        /**
         * ラジアン度回転します<br>
         * <pre>cos(q)     -sin(q)     0
         * sin(q)      cos(q)     0
         * 0          0           1</pre>
         *
         * @method rotate
         * @param {number} radian
         * @return {Matrix2D}
         */
        p.rotate = function ( radian ) {
            var cos = _cos( radian ),
                sin = _sin( radian ),
                a1 = this.a,
                c1 = this.c,
                b1 = this.b,
                d1 = this.d,
                tx1 = this.tx,
                ty1 = this.ty;

            this.a = a1 * cos + b1 * sin;
            this.b = a1 * sin + b1 * cos;
            this.c = c1 * cos - d1 * sin;
            this.d = c1 * sin + d1 * cos;
//            this.tx = tx1 * cos - ty1 * sin;
//            this.ty = tx1 * sin + ty1 * cos;

            return this;
        };

        /**
         * @method skew
         * @param {number} skewX horizontal degree 0 ~ 360
         * @param {number} skewY vertical degree 0 ~ 360
         * @return {Matrix2D}
         */
        p.skew = function ( skewX, skewY ) {
            skewX = skewX * Matrix2D.ONE_RAD;
            skewY = skewY * Matrix2D.ONE_RAD;

            this.append( _cos( skewY ), _sin( skewY ), -_sin( skewX ), _cos( skewX ), 0, 0 );

            return this;
        };

        /**
         * 行列に拡大 / 縮小の変換を適用します。
         * @method scale
         * @param {number} scale_x
         * @param {number} [scale_y] default same as scale_x
         * @return {Matrix2D}
         */
        p.scale = function ( scale_x, scale_y ) {
            if ( !Num.is( scale_y ) ) {

                scale_y = scale_x;
            }

            this.a *= scale_x;
            this.d *= scale_y;
            this.c *= scale_x;
            this.b *= scale_y;
            this.tx *= scale_x;
            this.ty *= scale_y;

            return this;
        };

        /**
         * 行列を x 軸と y 軸に沿って、dx パラメーターと dy パラメーターで指定された量だけ平行移動します。
         * @method translate
         * @param {number} dx
         * @param {number} dy
         * @return {Matrix2D}
         */
        p.translate = function ( dx, dy ) {
            this.tx += dx;
            this.ty += dy;

            return this;
        };

        /**
         * 各行列プロパティを null 変換になる値に設定します。
         * @method identity
         * @return {Matrix2D}
         */
        p.identity = function () {
            this.a = this.d = 1;
            this.b = this.c = this.tx = this.ty = 0;

            return this;
        };

        /**
         * 元のマトリックスの逆の変換を実行します。
         * @method invert
         * @return {Matrix2D}
         */
        p.invert = function () {
            var a1 = this.a,
                b1 = this.b,
                c1 = this.c,
                d1 = this.d,
                tx1 = this.tx,
                ty1 = this.ty,
                n = a1 * d1 - b1 * c1;

            this.a = d1 / n;
            this.b = -b1 / n;
            this.c = -c1 / n;
            this.d = a1 / n;
            this.tx = ( c1 * ty1 - d1 * tx1 ) / n;
            this.ty = -( a1 * ty1 -b1 * tx1 ) / n;

            return this;
        };

        /**
         * すべてのマトリックスデータをコピーします。
         * @method copy
         * @param {Matrix2D} matrix
         * @return {Matrix2D}
         */
        p.copy = function ( matrix ) {
            this.a = matrix.a;
            this.b = matrix.b;
            this.c = matrix.c;
            this.d = matrix.d;

            this.tx = matrix.tx;
            this.ty = matrix.ty;

            return this;
        };

        /**
         * 新しい Matrix オブジェクトとして、このマトリックスのクローンを返します。含まれるオブジェクトはまったく同じコピーになります。
         * @method clone
         * @return {Matrix2D}
         */
        p.clone = function () {
            return new Matrix2D( this.a, this.b, this.c, this.d, this.tx, this.ty );
        };

        /**
         * Matrix オブジェクトで表現される図形変換を、指定されたポイントに適用した結果を返します。
         * @method transformPoint
         * @param {number} x
         * @param {number} y
         * @param {Point} [point]
         * @return {Point}
         */
        p.transformPoint = function ( x, y, point ) {
            point = point || new Point();

            point.x = x * this.a + y * this.c + this.tx;
            point.y = x * this.b + y * this.d + this.ty;

            return point;
        };

        return Matrix2D;
    }() );
}( window ) );