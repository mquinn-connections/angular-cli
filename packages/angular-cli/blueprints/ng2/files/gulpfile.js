'use strict';

var gulp            = require('gulp'),
    less            = require('gulp-less'),
    pug             = require('gulp-pug'),
    sourcemaps      = require('gulp-sourcemaps'),
    cache           = require('gulp-cached'),
    postcss         = require('gulp-postcss'),
    autoprefixer    = require('autoprefixer'),
    assets          = require('postcss-assets'),
    shell           = require('gulp-shell'),
    replace         = require('gulp-replace'),
    runSequence     = require('run-sequence'),
    del             = require('del'),
    argv            = require('yargs').argv,
    rename          = require('gulp-rename'),
    styleguide      = require('sc5-styleguide'),
    typedoc         = require("gulp-typedoc");


var args = (argv.prod) ? '--prod': '--dev';

global.paths = {
  'all':    './src/**/*',
  'app':    './src/app/',
  'tmp':    './dist/aot-tmp',
  'ts':     './src/app/**/!(*spec).ts',
  'less':   './src/app/**/*.less',
  'pug':    './src/app/**/*.pug',
  'docs':   './dist/docs/'
};

var styleguideOutputPath = global.paths.docs + 'styleguide/';
var typedocOutputPath = global.paths.docs + 'typedoc/';

gulp.task('styleguide:generate', function() {
  return gulp.src(global.paths.less)
    .pipe(styleguide.generate({
      title: 'ng2 Dock Living Styleguide',
      server: false,
      rootPath: styleguideOutputPath,
      overviewPath: 'README.md',
      enabledJade: true
    }))
    .pipe(gulp.dest(styleguideOutputPath));
});

gulp.task('styleguide:applystyles', function() {
  return gulp.src(global.paths.less)
    .pipe(less({
      errLogToConsole: true
    }))
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(styleguideOutputPath));
});

gulp.task('styleguide', ['styleguide:generate', 'styleguide:applystyles']);

gulp.task('typedoc', function() {
  return gulp.src(global.paths.ts)
    .pipe(typedoc({
      // TypeScript options (see typescript docs)
      "target": "es5",
      "module": "commonjs",
      "moduleResolution": "node",
      "emitDecoratorMetadata": true,
      "experimentalDecorators": true,
      "noImplicitAny": true,
      "suppressImplicitAnyIndexErrors": true,
      "isolatedModules": true,
      "excludeExternals": true,

      // Output options (see typedoc docs)
      out: typedocOutputPath,
      json: typedocOutputPath + '/typedoc.json',

      // TypeDoc options (see typedoc docs)
      name: "MyAngular2App Documentation",
      ignoreCompilerErrors: true,
      version: true
    }))
});

gulp.task('backstop:generateRef', shell.task(
  ['npm run reference'], {cwd: './node_modules/backstopjs/'}
));

gulp.task('backstop', shell.task(
  ['npm run test'], {cwd: './node_modules/backstopjs/'}
));

gulp.task('copy', function() {
  return gulp.src(global.paths.all)
    .pipe(gulp.dest(global.paths.tmp))
});

gulp.task('copy:config:aot', function() {
  return gulp.src('./aot.angular-cli.json')
    .pipe(rename('./angular-cli.json'))
    .pipe(gulp.dest('.'));
});

gulp.task('copy:config:jit', function() {
  return gulp.src('./jit.angular-cli.json')
    .pipe(rename('./angular-cli.json'))
    .pipe(gulp.dest('.'));
});

gulp.task('ts:replace', function() {
  return gulp.src(global.paths.tmp + '/**/!(*spec).ts')
    .pipe(replace('.less', '.css'))
    .pipe(replace('.pug', '.html'))
    .pipe(gulp.dest(global.paths.tmp));
});

gulp.task('typesRoot:replace', function() {
  return gulp.src(global.paths.tmp + '/tsconfig.json')
    .pipe(replace('../node_modules/', '../../node_modules/'))
    .pipe(gulp.dest(global.paths.tmp));
});

gulp.task('transpile:less', function(){
  var processors = [
    autoprefixer({browsers: ['last 1 version']}),
    assets()
  ];

  return gulp.src(global.paths.less)
    .pipe(cache('transpile:less'))
    .pipe(less())
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('/', {includeContent: true, sourceRoot: '/src/app'}))
    .pipe(gulp.dest(global.paths.tmp + '/app/'));
});

gulp.task('transpile:pug', function(){
  return gulp.src(global.paths.pug)
    .pipe(cache('transpile:pug'))
    .pipe(pug())
    .pipe(gulp.dest(global.paths.tmp + '/app/'));
});

gulp.task('clean', function (done) {
  del([global.paths.tmp]).then(function() {
    done()
  });
});

gulp.task('run:ngc', shell.task([
  '"./node_modules/.bin/ngc" -p dist/aot-tmp/aot.tsconfig.json'
]));

gulp.task('run:ng:aot', shell.task([
  'ng build -o ./dist/aot ' + args
]));

gulp.task('run:ng:jit', shell.task([
  'ng build -o ./dist/jit ' + args
]));

gulp.task('aot', function(callback){
  runSequence('copy:config:aot', 'copy', 'ts:replace', 'transpile:less', 'transpile:pug', 'run:ngc', 'typesRoot:replace', 'run:ng:aot', 'clean', callback);
});

gulp.task('jit', function(callback){
  runSequence('copy:config:jit', 'run:ng:jit', callback);
});

gulp.task('docs', ['styleguide', 'typedoc']);

gulp.task('default', ['jit']);
