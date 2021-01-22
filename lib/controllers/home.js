// @ts-check
const {frontend} = require('../api');
const config = require('../config');
const isProduction = require('../utils/is-production');
const ignoredUserService = require('../services/ignored-users');
const analytics = require('../services/analytics');
const schoolConfigService = require('../services/school-config');
const {user: {response: UserModel}} = require('../models');
const sanitize = require('../services/serializers/user');
const appleMeta = require('../utils/apple-meta');

const lr = String(config.get('live reload')) === 'true' ?
	'<script src="/assets/lr.js" type="module"></script>\n' : '';
const domain = config.get('domain').replace(/^\./, '');

/**
* @param {Gradebook.Request} request
* @param {import('express').Response} response
* @returns void
*/
module.exports.marketing = (request, response) => {
	if (request.user || !isProduction) {
		return response.redirect('/my/');
	}

	response.status(302).redirect(`https://www.${domain}/`);
};

/**
* @param {Gradebook.Request} request
* @param {import('express').Response} response
*/
module.exports.app = async (request, response) => {
	const template = await frontend.get();

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

	response.send(
		template.replace('__META_USER_STATE__', userPayload).replace(
			'</head>',
			`${lr}${schoolConfigService.getSchoolConfig(request._domain).head}${appleMeta(request)}\n</head>`
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
