var fs = require('fs');
var del = require('del');
var gulp = require('gulp');
var inject = require('gulp-inject');
var sitemap = require('gulp-sitemap');
var robots = require('gulp-robots');
var favicon = require('gulp-real-favicon');
var inlinesource = require('gulp-inline-source');

// Common pathes
var path = {
  index: './src/index.html',
  css: './src/css/**/*.css',
  js: './src/js/**/*.js',
  images: './src/images/**/*.*',
  assets: './src/assets/**/rm-logo-border.png',
  partials: './src/partials/*.html',
  og: './src/partials/og-image.jpg',
  gh: ['CNAME', '.nojekyll'],
  favicon: {
    description: './src/favicon/faviconDescription.json',
    data: './src/favicon/faviconData.json'
  },
  dest: './www',
  url: 'https://repometric.com'
};

// Clean output
gulp.task('clean', function () {
  return del([
    path.dest + '/**/*',
  ]);
});

// Copy static files
gulp.task('static', function () {
  return gulp
    .src([path.images, path.assets], {base: 'src'})
    .pipe(gulp.dest(path.dest));
});

// Copy GitHub files
gulp.task('gh', function () {
  return gulp
    .src(path.gh)
    .pipe(gulp.dest(path.dest));
});

// Inject partials
gulp.task('inject', ['favicons'], function() {
  var faviconData = fs.readFileSync(path.favicon.data);
  var code = JSON.parse(faviconData).favicon.html_code;
  return gulp
    .src(path.index)
    .pipe(favicon.injectFaviconMarkups(code))
    .pipe(inject(gulp.src([path.partials]), {
      starttag: '<!-- inject:{{path}} -->',
      relative: true,
      transform: function (filePath, file) {
        return file.contents.toString('utf8')
      }
    }))
    .pipe(inlinesource({
      compress: true
    }))
    .pipe(gulp.dest(path.dest));
});

// Generate favicons
gulp.task('favicons', function(done) {
  var faviconDescription = JSON.parse(fs.readFileSync(path.favicon.description));
  faviconDescription.markupFile =  path.favicon.data;
  faviconDescription.dest =  path.dest;  
	return favicon.generateFavicon(faviconDescription, function() {
		done();
	});
});

// Generate sitemap file
gulp.task('sitemap', function() {
  return gulp
    .src(path.index)
    .pipe(sitemap({
      siteUrl: path.url
    }))
    .pipe(gulp.dest(path.dest));;
});

// Generate robots file
gulp.task('robots', function() {
  return gulp
    .src(path.index)
    .pipe(robots({
      useragent: '*',
      allow: [],
      disallow: []
    }))
    .pipe(gulp.dest(path.dest));;
});

// Copy Open Graph image
gulp.task('og', function() {
  return gulp
    .src(path.og)
    .pipe(gulp.dest(path.dest));
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', [
  'clean',
  'static',
  'favicons',
  'sitemap',
  'robots',
  'og',
  'gh',
  'inject'
]);
