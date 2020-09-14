const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("csso");
const rename = require("rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("svg-store");
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
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'source'
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
  gulp.watch("source/less/**/*.less", gulp.series("styles", "reload"));
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
	"source/*.ico"
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





// Run build

const gulp = require("gulp");

const build = () => gulp.series (
		"clean",
		"copy",
		"css",
		"sprite",
		"html"
);

exports.default = gulp.series(
  styles, server, watcher
);