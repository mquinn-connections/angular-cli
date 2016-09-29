# <%= jsComponentName %>

This project was generated with [ce-angular-cli](https://github.com/mquinn-connections/angular-cli.git) or [ce-angular-cli](https://github.com/jpf200124/angular-cli.git) version <%= version %>.

## Development server
Run `ng serve` for a dev server (using jit compiliation). Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Note: If you have previously ran `gulp aot`, you will need to rerun `gulp jit` before running `ng serve`, or copy over the jit.angular-cli.json to the angular-cli.json.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class`.

## App Build

Run `gulp jit` to build the jit(Just in Time) version of the project or `gulp aot` to build aot(Ahead of Time) version of the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Library Build

Run `gulp libs` to build the ES6 library build with ES5 UMD Bundles. 

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

Test results will be output to `./dist/test_results/unit`

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/). 
Before running the tests make sure you are serving the app via `ng serve`.

Test results will be output to `./dist/test_results/e2e`

## Running documentation generation

Run `gulp docs` to generate the styleguide and the typedoc documentation. Both will be output to the  `./dist/docs` directory in their respective folders.

## Running CSS Regression Reference Generation
 
Before CSS Regression can start you must first run `gulp backstop:generateRef` to generate reference images of your application.
Before running the generation make sure you are serving the app via `ng serve`.

## Running CSS Regression Testing

Once your reference images have been generated you can run the regression tests by running `gulp backstop`.
Before running the regression make sure you are serving the app via `ng serve`.

## Publishing

Run `gulp publish --version <version_number>` to publish to npm.  If no `--version` argument is used the version will be equal to the src package.json version.
Note: make sure you are logged into your npm registry and have the access rights to publish.

## Further help

To get more help on the `angular-cli` use `ng --help` or go check out the [CE-Angular-CLI README](https://github.com/mquinn-connections/angular-cli/blob/master/README.md).
