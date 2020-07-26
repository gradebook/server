const isObjectID = require('../../utils/object-id-valid');
const errors = require('../../errors');
const ajv = require('./schema-validator');

module.exports = function validateJob(req, _) {
	const {body} = req;
	const {id: category} = req.params;

	if (!isObjectID(category)) {
		throw new errors.NotFoundError();
	}

	ajv.validateSchemeOrDie('grades.batch', body);

	for (const prop of ['create', 'delete', 'update']) {
		if (!(prop in body)) {
			body[prop] = [];
		}
	}

	for (let i = 0; i < body.delete.length; ++i) {
		if (!isObjectID(body.delete[i])) {
			throw new errors.ValidationError({context: 'Validate delete', message: `invalid id: .delete[${i}]`});
		}
	}

	for (let i = 0; i < body.create.length; ++i) {
		body.create[i].category = category;
	}

	const permissionIds = [...body.delete];

	for (let i = 0; i < body.update.length; ++i) {
		const grade = body.update[i];
		if (!isObjectID(grade.id)) {
			throw new errors.ValidationError({message: `invalid id: .update[${i}]`});
		}

		if (permissionIds.includes(grade.id)) {
			throw new errors.ValidationError({message: `duplicate id: .update[${i}]`});
		}

		permissionIds.push(grade.id);
	}

	req.permissions = {
		user: req.user.id,
		ids: permissionIds,
		category,
		create: body.create,
		update: body.update,
		delete: body.delete
	};
};
