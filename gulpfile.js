const gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	notify = require('gulp-notify'),
	del = require('del'),
	rename = require('gulp-rename'),
	ejs = require('gulp-ejs'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss = require('gulp-clean-css'),
	uglify = require('gulp-uglify'),
	minifyhtml = require('gulp-htmlmin'),
	spritesmith = require('gulp.spritesmith'),
	merge = require('merge-stream');

// 定义css 兼容前缀
const autoprefixerOpt = {
	browsers: ['IE 9', 'last 5 versions', 'Firefox 14', 'Opera 11.1', '> 10%']
};
// 雪碧图 cnofig
const spriteConfig = {
	spritesSource: './src/sprites/icon/*.png',
	spritesOpt: {
		algorithm: 'binary-tree',
		imgName: 'sprite.png',
		retinaImgName: 'sprite@2x.png',
		retinaSrcFilter: ['./src/sprites/icon/*@2x.png'],
		cssName: 'sprite.scss',
		cssFormat: 'scss',
		cssTemplate: './src/sprites/template/sprite-scss.template.handlebars',
		padding: 6
	},
	spritesOutputCssPath: './src/sprites/style/',
	spritesOutputImagePath: './src/images/'
};

gulp.task('cleanBuild', function(){
	return del(['./build/**/*']);
});

gulp.task('sprite', function(){
	let spriteData = gulp.src(spriteConfig.spritesSource)
		.pipe(spritesmith(spriteConfig.spritesOpt));
	
	let imgStream = spriteData.img.pipe(plumber({
		errorHandler: notify.onError("icon-img 任务执行失败! Error: <%= error.message %>")
	}))
		.pipe(gulp.dest(spriteConfig.spritesOutputImagePath))
		.pipe(notify("icon-img 任务执行成功!生成文件: <%= file.relative %>"));

	let cssStream = spriteData.css.pipe(plumber({
			errorHandler: notify.onError("icon-css 任务执行失败! Error: <%= error.message %>")
		}))
		.pipe(gulp.dest(spriteConfig.spritesOutputCssPath))
		.pipe(notify("icon-css 任务执行成功!生成文件: <%= file.relative %>"));

	return merge(imgStream, cssStream);
});

gulp.task('html', function(){
	return gulp.src('./src/*.html').pipe(plumber({
			errorHandler: notify.onError("html 任务执行失败! Error: <%= error.message %>")
		}))
		.pipe(ejs())
		.pipe(gulp.dest('./build'));
});

gulp.task('css', function(){
	return gulp.src('./src/css/*.scss').pipe(plumber({
			errorHandler: notify.onError("css 任务执行失败! Error: <%= error.message %>")
		}))
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer(autoprefixerOpt))
		.pipe(minifycss())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('./build/css'));
});

gulp.task('js', function(){
	return gulp.src('.src/js/*.js').pipe(plumber({
			errorHandler: notify.onError("js 任务执行失败! Error: <%= error.message %>")
		}))
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('./build/js'));
});


gulp.task('default', ['cleanBuild'], function(){
	gulp.start(['sprite', 'html', 'css', 'js'], function(){
		console.log('项目启动成功！');
	});
});