const {spawn} = require('child_process');
const pkg = require('../../package.json');

const {frontend} = require('../api');

let version = false;

const cmd = spawn('git', ['rev-parse', 'HEAD']);

cmd.stdout.on('data', data => {
	data = String(data).trim().slice(0, 7);
	version = {server: `${pkg.version}@${data}`};
});

/**
 * @param {Gradebook.Request} request
 * @param {Gradebook.ResponseWithContext} response
 */
module.exports.getVersion = (request, response) => {
	if (!version) {
		return response.status(503).end('Version has not been determined, please try again later');
	}

	version.client = frontend.version();
	response.set('Content-Type', 'application/json');
	response.set('Cache-Control', 'public, max-age=45, s-maxage=31536000');
	return response.end(JSON.stringify(version));
};
