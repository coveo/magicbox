var gulp = require('gulp');
var ts = require('gulp-typescript');
var less = require('gulp-less');
var jasmine = require('gulp-jasmine-phantom');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var runSequence = require('gulp-run-sequence');
var merge = require('merge2');
ts.reporter.longReporter();


gulp.task('default', function () {
  return runSequence(['buildLess', 'buildMagicBox'], ['test', 'uglify']);
});

gulp.task('buildLess', function () {
  return gulp.src('less/**/*.less')
      .pipe(less())
      .pipe(gulp.dest('bin/css'));
});

gulp.task('buildMagicBox', ['copyLib'], function () {
  var result = gulp.src('src/MagicBox.ts')
      .pipe(ts({
        noEmitOnError: true,
        declaration: true,
        out: 'bin/MagicBox.js'
      }));
  return merge([
    result.dts.pipe(concat('MagicBox.d.ts')).pipe(gulp.dest('bin/')),
    result.js.pipe(concat('MagicBox.js')).pipe(gulp.dest('bin/'))
  ]);
});


gulp.task('uglify', function () {
  return gulp.src('bin/MagicBox.js')
      .pipe(concat('MagicBox.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('bin/'))
});

gulp.task('copyLib', function () {
  return gulp.src('lib/**')
      .pipe(gulp.dest('bin/'))
});

gulp.task('buildTest', function () {
  return gulp.src('test/*.ts')
      .pipe(ts({noEmitOnError: true}))
      .pipe(concat('test.js'))
      .pipe(gulp.dest('bin/'))
});

gulp.task('test', ['buildTest'], function () {
  return gulp.src([
    'node_modules/underscore/underscore.js',
    'node_modules/jquery/dist/jquery.js',
    'bin/MagicBox.js',
    'bin/test.js'
  ]).pipe(jasmine({
    integration: true
  }));
});

gulp.task('watch', function () {
  gulp.watch('less/**/*', ['buildLess']);
  gulp.watch('src/**/*', ['buildMagicBox']);
  gulp.watch('test/*.ts', ['buildTest']);
});