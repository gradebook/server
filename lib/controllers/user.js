// @ts-check
const SEMESTER = '2020U'; // @TODO: Dynamically generate this
const config = require('../config');
const {user: {response: UserModel}} = require('../models');
const {InternalServerError, NotFoundError, ConsistencyError} = require('../errors');
const api = require('../api');
const logging = require('../logging');
const themeService = require('../services/theming');
const {user: sanitize} = require('./sanitizers');
const {addRedirectCookie} = require('./middleware');

const COOKIE_DOMAIN = config.get('domain') || undefined;

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
	// @ts-ignore
	const got = require('got');
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
	me: (req, res) => {
		const theme = themeService.getThemeForHost(req._domain);
		res.status(200).json(sanitize(Object.assign({theme}, req.session.userProfile || req.user)));
	},
	approveFromSession(req, res, next) {
		if (req.session.hasApproved) {
			if (req.session.hasApproved !== req._table) {
				return next(new ConsistencyError({
					message: 'Unable to verify your school. Please log out and log back in, or contact support if this issue persists',
					errorDetails: `school: ${req._table}, approved: ${req.session.hasApproved}`
				}));
			}

			delete req.session.hasApproved;
			req.session.redirect = '/my/';
			return next();
		}

		if (req.session.userProfile) {
			return res.status(412).json({message: 'There was an issue approving your account. Please try again'});
		}

		next(new NotFoundError());
	},

	async approve(req, res) {
		if (!req.session.userProfile) {
			return res.status(200).json(sanitize(Object.assign({}, req.user)));
		}

		const txn = await api.getTransaction();

		try {
			const profile = Object.assign({}, req.session.userProfile);
			delete profile.isNew;
			const database = req._table;

			let user;

			try {
				user = await api.user.create(profile, txn, database);
			} catch (error) {
				if (req.session.redirect && error.code === 'ER_DUP_ENTRY') {
					try {
						const user = await api.user.readGid(profile.gid, database);
						await onUserCreate(profile.gid, user.id, database || 'www');
						await txn.rollback();

						const {redirect} = req.session;
						delete req.session.userProfile;
						delete req.session.redirect;
						return res.status(302).redirect(redirect);
					} catch (error2) {
						logging.error(new InternalServerError({err: error2}));
						return res.status(500).json({error: 'Failed creating your account'});
					}
				}

				logging.error(error);

				return res.status(500).json(new InternalServerError({
					err: error,
					message: 'Failed creating your account. Please contact support for more information.'
				}));
			}

			// @todo: this should throw an error if validation fails
			await api.course.import({
				user: user.id,
				course: {name: 'DEMO 101', semester: SEMESTER, credits: 0},
				categories: [
					{name: 'Homework', weight: 20, position: 100, numGrades: 6},
					{name: 'Exam 1', weight: 25, grade: 90, position: 200, numGrades: 1},
					{name: 'Exam 2', weight: 25, grade: 88, position: 300, numGrades: 1},
					{name: 'Final', weight: 30, position: 400, numGrades: 1}
				]
			}, txn, database);

			await onUserCreate(profile.gid, user.id, req._table || 'www');
			await txn.commit();
			delete req.session.userProfile;
			req.session.school = req._table;

			if (req.session.redirect) {
				const {redirect} = req.session;
				delete req.session.redirect;
				return res.status(302).redirect(redirect);
			}

			return res.status(200).json(sanitize(profile));
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	},
	async updateSetting(req, res) {
		const {key} = req.query;
		const {value} = req.body;

		if (req.user.settings[key] === value) {
			return res.status(200).end({[key]: value});
		}

		const user = new UserModel(Object.assign({}, req.user));
		const updatedSettings = Object.assign({}, JSON.parse(user.get('settings')));
		updatedSettings[key] = value;

		const settingsString = JSON.stringify(updatedSettings);

		user.set('settings', settingsString);

		await user.commit(null, req._table);

		// Required by redirectCookie
		req.user.settings = updatedSettings;

		addRedirectCookie(req, res, () => res.status(200).set('content-type', 'application/json').end(settingsString));
	},
	async delete(req, res) {
		res.clearCookie('gbardr', {domain: COOKIE_DOMAIN});

		if (req.session.userProfile) {
			delete req.session.userProfile;
			req.logout();
			return res.status(204).end();
		}

		const txn = await api.getTransaction();

		try {
			const result = await api.user.delete(req.user, req._table, txn);
			await onUserDelete(req.user.gid);
			await txn.commit();
			req.logout();
			const status = result ? 204 : 500;
			res.status(status).end();
		} catch (error) {
			req.logout();
			await txn.rollback();
			throw error;
		}
	},
	async export(req, res) {
		const exportedData = await api.user.export(req.user.id, req._table);
		exportedData.version = '0';
		exportedData.user = Object.assign({}, req.user);
		delete exportedData.user.id;
		delete exportedData.user.gid;

		exportedData.courses.forEach(course => {
			delete course.user_id;
		});

		exportedData.grades.forEach(grade => {
			delete grade.user_id;
			delete grade.id;
		});

		res.status(200).json(exportedData);
	}
};
