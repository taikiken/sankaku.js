module.exports = function(grunt) {
  'use strict';
  var pkg = grunt.file.readJSON('package.json');
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    path: {
      source: '../_dev',
      publish: '../examples'
    },
    // bower compornents copy
    bower: {
      install: {
        options: {
          targetDir: '<%= path.source %>/lib',
          layout: 'byComponent',
          install: true, //grunt実行時にbower installを実行
          verbose: true, // ログの詳細を出す
          cleanTargetDir: false, // targetDirを削除
          cleanBowerDir: false // bowerのcomponentsディレクトリを削除
        }
      }
    },
    // watch
    watch: {
      options: {
        livereload: true
      },
      html: {
        files: [
          '<%= path.publish %>/**/*.html',
          '<%= path.publish %>/*.html'
        ],
        tasks: []
      },
      css: {
        files: [
          '<%= path.source %>/**/*.scss'
        ],
        tasks: 'css'
      },
      // js: {
      //   files: [
      //   'Gruntfile.js'
      //     // '<%= path.publish %>/**/*.js'
      //   ],
      //   tasks: 'js'
      // },
      // scripts: {
      //   files: [
      //     'Gruntfile.js',
      //     '<%= path.source %>/**/*.js'
      //     // '<%= path.source %>/lib/js/heightLine/jquery.heightLine.js',
      //     // '<%= path.source %>/js/main.js',
      //     // '<%= path.source %>/js/common.js'
      //   ],
      //   tasks: 'uglify',
      //   options: {
      //     event: [
      //       'changed',
      //       'added'
      //     ]
      //   }
      // }
    },
    // Compass
    compass: {
      dev: {
        options: {
          config: './sass_setting/config.rb',
          environment: 'development'
        }
      },
      dist: {
         options: {
           config: './sass_setting/config.rb',
           environment: 'production',
           force: true
         }
      }
    },
    // clean
    clean: {
      build: {
        options: {
          force: true
        },
        src: [
          // 'htdocs/.sass-cache',
          '<%= path.publish %>/**/_*.html',
          '<%= path.publish %>/**/*.css.map',
          '<%= path.publish %>/**/sprite-***********.png',
          '<%= path.publish %>/**/**-sprite-***********.png',
          '<%= path.publish %>/js/lib/foundation'
        ]
      }
    },
    // concat
    // concat: {
    //   vendor: {
    //     src: [
    //       '<%= path.source %>/lib/inazumatv.util.js/inazumatv.util-0.9.2.min.js',
    //       '<%= path.source %>/lib/bxslider/js/jquery.bxSlider.min.js'
    //     ],
    //     dest: '<%= path.publish %>/js/lib/vendor/vendor.min.js'
    //   }
    // },
    // JS minify
    // uglify: {
    //   options: {
    //     preserveComments: 'some'
    //   },
    //   dist: {
    //     files: {
    //       // '<%= path.source %>/lib/js/heightLine/jquery.heightLine.min.js': ['<%= path.source %>/lib/js/heightLine/jquery.heightLine.js'],
    //       // '<%= path.publish %>/js/lib/util/matchMedia.min.js': ['<%= path.source %>/lib/js/util/matchMedia.js'],
    //       '<%= path.publish %>/js/common.min.js': ['<%= path.source %>/js/common.js'],
    //       // 個別JavaScript
    //       '<%= path.publish %>/js/index.min.js': ['<%= path.source %>/js/index.js']
    //     }
    //   }
    // },
    // copy
    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= path.source %>/lib',
            src: [
              // lib
                '**/sagen.js/sagen.min.js',
                '**/jquery/*'
                // '**/fancybox/*',
                // '**/inazumatv.util.js/inazumatv.util.min.js',
            ],
            dest: '<%= path.publish %>/js/lib',
            filter: 'isFile'
          }
        ]
      }
    },
    lineending: {
      dist: {
        options: {
          eol: 'lf',
          overwrite: true
        },
        files: {
          '': ['<%= path.publish %>/**/*.css']
        }
      },
      build: {
        options: {
          eol: 'lf'
        },
        files: [{
          expand: true,
          cwd: '<%= path.publish %>',
          src: ['**/*.css'],
          dest: '<%= path.publish %>',
          // filter: 'isFile'
        }]
      }
    },
    // image optim
    imageoptim: {
      dist: {
        options: {
          imageAlpha: false,
          jpegMini: false,
          quitAfter: true
        },
        src: [
          '<%= path.publish %>/**/img'
        ]
      },
      build: {
        options: {
          imageAlpha: false,
          jpegMini: false,
          quitAfter: true
        },
        src: [
          '<%= path.publish %>/**/sprite.png',
          '<%= path.publish %>/**/**-sprite.png',
        ]
      }
    }
  });// end grunt.initConfig

  // plugins
  var taskNames;
  for(taskNames in pkg.devDependencies) {
    if(taskNames.substring(0, 6) == 'grunt-') {
      grunt.loadNpmTasks(taskNames);
    }
  }

  // regist tasks
  // grunt.registerTask('js', ['concat', 'uglify']);
  grunt.registerTask('css', ['compass:dev', 'lineending:dist']);
  grunt.registerTask('new_line', ['lineending:build']);

  // Build
  grunt.registerTask('build', ['compass:dist', 'clean:build', 'lineending:build', 'imageoptim:build']);

  // Watch
  grunt.registerTask('default', ['copy', 'watch']);
};