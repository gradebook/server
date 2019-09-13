const execa = require('execa');

module.exports = (cwd = '.') => execa.command(`yarn --cwd ${cwd} install`);
