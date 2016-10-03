'use strict';

var gulp            = require('gulp'),
    less            = require('gulp-less'),
    pug             = require('gulp-pug'),
    sourcemaps      = require('gulp-sourcemaps'),
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
    typedoc         = require("gulp-typedoc"),
    bump            = require('gulp-bump'),
    zip             = require('gulp-zip'),
    fs              = require('fs'),
    json            = JSON.parse(fs.readFileSync('./package.json')),
    git             = require('gulp-git'),
    typescript      = require('gulp-typescript'),
    tsProject       = typescript.createProject('./src/lib.tsconfig.json'),
    merge           = require('merge2'),
    rollup          = require('gulp-rollup'),
    uglify          = require('gulp-uglify'),
    ng2Template     = require('gulp-inline-ng2-template'),
    jsonTransform   = require('gulp-json-transform'),
    jsonFormat      = require('gulp-json-format'),
    tar             = require('gulp-tar'),
    gzip            = require('gulp-gzip'),
    scp             = require('gulp-scp2');

global.paths = {
  'all':    './src/**/*',
  'ts':     './src/app/**/!(*spec).ts',
  'less':   './src/app/**/*.less',
  'pug':    './src/app/**/*.pug',
  'dist':   './dist',
  'lib':    './dist/lib',
  'aot':    './dist/app/aot',
  'jit':    './dist/app/jit',
  'docs':   './dist/docs/'
};

var styleguideOutputPath = global.paths.docs + 'styleguide/';
var typedocOutputPath = global.paths.docs + 'typedoc/';
var version = (argv.version) ? argv.version : json.version;
var devOrProd = (argv.dev) ? '--dev': '--prod';
var deployHost = (argv.host) ? argv.host: 'localhost';
var deployHostUsername = (argv.deploy_uname) ? argv.deploy_uname: 'username';
var deployHostPassword = (argv.deploy_pw) ? argv.deploy_pw: 'password';
var deployEnvironment = (argv.deploy_environment) ? argv.deploy_environment: 'staging';
var deployPlanType = (argv.deploy_plantype) ? argv.deploy_plantype: '';
var deployPlanKey = (argv.deploy_plankey) ? argv.deploy_plankey: '';
var deployBuildNumber = (argv.deploy_buildnumber) ? argv.deploy_buildnumber: '';

/**************************************************************************
 *    Documentation
 *************************************************************************/

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


/**************************************************************************
 *    Testing
 *************************************************************************/

gulp.task('backstop:generateRef', shell.task(
  ['npm run reference'], {cwd: './node_modules/backstopjs/'}
));

gulp.task('backstop', shell.task(
  ['npm run test'], {cwd: './node_modules/backstopjs/'}
));

/**************************************************************************
 *    Build Tasks
 *************************************************************************/

gulp.task('lib:clean', function (done) {
  del([
    global.paths.lib + '/src/**/*.html',
    global.paths.lib + '/src/**/*.css',
    global.paths.lib + '/src/**/*.css.map',
    global.paths.lib + '/src/node_modules',
    global.paths.lib + '/src/**/*.ngfactory.ts',
    global.paths.lib + '/src/**/*.tsconfig.json'
  ]).then(function() {
    done()
  });
});

gulp.task('copy:app:lib', function() {
  return gulp.src(global.paths.all)
    .pipe(gulp.dest(global.paths.lib + '/src'))
});

