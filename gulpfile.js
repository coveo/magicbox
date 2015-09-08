var path = require('path');
var gulp = require('gulp');
var typescript = require('gulp-tsc');
var less = require('gulp-less');
var jasmine = require('gulp-jasmine-phantom');
var addsrc = require('gulp-add-src');
var concat = require('gulp-concat');
var foreach = require('gulp-foreach');

var genericTsOptions = { tmpDir: 'bin/js', declaration: true }

var tsOptions = function (options) {
  if (options == null) {
    return genericTsOptions;
  }
  var keys = Object.keys(genericTsOptions);
  keys.forEach(function (key) {
    if (options[key] == null) {
      options[key] = genericTsOptions[key];
    }
  })
  return options;
};

gulp.task('default', ['buildLess', 'buildMagicBox', 'buildGrammars', 'buildAddons', 'test']);

gulp.task('buildLess', function () {
  var task = gulp.src('less/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('bin/css'));
  return task;
});

gulp.task('buildMagicBox', ['copyLib'], function () {
  return gulp.src('src/MagicBox/MagicBox.ts')
    .pipe(typescript(tsOptions({ 'out': 'MagicBox.js' })))
    .pipe(gulp.dest('bin/js/MagicBox/'))
});

gulp.task('buildGrammars', ['buildMagicBox'], function () {
  return gulp.src('src/Grammars/*.ts')
    .pipe(foreach(function (stream, file) {
      return stream.pipe(typescript(tsOptions({
        'out': path.basename(file.path, '.ts') + '.js'
      })));
    }))
    .pipe(gulp.dest('bin/js/Grammars/'));
});

gulp.task('buildAddons', ['buildMagicBox'], function () {
  return gulp.src('src/Addons/*.ts')
    .pipe(foreach(function (stream, file) {
      return stream.pipe(typescript(tsOptions({
        'out': path.basename(file.path, '.ts') + '.js'
      })));
    }))
    .pipe(gulp.dest('bin/js/Addons'))
});

gulp.task('copyLib', function () {
  return gulp.src('lib/**')
    .pipe(gulp.dest('bin/js/'))
});

gulp.task('buildTest', ['buildMagicBox', 'buildGrammars', 'buildAddons'], function () {
  return gulp.src('test/*.ts')
    .pipe(typescript({
      declaration: false,
    }))
    .pipe(concat('test.js'))
    .pipe(gulp.dest('bin/'))
});

gulp.task('test', ['buildTest'], function () {
  return gulp.src([
    'node_modules/underscore/underscore.js',
    'node_modules/jquery/dist/jquery.js',
    'bin/js/MagicBox/MagicBox.js',
    'bin/js/Grammars/*.js',
    'bin/js/Addons/*.js',
    'bin/test.js'
  ]).pipe(jasmine({
    integration: true
  }));
});

gulp.task('watch', function () {
  gulp.watch('less/**/*', ['buildLess']);
  gulp.watch('src/MagicBox/**/*', ['buildMagicBox']);
  gulp.watch('src/Grammars/**/*', ['buildGrammars']);
  gulp.watch('src/Addons/**/*', ['buildAddons']);
});