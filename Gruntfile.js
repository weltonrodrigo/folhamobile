/**
 * Created by weltonnascimento on 22/06/14.
 */

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        aws: grunt.file.readJSON('/Users/weltonnascimento/.grunt-aws.json'),
        uglify: {
            upload: {
                files: {
                    'js/main.min.js': [
                        'bower_components/jquery/jquery.min.js',
                        'bower_components/jquery-mobile-bower/js/jquery.mobile-1.4.2.min.js',
                        'bower_components/mustache/mustache.js',
                        'bower_components/simpleStorage/simpleStorage.js',
                        'bower_components/client-js/dist/importio.js',
                        'js/main.js'
                    ]
                }
            }
        },
        s3: {
            options: {
                key: '<%= aws.key %>',
                secret: '<%= aws.secret %>',
                bucket: '<%= aws.bucket %>',
                access: 'public-read',
                headers: {
                    // Two Year cache policy (1000 * 60 * 60 * 24 * 730)
                    "Cache-Control": "max-age=630720000, public",
                    "Expires": new Date(Date.now() + 63072000000).toUTCString()
                },
                gzip: true
                //debug: true
            },
            dev: {
                // These options override the defaults
                options: {
                    //encodePaths: true,
                    maxOperations: 20
                },
                sync: [
                    {
                        src: 'bower_components/**/*.*',
                        dest: 'bower_components/',
                        rel: 'bower_components',
                        options: {
                            gzip: true,
                            gzipExclude: ['.jpg', '.jpeg', '.png', '.gif', '.woff', '.wav', '.webp']
                        }
                    }
                ],
                // Files to be uploaded.
                upload: [
                    {
                        src: 'index.html',
                        dest: 'index.html'
                    },
                    {
                        src: 'js/*.js',
                        dest: 'js'
                    }
                ]
            }

        }

    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-s3');

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 's3']);

};