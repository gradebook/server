// @ts-check
const {frontend} = require('../api');
const analytics = require('../services/analytics');
const themeService = require('../services/theming');
const {user: {response: UserModel}} = require('../models');

/**
* @param {import('../../global').Request} req
* @param {import('express').Response} res
*/
module.exports.marketing = isProduction => (req, res) => {
	if (req.user || !isProduction) {
		return res.redirect('/my/');
	}

	res.status(302).redirect('https://www.gradebook.app/');
};

/**
* @param {import('../../global').Request} req
* @param {import('express').Response} res
*/
module.exports.app = async (req, res) => {
	const template = await frontend.get();
	const theme = themeService.getCompiledTheme(req._domain);

	/** @type {string | {}} */
	let userData = '';

	if (req.session.userProfile) {
		userData = req.session.userProfile;
	} else if (req.user) {
		userData = req.user;
	}

	const userPayload = encodeURI(JSON.stringify(userData));
	const sitePayload = `\t<meta name="site-name" value="${encodeURI(theme.metadata.name)}" />`;

	res.send(
		template.replace('__META_USER_STATE__', userPayload).replace('</head>', `${sitePayload}\n${theme.styles}\n</head>`)
	);

	if (!req.session.userProfile && req.user) {
		analytics.userSession.add([req._table, 1]);
		const user = new UserModel(req.user);
		await user.commit(null, req._table);
	}
};
