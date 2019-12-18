const SEMESTER = '2019W'; // @TODO: Dynamically generate this
const {user: {response: UserModel}} = require('../models');
const api = require('../api');
const themeService = require('../services/theming');
const {user: sanitize} = require('./sanitizers');

module.exports = {
	me: (req, res) => {
		const theme = themeService.getThemeForHost(req._domain);
		res.status(200).json(sanitize(Object.assign({theme}, req.user)));
	},
	async approve(req, res) {
		if (!req.user.isNew) {
			return res.status(200).json(sanitize(Object.assign({}, req.user)));
		}

		const user = new UserModel(Object.assign({}, req.user));
		const txn = await api.getTransaction();

		try {
			const result = await api.user.update(req.user.id, user, {isNew: false}, txn, req._table);
			// @todo: this should throw an error if validation fails
			/* eslint-disable camelcase */
			const course = await api.course.create(
				{user_id: req.user.id, name: 'DEMO 101', semester: SEMESTER},
				txn, req._table
			);

			const course_id = course.id;
			const user_id = req.user.id;

			await api.category.create(
				{course_id, user_id, name: 'HW', weight: 20, position: 100}, txn, req._table
			);

			await api.category.create(
				{course_id, user_id, name: 'Exam 1', weight: 25, position: 200, grade: 90}, txn, req._table
			);

			await api.category.create(
				{course_id, user_id, name: 'Exam 2', weight: 25, position: 300, grade: 88}, txn, req._table
			);

			await api.category.create(
				{course_id, user_id, name: 'Final', weight: 30, position: 400}, txn, req._table
			);

			/* eslint-enable camelcase */

			await txn.commit();
			const status = result.error ? 500 : 200;
			return res.status(status).json(sanitize(result));
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	},
	async updateSetting(req, res) {
		const {key, value} = req.body;

		if (req.user.settings[key] === value) {
			return res.status(200).end({[key]: value});
		}

		const user = new UserModel(Object.assign({}, req.user));
		const updatedSettings = Object.assign({}, user.settings);
		updatedSettings[key] = value;

		const settingsString = JSON.stringify(updatedSettings);

		user.set('settings', settingsString);

		await user.commit();

		res.status(200).set('content-type', 'application/json').end(settingsString);
	},
	async delete(req, res) {
		const result = await api.user.delete(req.user.id, req.user.isNew, req._table);
		const status = result ? 204 : 500;

		res.status(status).end();
	},
	async export(req, res) {
		const exportedData = await api.user.export(req.user.id, req._table);
		exportedData.user = Object.assign({}, req.user);
		delete exportedData.user.id;
		delete exportedData.user.gid;
		delete exportedData.user.isNew;

		exportedData.courses.forEach(course => {
			delete course.status;
			delete course.user_id;
		});

		exportedData.grades.forEach(grade => {
			delete grade.user_id;
			delete grade.id;
		});

		res.status(200).json(exportedData);
	}
};
