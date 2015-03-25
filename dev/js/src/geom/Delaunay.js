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
    var Sankaku = window.Sankaku;

    Sankaku.Delaunay = ( function (){
        var
          Triangle = Sankaku.Triangle;

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