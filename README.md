# @gradebook/server

> The core [gradebook](https://www.gradebook.app) backend

## Versioning

Gradebook uses semver-ish versioning. Since the application only has 1 consumer, we're more willing to make changes which should be made in a major version in a minor version. With every Github release (this is not released to NPM), the consumer git ref is updated, and that ref should be fully compatible. Here's a quick summary of how we tag releases:

 - Major releases include new features, and major architectural changes. There may or may not be breaking changes.
 - Minor releases include new features, and API changes which might differ from the current API. Generally, API properties are deprecated in a given minor are removed in the next minor, but that's not guaranteed.
 - Patch releases include bug fixes and trivial changes and should be fully backwards compatible with the previous minor

## Setting up a development environment

- If necessary, fork the repository
- Clone the repo to your computer
- Create copy `config.example.json` to `config.development.json`, and add missing sections on Google authentication. You will probably also want to add `stdout` as a logging transport.
- Run `yarn install` to pull dependencies
- Run `yarn setup` to configure submodules and manage dependencies

## Developing the server
- If you have access to the client, run `yarn dev`, and wait for the client to build. Otherwise, you can run `yarn backend:dev` to just watch the server
- Navigate to `localhost:3000`, or the ip/port you specified in your configuration