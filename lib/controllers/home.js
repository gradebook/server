// @ts-check
const {frontend} = require('../api');
const config = require('../config');
const ignoredUserService = require('../services/ignored-users');
const analytics = require('../services/analytics');
const themeService = require('../services/theming');
const {user: {response: UserModel}} = require('../models');
const sanitize = require('./sanitizers/user');

const lr = config.get('live reload').toString() === 'true' ?
	'<script src="/assets/lr.js" type="module"></script>\n' : '';

/**
* @param {boolean} isProduction
* @returns {(request: import('../../global').Request, response: import('express').Response) => void}
*/
module.exports.marketing = isProduction => (request, response) => {
	if (request.user || !isProduction) {
		return response.redirect('/my/');
	}

	response.status(302).redirect('https://www.gradebook.app/');
};

/**
* @param {import('../../global').Request} request
* @param {import('express').Response} response
*/
module.exports.app = async (request, response) => {
	const template = await frontend.get();
	const theme = themeService.getCompiledTheme(request._domain);

	/** @type {string | {}} */
	let userData = '';

	if (request.session.userProfile) {
		userData = request.session.userProfile;
	} else if (request.user) {
		userData = request.user;
	}

	if (typeof userData === 'object') {
		userData = {...userData};
	}

	const userPayload = encodeURI(JSON.stringify(sanitize(userData)));
	const sitePayload = `\t<meta name="site-name" value="${encodeURI(theme.metadata.name)}" />`;

	response.send(
		template.replace('__META_USER_STATE__', userPayload).replace(
			'</head>',
			`${lr}${sitePayload}\n${theme.styles}\n</head>`
		)
	);

	if (!request.session.userProfile && request.user) {
		if (!ignoredUserService.isUserIdIgnored(request._table, request.user.id)) {
			analytics.userSession.add([request._table, 1]);
		}

		const user = new UserModel(request.user);
		await user.commit(null, request._table);
	}
};
