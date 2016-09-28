// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/docs/referenceConf.js

/*global jasmine */
var SpecReporter = require('jasmine-spec-reporter');
var Jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter');
var jasmineReporters = require('jasmine-reporters');

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './e2e/**/*.e2e-spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome'
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showTiming: true,
    isVerbose: false,
    showColors: true,
    includeStackTrace: false,
    defaultTimeoutInterval: 400000,
    print: function() {}
  },
  useAllAngular2AppRoots: true,
  beforeLaunch: function() {
    require('ts-node').register({
      project: 'e2e'
    });
  },
  onPrepare: function() {
    browser.manage().timeouts().pageLoadTimeout(120000);
    browser.manage().timeouts().implicitlyWait(60000);
    browser.ignoreSynchronization = true;

    var junitReporter = new jasmineReporters.JUnitXmlReporter({
      savePath: './dist/test_results/e2e/',
      consolidateAll: true
    });
    jasmine.getEnv().addReporter(junitReporter);
    jasmine.getEnv().addReporter(
      new Jasmine2HtmlReporter({
        savePath: './dist/test_results/e2e/'
      })
    );
    jasmine.getEnv().addReporter(new SpecReporter({
      displayStacktrace: 'none',    // display stacktrace for each failed assertion, values: (all|specs|summary|none)
      displayFailuresSummary: true // display summary of all failures after execution
    }));
  }
};
