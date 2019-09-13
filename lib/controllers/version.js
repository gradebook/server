const {spawn} = require('child_process');

let version = false;

const cmd = spawn('git', ['rev-parse', 'HEAD']);

cmd.stdout.on('data', data => {
	data = String(data).trim();
	// @todo: use semver
	version = Object.assign({}, {commit: data});
	version = JSON.stringify(version, null, 2);
});

module.exports.getVersion = (req, res) => {
	if (!version) {
		return res.status(503).end('Version has not been determined, please try again later');
	}

	res.set('Content-Type', 'application/json');
	return res.end(version);
};
