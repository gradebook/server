// @ts-check
import {dayjs} from '@gradebook/time';
import {frontend} from '../api/index.js';
import config from '../config.js';
import {isProduction} from '../utils/is-production.js';
import {ignoredUsers} from '../services/ignored-users.js';
import * as analytics from '../services/analytics/index.js';
import {schoolConfigService} from '../services/school-config.js';
import {serializeUser as sanitize} from '../services/serializers/user.js';
import {getAppleTags} from '../utils/apple-meta.js';
import * as shrinkService from '../services/shrink.js';
import {user} from '../models/index.js';

const UserModel = user.UserRow;

const sRandom = Math.floor(Math.random() * 420);
let sid = 0;

const liveReload = String(config.get('live reload')) === 'true'
	? '<script src="/assets/lr.js" type="module"></script>' : '';
const domain = config.get('domain').replace(/^\./, '');

/**
* @param {Gradebook.Request} request
* @param {import('express').Response} response
* @returns void
*/
export const marketing = (request, response) => {
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
export const app = async (request, response) => {
	const template = await frontend.get();
	const user = getUserSessionFromRequest(request);

	let additionalMetadata = '';
	// Current Time
	additionalMetadata += `<meta name="x-renderer-timestamp" value="${dayjs().format('MM/DD HH:mm')}" />\n`;
	// Session Identifier
	additionalMetadata += `<meta name="x-sid" value="${sRandom}.${++sid}" />\n`;
	// Live Reload (usually only used in development mode)
	additionalMetadata += liveReload + '\n';
	// School metadata (manifest, config, css variables, etc)
	additionalMetadata += schoolConfigService.getSchoolConfig(request._domain).head + '\n';
	// Apple device-specific tags
	additionalMetadata += getAppleTags(request);

	if (request.path.includes('/import') && request.query.slug) {
		const slug = Array.isArray(request.query.slug) ? request.query.slug[0] : request.query.slug;

		const course = await shrinkService.safelyRead(slug);

		if (course) {
			additionalMetadata += `<meta name="x-slug-payload" value="${encodeURI(course)}" />\n`;
		}
	}

	// User state (can be empty if they're not logged in)
	const safeUserState = encodeURI(JSON.stringify(sanitize(user.session || '{}')));
	additionalMetadata = `<meta name="user-state" value="${safeUserState}" />\n` + additionalMetadata;

	response.send(template.replace('</head>', `${additionalMetadata}\n</head>`));

	if (user.isFullUser) {
		if (!ignoredUsers.isUserIdIgnored(request._table, request.user.id)) {
			analytics.userSession.add([request._table, 1]);
		}

		const userModel = new UserModel(request.user);
		await userModel.commit(null, request._table);
	}
};
