'use strict';

import gulp from 'gulp';
import plugins from 'gulp-load-plugins';
import bowserSync ,{reload} from 'browser-sync';
import del from 'del';
import config from './config.babel.js';
const $=plugins();

gulp.task('clean',del.bind(null,['.tmp','dist','cdn']));

gulp.task('sass',()=>{
    return gulp.src('./sass/**/*.scss')
    .pipe($.sass())
    .pipe(gulp.dest('./css'))
});

gulp.task('img:headFoot', () => {
    const images = config.headFoot.map(component => {
        return `${component}/img/**/*.*`;
    });

    return gulp.src(images)
        .pipe(gulp.dest('dist/img'));
});

gulp.task('img', ['img:headFoot'], () => {
    return gulp.src('img/**/*')
        .pipe(gulp.dest('dist/img'));
});

gulp.task('test',['sass','html:headFoot'],()=>{
   return gulp.src('./.tmp/*.html')
    .pipe($.useref())
    .pipe(gulp.dest('./dist'))
    .pipe(reload({
           stream:true
       }))
});

gulp.task('serve',['test'],()=>{
    bowserSync.init({
        server:{
            baseDir:['.','./dist']
        }
    });

    gulp.watch('./**/*.*',['test']);
});

gulp.task('html:headFoot',['img'],()=>{
    const utilSrcs=[];let task=gulp.src('./html/*.html');

    for(let utilSrc of config.headFoot){
        utilSrcs.push(`${utilSrc}/**/*.css`);
        utilSrcs.push(`${utilSrc}/**/*.js`);
    }

    return task.pipe($.inject(gulp.src(utilSrcs, {read: false}), {relative: true}))
        .pipe($.fileInclude({
            prefix:'@@',
            basepath:'@file'
        }))
        .pipe(gulp.dest('./.tmp'))
});

gulp.task('html:build',['html:headFoot'],()=>{
   return gulp.src('./.tmp/*.html')
    .pipe($.useref())
    .pipe($.if('*.js',$.uglify()))
    .pipe($.if('*.css',$.minifyCss({
           compatibility: '*'
       })))
    .pipe(gulp.dest('./dist'))
});

gulp.task('cdn',['html:build'],()=>{
    const revall=new $.revAll({
        dontRenameFile:['.html']
    });
    return gulp.src('./dist/**/*.*')
    .pipe(revall.revision())
    .pipe(gulp.dest('./cdn'))
    .pipe(revall.manifestFile())
    .pipe(gulp.dest('./cdn'))
});

/**加后缀处理压缩*/
gulp.task('cdn:src',['cdn'],()=>{
   return gulp.src('./cdn/*.json','./cdn/html/*.html')
    .pipe(gulp.dest('./cdn/html'))
});



