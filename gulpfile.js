var fs = require('fs');
var del = require('del');
var es = require('event-stream');
var gulp = require('gulp');
var inject = require('gulp-inject');
var sitemap = require('gulp-sitemap');
var robots = require('gulp-robots');
var favicon = require('gulp-real-favicon');
var inlinesource = require('gulp-inline-source');
var htmlmin = require('gulp-htmlmin');
var htmlreplace = require('gulp-html-replace');
var imagemin = require('gulp-imagemin');
var gfonts = require('gulp-gfonts');
var minifyCSS = require('gulp-minify-css');
var cssShorthand = require('gulp-shorthand');
var uncss = require('gulp-uncss');
var concat = require('gulp-concat');

// Common pathes
var path = {
    index: './src/index.html',
    css: './src/css/**/*.css',
    fonts: './src/fonts',
    js: './src/js/**/*.js',
    images: './src/images/**/*.*',
    assets: './src/assets/**/rm-logo-border.png',
    partials: './src/partials/*.html',
    og: './src/partials/og-image.jpg',
    gh: ['CNAME', '.nojekyll'],
    favicon: {
        description: './src/favicon/faviconDescription.json',
        data: './src/favicon/faviconData.json',
    },
    dest: './www',
    url: 'https://repometric.com',
};

// Clean output
gulp.task('clean', function () {
    return del([
        path.dest + '/**/*',
    ]);
});

// Fonts
gulp.task('fonts', function () {
  return es.merge(
      gulp.src(path.fonts + '/fonts.json')
      .pipe(gfonts())
      .pipe(gulp.dest(path.dest)),
      gulp.src(['./node_modules/font-awesome/fonts/fontawesome-webfont.*'])
      .pipe(gulp.dest(path.dest + '/fonts/')));
});

// Copy static files
gulp.task('static', function () {
    return gulp.src([path.images, path.assets], {base: 'src'})
        .pipe(gulp.dest(path.dest));
});

// Minify css
gulp.task('css', function(){
    return gulp.src(['./node_modules/bootstrap/dist/css/bootstrap.min.css',
              './node_modules/font-awesome/css/font-awesome.min.css', path.css])
              .pipe(uncss({html: [path.index]}))
              .pipe(concat('styles.min.css'))
              .pipe(cssShorthand())
              .pipe(minifyCSS())
              .pipe(gulp.dest(path.dest + '/css'))
});

// Copy GitHub files
gulp.task('gh', function () {
    return gulp.src(path.gh)
        .pipe(gulp.dest(path.dest));
});

// Inject partials
gulp.task('inject', ['favicons'], function() {
    var faviconData = fs.readFileSync(path.favicon.data);
    var code = JSON.parse(faviconData).favicon.html_code;
    return gulp
        .src(path.index)
        .pipe(htmlreplace({
            'css': 'css/styles.min.css'
        }))
        .pipe(inlinesource({
            compress: false,
        }))
        .pipe(favicon.injectFaviconMarkups(code))
        .pipe(inject(gulp.src([path.partials]), {
            starttag: '<!-- inject:{{path}} -->',
            relative: true,
            transform: function (filePath, file) {
                return file.contents.toString('utf8');
            },
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            removeCommentsFromCDATA: true,
            minifyCSS: false, // skips @media & some other queries if set 'true'
            minifyJS: true,
        }))
        .pipe(gulp.dest(path.dest));
});

// Generate favicons
gulp.task('favicons', function(done) {
    var faviconDescription = JSON.parse(fs.readFileSync(path.favicon.description));
    faviconDescription.markupFile =  path.favicon.data;
    faviconDescription.dest = path.dest;
    return favicon.generateFavicon(faviconDescription, function() {
        done();
    });
});

// Generate sitemap file
gulp.task('sitemap', function() {
    return gulp
        .src(path.index)
        .pipe(sitemap({
            siteUrl: path.url,
        }))
        .pipe(gulp.dest(path.dest));
});

// Generate robots file
gulp.task('robots', function() {
    return gulp
        .src(path.index)
        .pipe(robots({
            useragent: '*',
            allow: [],
            disallow: [],
        }))
        .pipe(gulp.dest(path.dest));
});

// Copy Open Graph image
gulp.task('og', function() {
    return gulp
        .src(path.og)
        .pipe(gulp.dest(path.dest));
});

// Optimize images
gulp.task('images', ['favicons', 'inject'], function() {
    return gulp
        .src(path.dest + '/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest(path.dest));
});

// The default task (called when you run `gulp` from cli)
gulp.task('default',  [
    'static',
    'css',
    'fonts',
    'favicons',
    'sitemap',
    'robots',
    'og',
    'gh',
    'inject',
    'images',
]);
