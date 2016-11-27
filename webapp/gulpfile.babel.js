'use strict';

import gulp from 'gulp';
import plugins from 'gulp-load-plugins';
import bowserSync, {reload} from 'browser-sync';
import del from 'del';
import config from './config.babel.js';

const $ = plugins();

const entryPaths = {
	html: './page/html/**/*.html',
	js: './page/js/logic/**/*.js',
	css: './page/less/**/*.less',
	img: './page/img/**/*.*'
};

const outputPaths = {
	tmp: './temporary/',
	dev: './dev',
	build: './build'
};

gulp.task('clean', del.bind(null, ['page/temporary', 'dev', 'build']));

gulp.task('less', () => {
	return gulp.src(entryPaths.css)
		.pipe($.less())
		.pipe(gulp.dest('./page/css'))
		.pipe(reload({
			stream: true
		}))
});

gulp.task('img:headFoot', () => {
	const images = config.headFoot.map(component => {
		return `${component}/img/**/*.*`;
	});

	return gulp.src(images)
		.pipe(gulp.dest('./dev/img'));
});

gulp.task('img', ['img:headFoot'], () => {
	return gulp.src(entryPaths.img)
		.pipe(gulp.dest('./dev/img'));
});


gulp.task('html:headFoot', ['img'], () => {
	const utilSrcs = [];
	let task = gulp.src(entryPaths.html);

	for (let utilSrc of config.headFoot) {
		utilSrcs.push(`${utilSrc}/**/*.css`);
		utilSrcs.push(`${utilSrc}/**/*.js`);
	}

	return task.pipe($.inject(gulp.src(utilSrcs, {read: false}), {relative: true}))
		.pipe($.fileInclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(gulp.dest('./page/temporary'))
});

gulp.task('html:build', ['less', 'html:headFoot'], () => {
	return gulp.src('./page/temporary/*.html')
		.pipe($.useref())
		.pipe($.if('*.js', $.uglify()))
		.pipe($.if('*.css', $.minifyCss({
			compatibility: '*'
		})))
		.pipe(gulp.dest('./dev'))
});

//添加cdn
gulp.task('cdnUrl', ['cdn'], () => {
	if (config.cdnUrl) {
		return gulp.src('./cdn/*.html')
			.pipe($.cdnizer({
				defaultCDNBase: config.cdnUrl || '.',
				allowRev: true,
				allowMin: true,
				files: ['js/*.js', 'css/*.css', 'img/*.{gif,png,jpg,jpeg}', '../img/**/*.{gif,png,jpg,jpeg}']
			}))
			.pipe(gulp.dest('./cdnUrl'))
	} else {

	}
});

/**加后缀处理压缩*/
gulp.task('build', ['html:build'], () => {
	const revall = new $.revAll({
		dontRenameFile: ['.html', /\/static/g],
		dontUpdateReference: [/\/static/g]
	});
	return gulp.src('./dev/**/*.*')
		.pipe(revall.revision())
		.pipe(gulp.dest('./build'))
});


/**开发模式启用dev*/
gulp.task('dev', ['less', 'html:headFoot'], () => {
	return gulp.src('./page/temporary/*.html')
		.pipe($.useref())
		.pipe(gulp.dest('./dev'))
		.pipe(reload({
			stream: true
		}))
});

gulp.task('serve', ['dev'], () => {
	bowserSync.init({
		server: {
			baseDir: ['./page'],
			directory: true
		}
	});

	gulp.watch('./page/less/**/*.*', ['less']);
	gulp.watch('./page/html/**/*.*', ['html:headFoot']);
});