gulp.task('copy:tsconfig:aot', function() {
  return gulp.src('./src/aot.tsconfig.json')
    .pipe(gulp.dest(global.paths.lib + '/src/'));
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

gulp.task('ngc:ts:replace', function() {
  return gulp.src(global.paths.ts)
    .pipe(replace('.less', '.css'))
    .pipe(replace('.pug', '.html'))
    .pipe(gulp.dest(global.paths.lib + '/src/'));
});

gulp.task('typesRoot:replace', function() {
  return gulp.src(global.paths.lib + '/tsconfig.json')
    .pipe(replace('../node_modules/', '../../node_modules/'))
    .pipe(gulp.dest(global.paths.lib));
});

var outputPath;
gulp.task('transpile:less', function(){
  var processors = [
    autoprefixer({browsers: ['last 1 version']}),
    assets()
  ];

  return gulp.src(global.paths.less)
    .pipe(less())
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('/', {includeContent: true, sourceRoot: '/src/app'}))
    .pipe(gulp.dest(outputPath));
});

gulp.task('transpile:pug', function(){
  return gulp.src(global.paths.pug)
    .pipe(pug())
    .pipe(gulp.dest(outputPath));
});

gulp.task('transpile:ts', function(){
  outputPath = global.paths.dist + '/lib/src/';

  var tsResult = gulp.src(global.paths.ts)
    .pipe(replace('.less', '.css'))
    .pipe(replace('.pug', '.html'))
    .pipe(ng2Template({
      base: '/dist/lib/src',
      supportNonExistentFiles: false,
      templateExtension: '.html'
    }))
    .pipe(sourcemaps.init())
    .pipe(tsProject());

  return merge([
    tsResult.dts.pipe(gulp.dest(outputPath)),
    tsResult.js
      .pipe(sourcemaps.write('/', {includeContent: true, sourceRoot: '/src/app'}))
      .pipe(gulp.dest(outputPath))
  ]);
});

/**************************************************************************
 *    Bundle
 *************************************************************************/

gulp.task('lib:bundle:umd', function() {
  return gulp.src('./dist/lib/src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(rollup({
      entry: './dist/lib/src/index.js',
      format: 'umd',
      treeshake: true,
      dest: 'ce-<%= htmlComponentName %>.bundle.js',
      moduleName: '<%= htmlComponentName %>',
      banner: '/* Connections Education ce-<%= htmlComponentName %> Angular2 Library */',
      useStrict: true
    }))
    .pipe(sourcemaps.write())
    .pipe(rename('ce-<%= htmlComponentName %>.bundle.umd.js'))
    .pipe(gulp.dest('./dist/lib/bundles'));
});

gulp.task('lib:bundle:umd:min', function() {
  return gulp.src('./dist/lib/bundles/ce-<%= htmlComponentName %>.bundle.umd.js')
    .pipe(uglify({
      mangle: true,
      preserveComments: 'license'
    }))
    .pipe(rename('ce-<%= htmlComponentName %>.bundle.umd.min.js'))
    .pipe(gulp.dest('./dist/lib/bundles/'));
});

/**************************************************************************
 *    NPM Publish
 *************************************************************************/

gulp.task('publish:copy', function() {
  return gulp.src([
    global.paths.dist + '/app/**',
    global.paths.dist + '/lib/**',
    global.paths.dist + '/package.json',
    global.paths.dist + '/README.md'
  ],{base: 'dist/'})
    .pipe(gulp.dest(global.paths.dist + '/ce-<%= htmlComponentName %>'));
});

gulp.task('publish:tarball', function() {
  return gulp.src([
    global.paths.dist + '/ce-<%= htmlComponentName %>/**'
  ],{base: 'dist/'})
    .pipe(tar('ce-<%= htmlComponentName %>.tar'))
    .pipe(gzip())
    .pipe(gulp.dest(global.paths.dist));
});

