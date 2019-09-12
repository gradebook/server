const {promisify} = require('util');
const {
	readFile,
	writeFile,
	mkdir,
	stat,
	readdir
} = require('fs');

module.exports = {
	readFile: promisify(readFile),
	writeFile: promisify(writeFile),
	mkdir: promisify(mkdir),
	stat: promisify(stat),
	readdir: promisify(readdir)
};
