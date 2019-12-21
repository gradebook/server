const {frontend} = require('../api');
const analytics = require('../services/analytics');
const {user: {response: UserModel}} = require('../models');

module.exports.marketing = (req, res) => {
	if (req.user) {
		return res.redirect('/my/');
	}

	res.end('marketing site goes here');
};

module.exports.app = async (req, res) => {
	const template = await frontend.get();
	const userPayload = encodeURI(JSON.stringify(req.user || ''));

	res.send(template.replace('__META_USER_STATE__', userPayload));
	analytics.userSession.add([1]);
	const user = new UserModel(req.user);
	await user.commit();
};
