// @ts-check
const {URL} = require('url');
const semesterService = require('@gradebook/time').semester.data;
const config = require('../config');
const {user: {response: UserModel}} = require('../models');
const {InternalServerError, NotFoundError, ConsistencyError} = require('../errors');
const api = require('../api');
const logging = require('../logging');
const {user: serialize} = require('../services/serializers');
const {addRedirectCookie} = require('./middleware');

const COOKIE_DOMAIN = config.get('domain') || undefined;

/**
 * @param {string} hash
 * @returns {object}
 */
const convertHashToCourse = hash => {
	if (!hash) {
		return false;
	}

	const {deserialize, prepareCourseForAPI} = require('@gradebook/course-serializer');
	const validateCourseTemplate = require('../services/validation/create-course');
	try {
		const course = prepareCourseForAPI(deserialize(hash), semesterService.activeSemester);
		/** @type {import('../services/validation/create-course').CreateCourseRequest} */
		const request = {body: course, user: {}, query: {type: 'import'}};
		validateCourseTemplate(request);
		return course;
	} catch {
		return null;
	}
};

/**
 * @param {Gradebook.Request} request
 * @param {Gradebook.ResponseWithContext} response
 */
function destroySessionAndEnd(request, response) {
	request.session.destroy(() => response.status(204).end());
}

/**
 * After-create hook
 * @param {string} gid
 * @param {string} user
 * @param {string} school
 */
let onUserCreate = (gid, user, school) => null; // eslint-disable-line no-unused-vars

/**
 * After-delete hook
 * @param {string} gid
 */
let onUserDelete = gid => null; // eslint-disable-line no-unused-vars

const createDomain = config.get('user event endpoint');

if (createDomain) {
	/** @type import('got').Got */
	const got = require('got').default;
	const getSchoolFromTable = require('../utils/get-school-from-table');
	const endpoint = `${createDomain}/api/v0/internal/user`;
	const headers = {'content-type': 'application/json'};

	onUserCreate = async function sendUserToGlobalDb(gid, id, table) {
		const payload = JSON.stringify({gid, id, school: getSchoolFromTable(table)});
		await got({url: endpoint, method: 'put', body: payload, headers})
			.catch(error => {
				if (error.code === 'ETIMEDOUT') {
					return logging.error(new InternalServerError({err: error, context: 'Failed CREATING to remote service'}));
				}

				throw error;
			});
	};

	onUserDelete = async function removeUserFromGlobalDb(gid) {
		await got({url: `${endpoint}/${gid}`, method: 'delete', headers})
			.catch(error => {
				if (error.code === 'ETIMEDOUT') {
					return logging.error(new InternalServerError({err: error, context: 'Failed DELETING from remote service'}));
				}

				throw error;
			});
	};
}

