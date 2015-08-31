var gulp = require('gulp');
var typescript = require('gulp-tsc');
var less = require('gulp-less');

var genericTsOptions = {tmpDir: 'src/', declaration: true, emitError: false}

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

gulp.task('default', ['buildLess', 'buildMagicBox', 'buildGrammars', 'buildAddons']);

gulp.task('buildLess', function () {
  gulp.src('less/**/*.less')
      .pipe(less())
      .pipe(gulp.dest('bin/css'));
});

gulp.task('buildMagicBox', ['copyLib'], function () {
  return gulp.src('src/MagicBox/MagicBox.ts')
      .pipe(typescript(tsOptions({'out': 'MagicBox.js'})))
      .pipe(gulp.dest('bin/js/MagicBox'))
});

gulp.task('buildGrammars', function () {
  return gulp.src('src/Grammars/*.ts')
      .pipe(typescript(tsOptions({
        pathFilter: function (path) {
          return path.indexOf('MagicBox/') == -1
        }
      })))
      .pipe(gulp.dest('bin/js/Grammars'));
});

gulp.task('buildAddons', function () {
  return gulp.src('src/Addons/*.ts')
      .pipe(typescript(tsOptions({
        pathFilter: function (path) {
          return path.indexOf('MagicBox/') == -1
        }
      })))
      .pipe(gulp.dest('bin/js/Addons'))
});

gulp.task('copyLib', function () {
  return gulp.src('lib/**')
      .pipe(gulp.dest('bin/js'))
});

gulp.task('watch', function () {
  gulp.watch('less/**/*', ['buildLess']);
  gulp.watch('src/MagicBox/**/*', ['buildMagicBox']);
  gulp.watch('src/Grammars/**/*', ['buildGrammars']);
  gulp.watch('src/Addons/**/*', ['buildAddons']);
});