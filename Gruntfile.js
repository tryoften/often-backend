'use strict';

module.exports = function (grunt) {
	// Show elapsed time at the end
	require('time-grunt')(grunt);

	// Load all grunt tasks
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
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
							['tsify', {target: 'ES5', noImplicitAny: false}]
						],
						debug: true,
						sourceType: 'module'
					},
					exclude: ['coffee-script', 'iced-coffee-script',
						'yaml', 'js-yaml', 'toml', 'cson',
						'hjson', 'properties', 'vows'],
					watch: true
				},
				src: ['typings/tsd.d.ts', 'app/Views/main.tsx'],
				dest: 'client/app.js'
			}
		},

		serve: {
			options: {
				port: 8888
			},
			path: 'public/'
		},

		watch: {
			typescript: {
				files: ['app/**/*.ts', 'app/**/*.tsx'],
				tasks: ['browserify:client']
			}
		}
	});

	grunt.registerTask('default', ['babel:dist']);
	grunt.registerTask('client', ['browserify:client', 'serve']);
};
