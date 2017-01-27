module.exports = function(grunt) {
	grunt.initConfig({
		sass: {
			dist: {
				options: {
					style: 'expanded',
					sourcemap: 'none'
				},
				files: {
					'dist/ereader-styles/styles.css': 'src/sass/layout.scss'
				}
			}
		},

		autoprefixer: {
			options: {
				browsers: ['last 5 versions', 'ie 9', 'ie 10']
			},
			dist:{
				files:{
					'dist/ereader-styles/styles.css': 'dist/ereader-styles/styles.css'
				}
			}
		},

		watch: {
			options: {
				livereload: true
			},
			html: {
                files: [
                    'dist/ereader-html/index.html'
                ],
                options: {
                    spawn: false
                }
			},
			css: {
				files: [
                    'src/sass/**/*.scss'
                ],
				tasks: ['sass:dist', 'autoprefixer:dist'],
				options: {
					spawn: false
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', [
        'sass',
		'autoprefixer',
        'watch'
    ]);
};