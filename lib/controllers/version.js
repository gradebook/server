const {spawn} = require('child_process');
const pkg = require('../../package.json');

let version = false;

const cmd = spawn('git', ['rev-parse', 'HEAD']);

cmd.stdout.on('data', data => {
	data = String(data).trim().substr(0,7);
	version = JSON.stringify({version:`${pkg.version}@${data}`});
});

module.exports.getVersion = (req, res) => {
	if (!version) {
		return res.status(503).end('Version has not been determined, please try again later');
	}

	res.set('Content-Type', 'application/json');
	return res.end(version);
};
