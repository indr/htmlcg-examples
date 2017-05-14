'use strict';

var connect = require('gulp-connect');
var del = require('del');
var fs = require('fs');
var gnunjucks = require('gulp-nunjucks');
var gulp = require('gulp');
var nunjucks = require('nunjucks');
var rename = require('gulp-rename');
var usemin = require('gulp-usemin');
var zip = require('gulp-zip');

var dir = {
  src: './src',
  build: './build',
  dist: './dist'
};

gulp.task('clean', function () {
  del.sync([ dir.build, dir.dist ]);
});

gulp.task('build', [ 'clean', 'compile' ], function () {
  return gulp.src([
    dir.src + '/images/*',
    dir.src + '/fonts/*'
  ], { base: dir.src }).pipe(gulp.dest(dir.build));
});

gulp.task('compile', function () {
  var pkg = JSON.parse(fs.readFileSync('./package.json'));
  gulp.src([ dir.src + '/*.html', dir.src + '/*.html.njk' ])
    .pipe(gnunjucks.compile({ title: `${pkg.name} ${pkg.version}` }, {
      env: new nunjucks.Environment(new nunjucks.FileSystemLoader(dir.src))
    }))
    .pipe(rename(function (path) {
      if (path.extname === '.njk') path.extname = path.extname.replace(/.njk$/, '');
    }))
    .pipe(usemin())
    .pipe(gulp.dest(dir.build))
    .pipe(connect.reload());
});

gulp.task('serve', [ 'build' ], function () {
  connect.server({
    port: 4200,
    root: dir.build,
    livereload: true
  });
  gulp.watch([ dir.src + '/**/*' ], [ 'compile' ]);
});

gulp.task('dist', [ 'build' ], function () {
  var pkg = JSON.parse(fs.readFileSync('./package.json'));
  gulp.src([ dir.build + '/**/*' ])
    .pipe(zip(`${pkg.name}-${pkg.version}.zip`))
    .pipe(gulp.dest(dir.dist));
});

gulp.task('default', [ 'dist' ]);
