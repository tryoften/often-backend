'use strict';
module.exports = function (grunt) {
  // Show elapsed time at the end
  require('time-grunt')(grunt);
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        node: true,
        esnext: true,
        debug: true
      },
      gruntfile: {
        src: ['Gruntfile.js']
      },
      js: {
        src: ['app/**/*.js']
      }
    },
    babel: {
      options: {
        sourceMap: true
      },
      dist: {
        files: [{
            "expand": true,
            "cwd": "app/",
            "src": ["**/*.js"],
            "dest": "build/",
            "ext": ".js"
        }]
      }
    },
    mochacli: {
      options: {
        reporter: 'nyan',
        bail: true
      },
      all: ['test/*.js']
    },

    browserify: {
      client: {
        options: {
          transform: [["babelify", { "stage": 0 }]],
          browserifyOptions: {
            debug: true
          }
        },
        src: ['app/**/*.js'],
        dest: 'public/app.js'
      },
      watch: {
        options: {
          transform: [["babelify", { "stage": 0 }]],
          browserifyOptions: {
            debug: true,
            watch: true
          }
        },
        src: ['app/**/*.js'],
        dest: 'public/app.js'
      }
    },

    serve: {
      options: {
        port: 8888
      },
      path: 'public/'
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      js: {
        files: '<%= jshint.js.src %>',
        tasks: ['jshint:js', 'browserify:client']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'mochacli']
      },
      babel: {
        files: 'app/**/*.js',
        tasks: ['browserify:watch', 'babel:dist']
      }
    }
  });

  grunt.registerTask('default', ['babel:dist']);
  grunt.registerTask('client', ['browserify', 'serve']);
  grunt.registerTask('watch', ['watch:babel']);

};
