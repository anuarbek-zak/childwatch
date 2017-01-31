'use strict';

var gulp  = require('gulp'),
    concatCss = require('gulp-concat-css'),
    // minifyCSS = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    less = require('gulp-less'),
    del = require('del'),
    newer  = require('gulp-newer'),
    path = require('path'),
    remember = require('gulp-remember'),
    wiredep = require('wiredep').stream,
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    gutil = require("gulp-util"),
    plumber = require('gulp-plumber'),
    // uglify = require('gulp-uglify'),
    combiner = require('stream-combiner2'),
    concat = require('gulp-concat');

var isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV=='development';

gulp.task('bower',function () {
    return gulp.src('frontend/index.html')
        .pipe(wiredep())
        .pipe(gulp.dest('public/'));
});


gulp.task('styles',function () {
   var combined = combiner.obj([
       gulp.src('frontend/**/*.less',{since: gulp.lastRun('styles')})
       .pipe(plumber())
       .pipe(less())
       .on('error', function(err){
           gutil.log(gutil.colors.red('ERROR', 'styles'), err.message);
           gutil.beep();
           new gutil.PluginError('styles', err, {showStack: true})
        })
       .pipe(remember('styles'))
       .pipe(plumber())
       .pipe(autoprefixer())
       .on('error', function(err){
           gutil.log(gutil.colors.red('ERROR', 'styles'), err.message);
           gutil.beep();
           new gutil.PluginError('styles', err, {showStack: true})
           this.emit('end');
       })
       .pipe(concatCss("index.css"))
       // .pipe(minifyCSS())
       .pipe(gulp.dest('public'))
   ]);

    combined.on('error',console.error.bind(console));
    return combined;
});

gulp.task('scripts',function () {
   return gulp.src(['frontend/**/*.js'],{since: gulp.lastRun('scripts')})
       .pipe(remember('scripts'))
       .pipe(concat("index.js"))
       // .pipe(uglify())
       .pipe(gulp.dest('public'));
});

gulp.task('clean',function () {
    return del('public');
});

gulp.task('files',function () {
    return gulp.src(['frontend/**','!frontend/**/*.less','!frontend/**/*.js'])
        .pipe(newer('public'))
        .pipe(gulp.dest('public'));
});

gulp.task('watch',function () {
    gulp.watch('frontend/**/*.less',gulp.series('styles')).on('unlink',function (filepath) {
        remember.forget('styles',path.resolve(filepath));
    });
    gulp.watch('frontend/**/*.js',gulp.series('scripts')).on('unlink',function (filepath) {
        remember.forget('scripts',path.resolve(filepath));
    });
    gulp.watch(['frontend/**','!frontend/index.html','!frontend/**/*.less','!frontend/**/*.js'],gulp.series('files'));
    gulp.watch(['bower.json','frontend/index.html'],gulp.series('bower'));
});

gulp.task('build', gulp.series('clean','styles','scripts','files','bower'));
gulp.task('default', gulp.series('build','watch'));
