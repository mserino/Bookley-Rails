var gulp, sass, sourcemaps, browserify, coffeeify, source, util, watchify, _;

gulp = require('gulp');
util = require('gulp-util');
watchify = require('watchify');
sass = require('gulp-sass');
sourcemaps = require('gulp-sourcemaps');
browserify = require('browserify');
coffeeify = require('coffeeify');
source = require('vinyl-source-stream');
_ = require('lodash');

function browserifyInstance(fileName, userOpts) {
  if(!userOpts) {
    userOpts = {};
  }

  var defaultOpts = {
    extensions: ['.coffee', '.js']
  };

  return browserify(fileName, _.assign(defaultOpts, userOpts))
}

gulp.task('watch', ['watch-sass', 'watch-scss', 'watch-coffee']);

gulp.task('watch-sass', function() {
  gulp.watch('app/assets/stylesheets/**/*.sass', ['compile-sass']);
});

gulp.task('watch-scss', function() {
  gulp.watch('app/assets/stylesheets/**/*.scss', ['compile-scss']);
});

gulp.task('watch-coffee', function() {
  var watchBrowserify = watchify(browserifyInstance('./app/assets/javascripts/application.coffee', _.assign(watchify.args, { debug: true })));

  var updateOnChange = function() {
    return watchBrowserify
     .bundle()
     .on('error', util.log.bind(util, 'Browserify Error'))
     .pipe(source('bundle.js'))
     .pipe(gulp.dest('public/assets'));
  };

  watchBrowserify
    .transform('coffeeify')
    .on('log', util.log)
    .on('update', updateOnChange)
  updateOnChange();
});

gulp.task('default', ['compile-sass', 'compile-scss', 'compile-coffee']);

gulp.task('compile-sass', function() {
  gulp.src('app/assets/stylesheets/**/*.sass')
      .pipe(sourcemaps.init())
      .pipe(sass({ indentedSyntax: true, errLogToConsole: true }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('public/assets'));
});

gulp.task('compile-scss', function() {
  gulp.src('app/assets/stylesheets/**/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({ indentedSyntax: false, errLogToConsole: true }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('public/assets'));
});

gulp.task('compile-coffee', function() {
  var stream = browserifyInstance('./app/assets/javascripts/application.coffee',
    { debug: true /* enables source maps */ }
  )
  .transform('coffeeify')
   .bundle();

  stream.pipe(source('bundle.js'))
        .pipe(gulp.dest('public/assets'));
});
