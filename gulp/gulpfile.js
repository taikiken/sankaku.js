/**
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 2015/03/16 - 14:54
 *
 * Copyright (c) 2011-2015 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
// ----------------------------------------------------------------
"use strict";

// node Module
var require = require;

// Gulp Module
var gulp = require( 'gulp' );

var runSequence = require('run-sequence');
var size = require('gulp-size');

var concat = require( 'gulp-concat' );
var rename = require( 'gulp-rename' );
var uglifyjs = require( 'gulp-uglifyjs' );
var uglify = require( 'gulp-uglify' );

var shell = require( 'gulp-shell' );

var plumber = require( 'gulp-plumber' );

var changed = require('gulp-changed');

var cache = require('gulp-cache');

var rimraf = require('rimraf');
var del = require('del');

var path = require( 'path' );

var cached = require( 'gulp-cached' );

var yuidoc = require( 'gulp-yuidoc' );

var replace = require('gulp-replace-task');

// ----------------------------------------------------------------
// Directory
var dir = require( './setting.js' ).dir;

// ----------------------------------------------------------------
// package
var pac = require( './package.json' );
var repository = pac.repository.url;

// ----------------------------------------------------------------
// patterns, replace task
var patterns = [
  {
    match: 'version',
    replacement: pac.version
  },
  {
    match: 'buildTime',
    replacement: new Date().toLocaleString()
  },
  {
    match: 'year',
    replacement: new Date().getFullYear()
  },
  {
    match: 'repository',
    replacement: repository
  }
];
// ----------------------------------------------------------------
//  scripts
// ----------------------------------------------------------------
var libName = 'sankaku.js';
var scripts = [];

// dependencies
scripts.push( dir.dependencies + '/kaketsugi.min.js' );
scripts.push( dir.dependencies + '/gasane.min.js' );

// Sankaku
scripts.push( dir.src + '/Sankaku.js' );

// net
scripts.push( dir.src + '/net/LoadImage.js' );

// util
scripts.push( dir.src + '/util/FileSave.js' );
scripts.push( dir.src + '/util/Iro.js' );
scripts.push( dir.src + '/util/List.js' );
scripts.push( dir.src + '/util/Num.js' );
scripts.push( dir.src + '/util/Distribute.js' );

// geom
scripts.push( dir.src + '/geom/Vector2D.js' );
scripts.push( dir.src + '/geom/Triangle.js' );
scripts.push( dir.src + '/geom/Delaunay.js' );

// display
scripts.push( dir.src + '/display/Object2D.js' );
scripts.push( dir.src + '/display/Scene.js' );
scripts.push( dir.src + '/display/Shape.js' );
scripts.push( dir.src + '/display/Circle.js' );
scripts.push( dir.src + '/display/Tripod.js' );
scripts.push( dir.src + '/display/Star.js' );
scripts.push( dir.src + '/display/Line.js' );
scripts.push( dir.src + '/display/Bitmap.js' );

// vehicle
scripts.push( dir.src + '/vehicle/Vehicle.js' );
scripts.push( dir.src + '/vehicle/SteeredVehicle.js' );
scripts.push( dir.src + '/vehicle/Wander.js' );
scripts.push( dir.src + '/vehicle/Flock.js' );
scripts.push( dir.src + '/vehicle/FollowPath.js' );

// render
scripts.push( dir.src + '/render/Zanzo.js' );
scripts.push( dir.src + '/render/Inside.js' );


// ----------------------------------------------------------------
//  task
// ----------------------------------------------------------------
// concat to libs
gulp.task( 'script-concat', function () {

  return gulp.src( scripts )
    .pipe( concat( libName ) )
    .pipe( gulp.dest( dir.libs ) )
    .pipe( rename( function ( path ) {

      path.basename = path.basename + '-' + pac.version;

    } ) )
    .pipe( gulp.dest( dir.libs ) )
    .pipe( size( { title: '*** script-concat ***' } ) );

} );

// min inside libs
gulp.task( 'script-min', function (){

  return gulp.src(
    [
      dir.libs + '/sankaku.js',
      dir.libs + '/sankaku' + '-' + pac.version + '.js'
    ] )
    .pipe( uglify( { preserveComments: 'some' } ) )
    .pipe( rename( { suffix: '.min' } ) )
    .pipe( gulp.dest( dir.libs ) )
    .pipe( size( { title: '*** script-min ***' } ) );

} );

// build time, version
gulp.task( 'script-version', function () {

  return gulp.src(
    [
      dir.libs + '/sankaku.js',
      dir.libs + '/sankaku.min.js',
      dir.libs + '/sankaku-' + pac.version + '.min.js'
    ]
  )
    .pipe( replace( { patterns: patterns } ) )
    .pipe( gulp.dest( dir.libs ) )
    .pipe( size( { title: '*** script-version ***' } ) );

} );

// YUIDocs
gulp.task( 'script-docs', function () {

  return gulp.src( dir.src + '/**/*.js' )
    .pipe( yuidoc() )
    //.pipe( yuidoc.parser() )
    //.pipe( yuidoc.generator() )
    .pipe( gulp.dest( dir.docs ) );
} );

// ----------------------------------------------------------------
// build
gulp.task( 'script-build', function () {

  runSequence(
    'script-concat',
    'script-min',
    'script-version'
  );

} );

// build with docs
gulp.task( 'script-build-api', function () {

  runSequence(
    'script-concat',
    'script-min',
    'script-version',
    'script-docs'
  );

} );