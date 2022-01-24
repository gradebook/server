// @ts-check
import {isObjectIDValid} from '../../utils/object-id-valid.js';
import * as errors from '../../errors/index.js';

export default function validateForReadAndDelete(request, _) {
	if (!isObjectIDValid(request.params.id)) {
		throw new errors.NotFoundError();
	}

	request.permissions = {
		user: request.user.id,
		objectId: request.params.id,
	};
}
