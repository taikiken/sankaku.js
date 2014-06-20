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
         * @class Iro
         * @constructor
         */
        function Iro () {
            throw new Error( "Iro can't create instance" );
        }

        var iro = Iro;

        /**
         * @method rgb2hsl
         * @static
         * @param {int} r
         * @param {int} g
         * @param {int} b
         * @returns {{h: number, s: number, l: number}}
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
         * @returns {{r: number, g: number, b: number}}
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
         * @returns {{h: number, s: number, v: number}}
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
         * @returns {{r: number, g: number, b: number}}
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
                r: r * 255,
                g: g * 255,
                b: b * 255
            };
        };

        /**
         * @method hex2rgb
         * @static
         * @param {string|int} hex
         * @returns {{r: number, g: number, b: number}}
         */
        iro.hex2rgb = function ( hex ) {
            var r, g, b;

            if ( typeof hex === "string" ) {
                // convert to 0x
                hex.split( "#" ).join( "0x" );
            }

            hex = Math.floor( hex );

            r = ( hex >> 16 & 255 ) / 255;
            g = ( hex >> 8 & 255 ) / 255;
            b = ( hex & 255 ) / 255;

            return {
                r: r * 255,
                g: g * 255,
                b: b * 255
            };
        };

        return Iro;
    }() );
}( window ) );