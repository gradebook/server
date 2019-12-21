const {frontend} = require('../api');
const analytics = require('../services/analytics');
const themeService = require('../services/theming');
const {user: {response: UserModel}} = require('../models');

module.exports.marketing = (req, res) => {
	if (req.user) {
		return res.redirect('/my/');
	}

	res.end('marketing site goes here');
};

module.exports.app = async (req, res) => {
	const template = await frontend.get();
	const theme = themeService.getThemeForHost(req._domain);

	let userData = '';

	if (req.session.userProfile) {
		userData = {theme, ...req.session.userProfile};
	} else if (req.user) {
		userData = {theme, ...req.user};
	}

	const userPayload = encodeURI(JSON.stringify(userData));

	res.send(template.replace('__META_USER_STATE__', userPayload));
	if (req.user) {
		analytics.userSession.add([1]);
		const user = new UserModel(req.user);
		await user.commit();
	}
};
