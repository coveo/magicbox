var gulp = require('gulp');
var typescript = require('gulp-tsc');
var through2 = require('through2');
var _ = require('underscore');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var less = require('gulp-less');
var path = require("path");

gulp.task('default', ['buildLess', 'buildClient', 'buildServer', 'buildTemplate']);

gulp.task('buildLess', function () {
  gulp.src('src/less/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('target/css'));
});

gulp.task('buildClient', function () {
  return gulp.src('src/client/Main.ts')
    .pipe(typescript({'out': 'Main.js', sourcemap:true, sourceRoot: '../ts', declaration: true, emitError: false}))
    .pipe(gulp.dest('target/client'))
});

gulp.task('buildServer', function () {
  return gulp.src('src/server/Main.ts')
    .pipe(typescript({declaration: true}))
    .pipe(gulp.dest('target/server'))
});

gulp.task('buildTemplate', function () {
  gulp.src('src/templates/**/*.ejs')
    .pipe(through2.obj(function (file, enc, callback) {
      if (file.isNull()) {
        return callback(null, file);
      }
      var content = file.contents.toString();
      try {
        var compiled = _.template(content).source;
        file.contents = new Buffer(compiled);
      }catch(e){
        console.log(e);
      }
      file.path = path.join(file.base, path.relative(file.base, file.path).split(path.sep).join('_'));
      return callback(null, file);
    }))
    .pipe(declare({
      namespace: 'Templates',
      noRedeclare: true
    }))
    .pipe(concat('templates.js'))
    //.pipe(uglify())
    .pipe(gulp.dest('target/client'));
});

gulp.task('watch', function () {
  gulp.watch('src/less/**/*', ['buildLess']);
  gulp.watch('src/client/**/*', ['buildClient']);
  gulp.watch('src/server/**/*', ['buildServer']);
  gulp.watch('src/templates/**/*', ['buildTemplate']);
});