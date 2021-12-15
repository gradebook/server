// @ts-check
const {dayjs} = require('@gradebook/time');
const {frontend} = require('../api');
const config = require('../config');
const isProduction = require('../utils/is-production');
const ignoredUserService = require('../services/ignored-users');
const analytics = require('../services/analytics');
const schoolConfigService = require('../services/school-config');
const {user: {response: UserModel}} = require('../models');
const sanitize = require('../services/serializers/user');
const appleMeta = require('../utils/apple-meta');

const lr = String(config.get('live reload')) === 'true'
	? '<script src="/assets/lr.js" type="module"></script>\n' : '';
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
 * @returns {{session: object | ''; isFullUser: boolean}}
 */
function getUserSessionFromRequest(request) {
	/** @type {ReturnType<getUserSessionFromRequest>} */
	const response = {
		session: '',
		isFullUser: false,
	};

	if (request.session.userProfile) {
		response.session = request.session.userProfile;
		response.isFullUser = false;
	} else if (request.user) {
		response.session = request.user;
		response.isFullUser = true;
	}

	if (typeof response.session === 'object') {
		response.session = {...response.session};
	}

	return response;
}

/**
* @param {Gradebook.Request} request
* @param {import('express').Response} response
*/
module.exports.app = async (request, response) => {
	const template = await frontend.get();
	const user = getUserSessionFromRequest(request);

	const userPayload = encodeURI(JSON.stringify(sanitize(user.session)));
	const currentTime = `<meta name="x-renderer-timestamp" value="${dayjs().format('MM/DD HH:mm')}" />`;

	response.send(
		template.replace('__META_USER_STATE__', userPayload).replace(
			'</head>',
			`${currentTime}${lr}${schoolConfigService.getSchoolConfig(request._domain).head}${appleMeta(request)}\n</head>`,
		),
	);

	if (user.isFullUser) {
		if (!ignoredUserService.isUserIdIgnored(request._table, request.user.id)) {
			analytics.userSession.add([request._table, 1]);
		}

		const userModel = new UserModel(request.user);
		await userModel.commit(null, request._table);
	}
};