gulp.task('publish:createPackageJson', function() {
  return gulp.src('package.json')
    .pipe(jsonTransform(function(data) {
      delete data.scripts;
      delete data.devDependencies;
      delete data["angular-cli"];
      data.main = 'lib/bundles/ce-<%= htmlComponentName %>.bundle.umd.js';
      data.version = version;
      data.private = false;
      data.typings = 'lib/src/index.d.ts';
      return data;
    }))
    .pipe(jsonFormat(4))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('publish:npm', shell.task([
  'npm publish ./dist/ce-<%= htmlComponentName %>.tar.gz'
]));

gulp.task('publish:clean', function (done) {
  del([
    global.paths.dist + '/ce-<%= htmlComponentName %>',
    global.paths.dist + '/ce-<%= htmlComponentName %>.tar.gz'
  ]).then(function() {
    done()
  });
});

/**************************************************************************
 *    CE - Deployment
 *************************************************************************/

gulp.task('deploy:zip', function() {
  return gulp.src([
    global.paths.dist + '/app/**',
    global.paths.dist + '/lib/**',
    global.paths.dist + '/package.json',
    global.paths.dist + '/README.md'
  ],{base: 'dist/'})
    .pipe(zip('ce-<%= htmlComponentName %>.zip'))
    .pipe(gulp.dest(global.paths.dist));
});

gulp.task('deploy:nest', function(){
  return gulp.src(global.paths.dist + '/ce-<%= htmlComponentName %>.zip')
    .pipe(scp({
      host: deployHost,
      username: deployHostPassword,
      password: deployHostUsername,
      dest: '/opt/connections/Nest/' + deployEnvironment + '/public/libraries/ce-<%= htmlComponentName %>/ce-<%= htmlComponentName %>.zip'
    }))
    .on('error', function(err) {
      console.log(err);
    });
});

gulp.task('run:git:tag', shell.task([
  'git tag -a ${bamboo.deploy.release} -m Tag of Version ' + version,
  'git push origin ' + version
]));

gulp.task('run:nest:deploy:start', shell.task([
  'curl -H "Content-Type: application/json" -d "{"type": "' + deployPlanType + '", "version": "' + version + '", "buildKey": "' + deployPlanKey + '", "buildNumber": "' + deployBuildNumber + '", "environment": "' + deployEnvironment +'", "step": "start"}" https://' +  deployHost + '/api/tool/deploy/8c285561-bf16-4ff2-8754-aa7877c4d3c2 -k'
]));

gulp.task('run:nest:deploy:end', shell.task([
  'curl -H "Content-Type: application/json" -d "{"type": "' + deployPlanType + '", "version": "' + version + '", "buildKey": "' + deployPlanKey + '", "buildNumber": "' + deployBuildNumber + '", "environment": "' + deployEnvironment + '", "step": "end"}" https://' +  deployHost + '/api/tool/deploy/8c285561-bf16-4ff2-8754-aa7877c4d3c2 -k'
]));

gulp.task('deploy:clean', function (done) {
  del([
    global.paths.dist + '/ce-<%= htmlComponentName %>.zip'
  ]).then(function() {
    done()
  });
});

/**************************************************************************
 *    Build Wrappers
 *************************************************************************/

gulp.task('run:ngc', shell.task([
  '"./node_modules/.bin/ngc" -p dist/lib/src/aot.tsconfig.json'
]));

gulp.task('run:ng:aot', shell.task([
  'ng build -o ./dist/app/aot --prod'
]));

gulp.task('run:ng:jit', shell.task([
  'ng build -o ./dist/app/jit --prod'
]));

/**************************************************************************
 *    Main Tasks
 *************************************************************************/

gulp.task('aot', function(callback){
  outputPath = global.paths.dist + '/lib/src/';
  runSequence('lib', 'copy:config:aot', 'run:ng:aot', callback);
});

gulp.task('jit', function(callback){
  outputPath = global.paths.dist + '/app/';
  runSequence('copy:config:jit', 'run:ng:jit', callback);
});

gulp.task('lib', function(callback){
  outputPath = global.paths.dist + '/lib/src/';
  runSequence('copy:tsconfig:aot', 'ngc:ts:replace', 'transpile:less', 'transpile:pug', 'run:ngc', 'transpile:ts', 'lib:clean', callback);
});

gulp.task('libs', function(callback){
  runSequence('lib', 'lib:bundle:umd', 'lib:bundle:umd:min', callback);
});

gulp.task('publish', function(callback){
  runSequence('publish:createPackageJson', 'publish:copy', 'publish:tarball', 'publish:npm', 'publish:clean', callback);
});

gulp.task('deploy', function(callback){
  runSequence('deploy:zip', 'run:nest:deploy:start', 'deploy:nest', 'run:git:tag', 'run:nest:deploy:end', 'deploy:clean', callback);
});

gulp.task('docs', ['styleguide', 'typedoc']);

gulp.task('default', function(callback) {
  runSequence('jit', 'aot', 'libs', 'docs', callback);
});
