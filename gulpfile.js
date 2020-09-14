const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
	.pipe(csso())
	.pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

const reload = (done) => {
	server.reload();
	done();
}

// Watcher

const watcher = () => {
  gulp.watch("*.html", gulp.series(reload));
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}


// Images

const images = () => {
	return gulp.src("source/img/**/*.{jpg,png,svg}")
		.pipe(imagemin([
		imagemin.optipng({optimizationLevel: 3}),
		imagemin.jpegtran({progressive: true}),
		imagemin.svgo()
	]))
}

// Webp

const createWebp = () => {
	return gulp.src("source/img/**/*.{png,jpg}")
		.pipe(webp({quality: 90}))
		.pipe(gulp.dest("source/img"))
}

exports.webp = createWebp;


// Sprite

const sprite = () => {
	return gulp.src("source/img/**/icon-*.svg")
		.pipe(svgstore())
		.pipe(rename("sprite.svg"))
		.pipe(gulp.dest("source/img"))
}

exports.sprite = sprite;

// Build

const copy = () => {
	return gulp.src([
	"source/fonts/**/*.{woff,woff2}",
	"source/img/**",
	"source/*.ico",
	"source/*.html"
], {
		base: "source"
	})
	.pipe(gulp.dest("build"));
};

exports.copy = copy;

// Del

const clean = () => {
	return del("build");
}

exports.clean = clean;

// Run build

const build = gulp.series (
		clean,
		copy,
		styles,
		sprite
);

exports.default = gulp.series(
  build, server, watcher
);

exports.build = build;

