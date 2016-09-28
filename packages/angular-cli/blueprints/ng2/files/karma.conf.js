// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'angular-cli'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-remap-istanbul'),
      require('karma-htmlfile-reporter'),
      require('karma-junit-reporter'),
      require('karma-spec-reporter'),
      require('angular-cli/plugins/karma')
    ],
    files: [
      { pattern: './<%= sourceDir %>/test.ts', watched: false }
    ],
    preprocessors: {
      './<%= sourceDir %>/test.ts': ['angular-cli']
    },
    remapIstanbulReporter: {
      reports: {
        html: './dist/docs/coverage',
        lcovonly: './dist/docs/coverage/coverage.lcov'
      }
    },
    htmlReporter: {
      outputFile: './dist/test_results/unit/unit.html',
      pageTitle: 'Unit Tests',
      subPageTitle: 'A sample project description',
      groupSuites: true,
      useCompactStyle: true,
      useLegacyStyle: true
    },
    junitReporter: {
      outputDir: './dist/test_results/unit/', // results will be saved as $outputDir/$browserName.xml
      outputFile: 'unit.xml', // if included, results will be saved as $outputDir/$browserName/$outputFile
      suite: '', // suite will become the package name attribute in xml testsuite element
      useBrowserName: false, // add browser name to report and classes names
      nameFormatter: undefined, // function (browser, result) to customize the name attribute in xml testcase element
      classNameFormatter: undefined, // function (browser, result) to customize the classname attribute in xml testcase element
      properties: {} // key value pair of properties to add to the <properties> section of the report
    },
    specReporter: {
      maxLogLines: 5,         // limit number of lines logged per test
      suppressErrorSummary: true,  // do not print error summary
      suppressFailed: false,  // do not print information about failed tests
      suppressPassed: false,  // do not print information about passed tests
      suppressSkipped: true,  // do not print information about skipped tests
      showSpecTiming: false // print the time elapsed for each spec
    },
    angularCli: {
      config: './angular-cli.json',
      environment: 'dev'
    },
    reporters: ['progress', 'karma-remap-istanbul', 'spec', 'html', 'junit'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  });
};