module.exports = {
	/**
	 * @param {Gradebook.Request} request
	 * @param {Gradebook.ResponseWithContext} response
	 */
	me(request, response) {
		response.context = {
			statusCode: 200,
			body: request.session.userProfile ? {...request.session.userProfile} : request.user,
		};

		serialize(request, response);
	},
	/**
	 * @param {Gradebook.Request} request
	 * @param {Gradebook.ResponseWithContext} response
	 */
	feedback(request, response) {
		const url = new URL(request.originalUrl, `${request.protocol}://${request.hostname}`);
		url.searchParams.set('user', request.user.id);

		for (const [key] of url.searchParams.entries()) {
			if (!(key === 'user' || key === 'type' || key === 'message' || key === 'key' || key === 'value')) {
				url.searchParams.delete(key);
			}
		}

		request.originalUrl = url.href;
		response.json({message: 'Thank you for your feedback!'});
	},
	/**
	 * @param {Gradebook.Request} request
	 * @param {Gradebook.ResponseWithContext} response
	 * @param {import('express').NextFunction} next
	 */
	approveFromSession(request, response, next) {
		if (request.session.hasApproved) {
			if (request.session.hasApproved !== request._table) {
				return next(new ConsistencyError({
					message: 'Unable to verify your school. Please log out and log back in, or contact support if this issue persists',
					errorDetails: `school: ${request._table}, approved: ${request.session.hasApproved}`,
				}));
			}

			delete request.session.hasApproved;
			request.session.redirect = '/my/';
			return next();
		}

		if (request.session.userProfile) {
			return response.status(412).json({message: 'There was an issue approving your account. Please try again'});
		}

		next(new NotFoundError());
	},
	/**
	 * @param {Gradebook.Request} request
	 * @param {Gradebook.ResponseWithContext} response
	 */
	async approve(request, response) {
		if (!request.session.userProfile) {
			response.context = {
				body: Object.assign({}, request.user),
			};

			serialize(request, response);
		}

		const txn = await api.getTransaction();

		try {
			const profile = Object.assign({}, request.session.userProfile);
			delete profile.isNew;
			const database = request._table;

			let user;

			try {
				user = await api.user.create({data: profile, txn, db: database});
			} catch (error) {
				if (request.session.redirect && error.code === 'ER_DUP_ENTRY') {
					try {
						const user = await api.user.readGid(profile.gid, database);
						await onUserCreate(profile.gid, user.id, database || 'www');
						await txn.rollback();

						const {redirect} = request.session;
						delete request.session.userProfile;
						delete request.session.redirect;
						return response.status(302).redirect(redirect);
					} catch (error_) {
						logging.error(new InternalServerError({err: error_}));
						return response.status(500).json({error: 'Failed creating your account'});
					}
				}

				logging.error(error);

				return response.status(500).json(new InternalServerError({
					err: error,
					message: 'Failed creating your account. Please contact support for more information.',
				}));
			}

			if (request.query.import) {
				// @todo: this should throw an error if validation fails
				const course = convertHashToCourse(request.query.import.toString());
				course.user = user.id;
				await api.course.create(course, txn, database);
			}

			await onUserCreate(profile.gid, user.id, request._table || 'www');
			await txn.commit();
			delete request.session.userProfile;
			request.session.school = request._table;

			if (request.session.redirect) {
				const {redirect} = request.session;
				delete request.session.redirect;
				return response.status(302).redirect(redirect);
			}

			response.context = {
				body: profile,
			};

			serialize(request, response);
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	},
	/**
	 * // Remember: Validation happens before this so we know the key and value are valid
	 * @param {Gradebook.Request<never, never, never, never, {value: any}, {key: string}>} request
	 * @param {Gradebook.ResponseWithContext} response
	 */
	async updateSetting(request, response) {
		const {key} = request.query;
		const {value} = request.body;

		if (request.user.settings[key] === value) {
			response.context = {
				body: {[key]: value},
			};
			return;
		}

		const user = new UserModel(Object.assign({}, request.user));
		const updatedSettings = Object.assign({}, JSON.parse(user.get('settings')));
		updatedSettings[key] = value;

		const settingsString = JSON.stringify(updatedSettings);

		user.set('settings', settingsString);

		await user.commit(null, request._table);

		// Required by redirectCookie
		request.user.settings = updatedSettings;

		addRedirectCookie(request, response);
		response.context = {
			body: settingsString,
		};
	},
	/**
	 * @note This controller is NOT pipelined!
	 * @param {Gradebook.Request} request
	 * @param {Gradebook.ResponseWithContext} response
	 */
	async delete(request, response) {
		response.clearCookie('gbardr', {domain: COOKIE_DOMAIN});

		if (request.session.userProfile) {
			delete request.session.userProfile;
			return destroySessionAndEnd(request, response);
		}

		const txn = await api.getTransaction();

		try {
			const result = await api.user.delete({id: request.user, db: request._table, txn});
			await onUserDelete(request.user.gid);
			await txn.commit();

			if (result) {
				return destroySessionAndEnd(request, response);
			}

			response.status(500).end();
		} catch (error) {
			response.status(500).end();
			await txn.rollback();
			throw error;
		}
	},
	/**
	* @param {Gradebook.Request} request
	* @param {Gradebook.ResponseWithContext} response
	*/
	async export(request, response) {
		const exportedData = await api.user.export(request.user.id, request._table);
		exportedData.user = Object.assign({}, request.user);

		response.context = {
			body: exportedData,
		};
	},
};
