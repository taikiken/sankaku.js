/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2014/06/21 - 14:29
 *
 * Copyright (c) 2011-2014 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * https://gist.github.com/enjalot/1569370
 */
( function ( window ){
    "use strict";
    var Sankaku = window.Sankaku,

        _sqrt = Math.sqrt;

    Sankaku.Boids = ( function (){

        function d3_ai_boidNormalize( a ) {
            var m = d3_ai_boidMagnitude( a );

            if ( m > 0 ) {
                a[ 0 ] /= m;
                a[ 1 ] /= m;
            }

            return a;
        }

        function d3_ai_boidWrap ( position, w, h ) {

            if ( position[ 0 ] > w ) {

                position[ 0 ] = 0;
            } else if ( position[ 0 ] < 0 ) {

                position[0] = w;
            }

            if ( position[ 1 ] > h ) {

                position[ 1 ] = 0;
            } else if ( position[ 1 ] < 0 ) {

                position[ 1 ] = h;
            }
        }

        function d3_ai_boidGravity ( center, position, neighborRadius ) {
            var m, d;
//            if ( center[0] !== null ) {
            if ( !!center[ 0 ] ) {

                m = d3_ai_boidSubtract( center.slice(), position );
                d = d3_ai_boidMagnitude( m ) - 10;

                if ( d > 0 && d < neighborRadius * 5 ) {

                    d3_ai_boidNormalize( m );

                    m[ 0 ] /= d;
                    m[ 1 ] /= d;

                    return m;
                }
            }

            return [ 0, 0 ];
        }

        function d3_ai_boidDistance( a, b, w, h ) {
            var dx = a[ 0 ] - b[ 0 ],
                dy = a[ 1 ] - b[ 1 ];

            if ( dx > w * 0.5 ) { dx = w - dx; }
            if ( dy > h * 0.5 ) { dy = h - dy; }

            return _sqrt( dx * dx + dy * dy );
        }

        function d3_ai_boidSubtract( a, b ) {
            a[ 0 ] -= b[ 0 ];
            a[ 1 ] -= b[ 1 ];

            return a;
        }

        function d3_ai_boidMagnitude ( v ) {
            var v0 = v[ 0 ],
                v1 = v[ 1 ];

//            return Math.sqrt( v[0] * v[0] + v[1] * v[1] );
            return _sqrt( v0 * v0 + v1 * v1 );
        }

        function d3_ai_boidLimit ( a, max ) {

            if ( d3_ai_boidMagnitude( a ) > max ) {

                d3_ai_boidNormalize( a );

                a[ 0 ] *= max;
                a[ 1 ] *= max;
            }

            return a;
        }

        // @class Boids
        function Boids ( element ) {

            var position = [ 0, 0 ],
                velocity = [ 0, 0 ],
                gravityCenter = null,
                gravityMultiplier = 1,
                neighborRadius = 50,
                mouseRadius = 50,
                maxForce = 0.1,
                maxSpeed = 1,
                separationWeight = 2,
                alignmentWeight = 1,
                cohesionWeight = 1,
                desiredSeparation = 10,
                _this = this;

            this._element = element;

            this.setSize( element );

            function steerTo( target ) {
                var desired = d3_ai_boidSubtract( target, position ),
                    d = d3_ai_boidMagnitude( desired ),
                    steer;

                if ( d > 0 ) {

                    d3_ai_boidNormalize( desired );

                    // Two options for desired vector magnitude (1 -- based on distance, 2 -- maxspeed)
                    var mul = maxSpeed * ( d < 100 ? d / 100 : 1 );
                    desired[ 0 ] *= mul;
                    desired[ 1 ] *= mul;

                    // Steering = Desired minus Velocity
                    steer = d3_ai_boidSubtract( desired, velocity );
                    d3_ai_boidLimit( steer, maxForce );// Limit to maximum steering force
                } else {

                    steer = [ 0, 0 ];
                }

                return steer;
            }

            function flock( neighbors ) {
                var separation = [ 0, 0 ],
                    alignment = [ 0, 0 ],
                    cohesion = [ 0, 0 ],
                    separationCount = 0,
                    alignmentCount = 0,
                    cohesionCount = 0,
                    i = -1,
                    l = neighbors.length,
                    neighbor,
                    neighbor_position,
                    boid_distance,
                    boid_normalize,
                    neighbor_velocity,
                    size = _this.getSize();

                while (++i < l) {
                    neighbor = neighbors[ i ];

                    if ( neighbor === _this ) { continue; }

                    neighbor_position = neighbor.position();
                    boid_distance = d3_ai_boidDistance( position, neighbor_position, size.w, size.h );

                    if ( boid_distance > 0 ) {

                        if ( boid_distance < desiredSeparation ) {

                            boid_normalize = d3_ai_boidNormalize( d3_ai_boidSubtract( position.slice(), neighbor_position ) );

                            separation[ 0 ] += boid_normalize[ 0 ] / boid_distance;
                            separation[ 1 ] += boid_normalize[ 1 ] / boid_distance;
                            separationCount++;
                        }

                        if ( boid_distance < neighborRadius ) {

                            neighbor_velocity = neighbor._velocity();

                            alignment[ 0 ] += neighbor_velocity[ 0 ];
                            alignment[ 1 ] += neighbor_velocity[ 1 ];
                            alignmentCount++;

                            cohesion[ 0 ] += neighbor_position[ 0 ];
                            cohesion[ 1 ] += neighbor_position[ 1 ];
                            cohesionCount++;
                        }
                    }
                }

                if ( separationCount > 0 ) {

                    separation[ 0 ] /= separationCount;
                    separation[ 1 ] /= separationCount;
                }

                if ( alignmentCount > 0 ) {

                    alignment[ 0 ] /= alignmentCount;
                    alignment[ 1 ] /= alignmentCount;
                }

                d3_ai_boidLimit( alignment, maxForce );

                if ( cohesionCount > 0 ) {

                    cohesion[ 0 ] /= cohesionCount;
                    cohesion[ 1 ] /= cohesionCount;
                } else {

                    cohesion = position.slice();
                }

                cohesion = steerTo( cohesion );

                return [
                        separation[ 0 ] * separationWeight +
                        alignment[ 0 ] * alignmentWeight +
                        cohesion[ 0 ] * cohesionWeight,
                        separation[ 1 ] * separationWeight +
                        alignment[ 1 ] * alignmentWeight +
                        cohesion[ 1 ] * cohesionWeight
                ];
            }// flock

            // --------------------------------------------------------
            // boid

            function boid( neighbors ) {
                var acceleration = flock( neighbors),
                    size = _this.getSize();

                d3_ai_boidWrap( position, size.w, size.h );

                velocity[ 0 ] += acceleration[ 0 ];
                velocity[ 1 ] += acceleration[ 1 ];

                if (gravityCenter) {
                    //var g = d3_ai_boidGravity(gravityCenter, position, neighborRadius);
                    var g = d3_ai_boidGravity(gravityCenter, position, mouseRadius);

                    velocity[ 0 ] += g[ 0 ] * gravityMultiplier;
                    velocity[ 1 ] += g[ 1 ] * gravityMultiplier;
                }

                d3_ai_boidLimit( velocity, maxSpeed );

                position[0] += velocity[0];
                position[1] += velocity[1];

                return position;
            }//boid

            boid.position = function ( x ) {
                if (!arguments.length) { return position; }
                position = x;
                return boid;
            };

            boid._velocity = function ( x ) {
                if ( !arguments.length ) { return velocity; }
                velocity = x;
                return boid;
            };

            boid.gravityCenter = function ( x ) {
                if ( !arguments.length ) { return gravityCenter; }
                gravityCenter = x;
                return boid;
            };

            boid.gravityMultiplier = function ( x ) {
                if ( !arguments.length ) { return gravityMultiplier; }
                gravityMultiplier = x;
                return boid;
            };

            boid.neighborRadius = function ( x ) {
                if ( !arguments.length ) { return neighborRadius; }
                neighborRadius = x;
                return boid;
            };

            boid.mouseRadius = function ( x ) {
                if ( !arguments.length ) { return mouseRadius; }
                mouseRadius = x;
                return boid;
            };

            boid.maxForce = function ( x ) {
                if ( !arguments.length ) { return maxForce; }
                maxForce = x;
                return boid;
            };

            boid.maxSpeed = function ( x ) {
                if ( !arguments.length ) { return maxSpeed; }
                maxSpeed = x;
                return boid;
            };

            boid.separationWeight = function ( x ) {
                if ( !arguments.length ) { return separationWeight; }
                separationWeight = x;
                return boid;
            };

            boid.alignmentWeight = function ( x ) {
                if ( !arguments.length ) { return alignmentWeight; }
                alignmentWeight = x;
                return boid;
            };

            boid.cohesionWeight = function ( x ) {
                if ( !arguments.length ) { return cohesionWeight; }
                cohesionWeight = x;
                return boid;
            };

            boid.desiredSeparation = function ( x ) {
                if ( !arguments.length ) { return desiredSeparation; }
                desiredSeparation = x;
                return boid;
            };

            return boid;
        }

        var p = Boids.prototype;

        p.setSize = function ( element ) {
            this._w = element.width;
            this._h = element.height;
        };

        p.getSize = function () {
            var element = this._element,
                w = this._w,
                h = this._h,
                cw, ch;

            cw = element.width;
            ch = element.height;

            if ( w !== cw ) {

                this._w = cw;
            }

            if ( h !== ch ) {

                this._h = ch;
            }

            return { w: cw, h: ch };
        };

        return Boids;
    }() );

}( window ) );