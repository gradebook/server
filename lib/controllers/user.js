const SEMESTER = '2019F'; // @TODO: Dynamically generate this
const {user: {response: UserModel}, category: {create: NewCategory}, grade: {create: NewGrade}} = require('../models');
const api = require('../api');
const {user: sanitize} = require('./sanitizers');

module.exports = {
	me: (req, res) => {
		res.status(200).json(sanitize(req.user));
	},
	async approve(req, res) {
		if (!req.user.isNew) {
			return res.status(200).json(req.user);
		}

		const user = new UserModel(Object.assign({}, req.user));
		const txn = await api.getTransaction();

		try {
			const result = await api.user.update(req.user.id, user, {isNew: false}, txn);
			// @todo: this should throw an error if validation fails
			// eslint-disable-next-line camelcase
			const course = await api.course.create({user_id: req.user.id, name: 'DEMO 101', semester: SEMESTER}, txn);
			await txn.commit();

			category1 = new NewCategory();
			category1.set('course_id', course.id);
			category1.set('name', 'Exam 1');
			category1.set('weight', 30);
			category1.set('position', 100);
			grade1 = new NewGrade();
			grade1.set('course_id', course.id);
			grade1.set('grade', 90);
			grade1.set('user_id', req.user.id);

			await api.category.create(category1, grade1);

			category2 = new NewCategory();
			category2.set('course_id', course.id);
			category2.set('name', 'Exam 2');
			category2.set('weight', 30);
			category2.set('position', 200);
			grade2 = new NewGrade();
			grade2.set('course_id', course.id);
			grade2.set('user_id', req.user.id);

			await api.category.create(category2, grade2);

			category3 = new NewCategory();
			category3.set('course_id', course.id);
			category3.set('name', 'Final');
			category3.set('weight', 40);
			category3.set('position', 300);
			grade3 = new NewGrade();
			grade3.set('course_id', course.id);
			grade3.set('user_id', req.user.id);

			await api.category.create(category3, grade3);

			const status = result.error ? 500 : 200;
			return res.status(status).json(result);
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
		const result = await api.user.delete(req.user.id, req.user.isNew);
		const status = result ? 204 : 500;

		res.status(status).end();
	},
	async export(req, res) {
		const exportedData = await api.user.export(req.user.id);
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
