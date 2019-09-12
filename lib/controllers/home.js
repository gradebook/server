const {resolve} = require('path');
const {readFile} = require('../utils/fs');

let template;

const read = () => readFile(resolve(__dirname, '../../../frontend/release/index.html'), 'utf8');

if (process.env.NODE_ENV === 'production') {
	read().then(data => {
		template = data;
	});
}

module.exports.marketing = (req, res) => {
	if (req.user) {
		return res.redirect('/app/');
	}

	res.end('marketing site goes here');
};

module.exports.app = async (req, res) => {
	const t = process.env.NODE_ENV === 'production' ? template : await read();
	res.send(t.replace('__META_USER_STATE__', encodeURI(JSON.stringify(req.user || ''))));
};
