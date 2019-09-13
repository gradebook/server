const execa = require('execa');

module.exports = (filename, workTree = '.') => execa(
	'git', ['log', '-1', '--pretty=format:% H', '--', filename], {cwd: workTree}
);
