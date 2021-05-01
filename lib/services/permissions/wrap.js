// @ts-check
const debug = require('ghost-ignition').debug('permissions:wrapper');
const errors = require('../../errors');

/**
 * @typedef {object} CodedObject
 * @property {number} ___code
 *
 * @typedef {object} StandardObject
 * @property {object} data
 * @property {number | true} status
 *
 * @typedef {(permissions, database: string | null) => Promise<number | true | CodedObject | StandardObject>} Wrappable
 *
 * @typedef {(request: Gradebook.Request, response: Gradebook.Response) => Promise<Gradebook.Response | undefined>} Wrapped
 */

/**
 * @param {Wrappable} functionToWrap
 * @returns {Wrapped}
 */
module.exports = function wrapPermissionVerification(functionToWrap) {
	return async function verifyPermissions(request, response) {
		let permissionsResponse;
		try {
			permissionsResponse = await functionToWrap(request.permissions, request._table);
		} catch (error) {
			throw new errors.InternalServerError({err: error});
		}

		if (typeof permissionsResponse === 'object') {
			if ('___code' in permissionsResponse) {
				const {___code: code} = permissionsResponse;
				delete permissionsResponse.___code;
				return response.status(code).json(permissionsResponse);
			}

			request.queriedData = permissionsResponse.data;
			permissionsResponse = permissionsResponse.status;
		}

		if (permissionsResponse === true) {
			return;
		}

		if (typeof permissionsResponse === 'number' && permissionsResponse >= 400 && permissionsResponse < 500) {
			if (permissionsResponse === 404) {
				throw new errors.NotFoundError();
			}

			response.status(permissionsResponse).end();
			return response;
		}

		debug('Permissions not verified', permissionsResponse);
		throw new errors.InternalServerError({message: 'Unable to verify permissions'});
	};
};
