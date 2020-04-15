const api = require('../api');
const errors = require('../errors');
const {grade: sanitizeGrade} = require('./sanitizers');

module.exports = {
	browse: async (req, res) => {
		const {id: userID} = req.user;
		const {course, category} = req.query;
		const queryOptions = {userID};

		if (course && category) {
			throw new errors.ValidationError({message: 'cannot filter by course AND category'});
		} else if (course) {
			queryOptions.course = course;
		} else if (category) {
			queryOptions.category = category;
		}

		const grades = await api.grade.browse(queryOptions, req._table);
		let status = 500;
		if (Array.isArray(grades)) {
			status = 200;
			grades.forEach(sanitizeGrade);
		}

		res.status(status).json(grades);
	},
	create: async (req, res) => {
		const {name, grade} = req.body;
		const {user, category, course} = req.permissions;

		const newGrade = await api.grade.create(
			// eslint-disable-next-line camelcase
			{user_id: user, course_id: course, category_id: category, grade, name},
			null,
			req._table
		);

		const statusCode = newGrade.error ? 500 : 201;
		return res.status(statusCode).json(sanitizeGrade(newGrade));
	},
	read(req, res) {
		res.status(200).json(sanitizeGrade(req.queriedData.json));
	},
	// @todo: disallow grade->category / category->grade conversion
	// This should be as simple as adding isNull or isNotNull conditions
	// to the API layer
	async edit(req, res) {
		const {id} = req.params;
		const {queriedData: gradeObject} = req;
		const updatedData = {};

		if ('name' in req.body) {
			if (gradeObject.get('name') === null) {
				throw new errors.BadRequestError({message: 'cannot set name of category'});
			}

			updatedData.name = req.body.name;
		}

		if ('grade' in req.body) {
			updatedData.grade = req.body.grade;
		}

		const response = await api.grade.update(id, gradeObject, updatedData, null, req._table);

		res.status(200).json(sanitizeGrade(response));
	},
	delete: async (req, res) => {
		const {objectId: id} = req.permissions;
		const result = await api.grade.delete(id, null, req._table);

		const status = result ? 204 : 500;

		res.status(status).end();
	},
	async batchEdit(req, res) {
		const txn = await api.getTransaction();
		const created = [];
		const updated = [];

		try {
			const {queriedData: {course, gradeMap}} = req;
			const {id: category} = req.params;

			if (req.permissions.update.length > 0) {
				for (const toUpdate of req.permissions.update) {
					const {id} = toUpdate;
					const model = gradeMap[id];
					delete toUpdate.id;

					// eslint-disable-next-line no-await-in-loop
					const diff = await api.grade.update(id, model, toUpdate, txn, req._table);
					updated.push(sanitizeGrade(diff));
				}
			}

			if (req.permissions.delete.length > 0) {
				await api.grade.deleteMultiple(req.permissions.delete, txn, req._table);
			}

			if (req.permissions.create.length > 0) {
				for (const toCreate of req.permissions.create) {
					/* eslint-disable camelcase */
					toCreate.category_id = category;
					toCreate.course_id = course;
					toCreate.user_id = req.user.id;
					/* eslint-enable camelcase */
					// eslint-disable-next-line no-await-in-loop
					const createdGrade = await api.grade.create(toCreate, txn, req._table);
					created.push(sanitizeGrade(createdGrade));
				}
			}

			await txn.commit();
			res.status(200).json({created, updated});
		} catch (error) {
			await txn.rollback();
			throw new errors.InternalServerError({err: error});
		}
	}
};
