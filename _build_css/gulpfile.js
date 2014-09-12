/**
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 2014/09/10 - 14:49
 *
 * Copyright (c) 2011-2014 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * for gulp task runner
 */
//var gulp = this.gulp || {};
//( function ( window ){
//    "use strict";
//    var document = window.document,
//        require = window.require,
//
//        // property
//        path = {
//            source: '../_dev/scss/*.scss',
//            publish: '../example/css'
//        },
//        gulp,
//        sass
//    ;
//
//    gulp = require('gulp');
//    sass = require('gulp-sass');
//
//    gulp.task(
//        "dev",
//        function () {
//            gulp.src( path.source )
//                .pipe( sass() )
//                .pipe( gulp.dest( path.publish ) );
//        }
//    );
//
//    gulp.task(
//        "watch",
//        function () {
//            gulp.watch( path.source, [ 'dev' ] );
//        }
//    );
//}( window ) );
var path = {
        src: '../_dev/scss',
        source: '../_dev/scss/*.scss',
        publish: '../examples/css'
    },
    gulp,
    sass,
    compass;

gulp = require('gulp');
//sass = require('gulp-sass');
compass = require('gulp-compass');

//gulp.task(
//    "dev",
//    function () {
//        gulp.src( path.source )
//            .pipe( sass() )
//            .pipe( gulp.dest( path.publish ) );
//    }
//);

gulp.task(
    "dev",
    function () {
        gulp.src( path.source )
            .pipe( compass(
                {
                    config_file: './sass_setting/config.rb',
                    sass: '../_dev/scss',
                    css: '../examples/css'
                }
            ) )
            .pipe( gulp.dest( path.publish ) );
    }
);

gulp.task(
    "watch",
    function () {
        gulp.watch( path.source, [ 'dev' ] );
    }
);