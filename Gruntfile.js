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
					browserifyOptions: {
						plugin: [
							['tsify', {target: 'ES5', noImplicitAny: true}]
						],
						debug: true,
						sourceType: 'module'
					},
					exclude: ['coffee-script', 'iced-coffee-script', 'yaml']
				},
				src: ['typings/tsd.d.ts', 'app/Views/Components/AppView.tsx'],
				dest: 'client/app.js'
			}
		},

		serve: {
			options: {
				port: 8888
			},
			path: 'public/'
		},

		typescript: {
			web: {
				src: ['app/**/*.ts'],
				dest: 'client/app.js',
				options: {
					module: 'amd',
					noImplicitAny: false,
					remoceComments: true,
					preserveConstEnums: true,
					jsx: "React",
					moduleResolution: "node",
					target: "es5",
					references: [
						"typings/**/*.d.ts"
					]
				}
			}
		},

		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: ['jshint:gruntfile']
			},
			js: {
				files: '<%= jshint.js.src %>',
				tasks: ['jshint:js']
			},
			typescript: {
				files: ['app/**/*.ts', 'app/**/*.tsx'],
				tasks: ['browserify:client']
			}
		}
	});

	grunt.registerTask('default', ['babel:dist']);
	grunt.registerTask('client', ['browserify', 'serve']);
};
