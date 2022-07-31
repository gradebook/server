// @ts-check
import {isObjectIDValid} from '../../utils/object-id-valid.js';
import * as errors from '../../errors/index.js';
import {validateSchemeOrDie} from './schema-validator.js';

export default function checkForRequiredCategoryKeys(request, _) {
	validateSchemeOrDie('category.edit', request.body);

	if (!isObjectIDValid(request.params.id)) {
		throw new errors.NotFoundError();
	}

	request.permissions = {
		user: request.user.id,
		objectId: request.params.id,
		forUpdate: true,
	};
}
