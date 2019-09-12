const {grades} = require('../../database/schema');
const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const createSanitizer = require('../../utils/sanitize-object');

const ALLOWED_KEYS = Object.keys(grades).filter(column => !column.match(/id$/i));
const sanitize = createSanitizer(grades, ALLOWED_KEYS);

ALLOWED_KEYS.push('id');
const updateSanitize = createSanitizer(grades, ALLOWED_KEYS);

module.exports = function validateJob(req, _, next) {
	const {body} = req;
	const {id: category} = req.params;
	const permissionIds = [];

	if (!isObjectID(category)) {
		throw new errors.NotFoundError();
	}

	if ('delete' in body) {
		if ('create' in body) {
			throw new errors.ValidationError({message: 'cannot create AND delete grades in a batch job, use update instead'});
		}

		if (!Array.isArray(body.delete)) {
			throw new errors.ValidationError({message: 'grades to delete must be an array'});
		}

		for (let i = 0; i < body.delete.length; ++i) {
			const grade = body.delete[i];
			if (!isObjectID(grade)) {
				throw new errors.ValidationError({message: `invalid id: body.delete[${i}]`});
			} else if (permissionIds.includes(body.delete[i])) {
				throw new errors.ValidationError({message: `duplicated id detected: ${grade}`});
			}

			permissionIds.push(grade);
		}
	} else if ('create' in body) {
		if (!Array.isArray(body.create)) {
			throw new errors.ValidationError({message: 'grades to create must be an array'});
		}

		for (let i = 0; i < body.create.length; ++i) {
			const grade = sanitize(body.create[i], false);

			if (!grade.category_id) {
				grade.category_id = category; // eslint-disable-line camelcase
			} else if (grade.category_id !== category) {
				throw new errors.ValidationError({message: `invalid category for body.create[${i}]`});
			}

			body.create[i] = grade;
		}
	}

	if ('update' in body) {
		if (!Array.isArray(body.update)) {
			throw new errors.ValidationError({message: 'grades to update must be an array'});
		}

		for (let i = 0; i < body.update.length; ++i) {
			const grade = body.update[i];
			if (!isObjectID(grade.id)) {
				throw new errors.ValidationError({message: `invalid id for body.update[${i}]`});
			}

			if (permissionIds.includes(grade.id)) {
				throw new errors.ValidationError({message: `duplicate id detected for body.update[${i}]`});
			}

			permissionIds.push(grade.id);
			body.update[i] = updateSanitize(grade, false);
		}
	}

	req.permissions = {
		user: req.user.id,
		ids: permissionIds,
		category,
		create: body.create || [],
		update: body.update || [],
		delete: body.delete || []
	};

	next();
};
