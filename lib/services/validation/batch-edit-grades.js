// @ts-check
import {isObjectIDValid} from '../../utils/object-id-valid.js';
import * as errors from '../../errors/index.js';
import {validateSchemeOrDie} from './schema-validator.js';

export default function validateJob(request, _) {
	const {body} = request;
	const {id: category} = request.params;

	if (!isObjectIDValid(category)) {
		throw new errors.NotFoundError();
	}

	validateSchemeOrDie('grades.batch', body);

	for (const prop of ['create', 'delete', 'update']) {
		if (!(prop in body)) {
			body[prop] = [];
		}
	}

	for (let i = 0; i < body.delete.length; ++i) {
		if (!isObjectIDValid(body.delete[i])) {
			throw new errors.ValidationError({context: 'Validate delete', message: `invalid id: /delete/${i}`});
		}
	}

	for (let i = 0; i < body.create.length; ++i) {
		body.create[i].category = category;
	}

	const permissionIds = [...body.delete];

	for (let i = 0; i < body.update.length; ++i) {
		const grade = body.update[i];
		if (!isObjectIDValid(grade.id)) {
			throw new errors.ValidationError({message: `invalid id: /update/${i}`});
		}

		if (permissionIds.includes(grade.id)) {
			throw new errors.ValidationError({message: `duplicate id: /update/${i}`});
		}

		permissionIds.push(grade.id);
	}

	request.permissions = {
		user: request.user.id,
		ids: permissionIds,
		category,
		create: body.create,
		update: body.update,
		delete: body.delete,
	};
}
