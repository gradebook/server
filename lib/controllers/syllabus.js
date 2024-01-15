// @ts-check
import {writeFile} from 'node:fs/promises';
import path from 'node:path';
import objectID from 'bson-objectid';
import {executeGlobalStoreMethod} from '../services/global-store.js';
import {sha1} from '../utils/file-hash.js';
import config from '../config.js';

const userUploadsRoot = config.get('userUploadsRoot');

/**
 * @param {Gradebook.Request} request
 * @param {Gradebook.Response} response
 */
export async function upload(request, response) {
	const {id} = request.params;
	const {file} = request;

	const uploadData = await executeGlobalStoreMethod('getUploadMutex', id);
	if (!uploadData) {
		// If we weren't able to acquire the mutex, still link the file - the file should theoretically be uploaded in a bit
		response.context = {
			statusCode: 204,
		};
		return;
	}

	const uploadHash = await sha1(file.buffer);

	if (uploadHash !== uploadData.hash) {
		throw new Error('Unexpected state');
	}

	// Force the file extension to be `.bin` but keep the previous one
	const finalDestination = path.join(userUploadsRoot, `${uploadData.hash}${path.extname(file.originalname)}.bin`);

	await writeFile(finalDestination, file.buffer);
	await executeGlobalStoreMethod('releaseUploadMutex', id, finalDestination);

	response.context = {
		statusCode: 204,
	};
}

const createUploadContext = id => ({body: {url: `/api/v0/syllabus/upload/${id}`}, statusCode: 200});

/**
 * @param {Gradebook.Request} request
 * @param {Gradebook.Response} response
 */
export async function link(request, response) {
	const {hash, name} = request.body;
	const existingFile = await executeGlobalStoreMethod('getUpload', hash);
	if (existingFile) {
		if (existingFile.path) {
			await executeGlobalStoreMethod('insert', 'users_uploads', {
				school: request._table ?? 'default', // Table can be null when host matching is disabled
				user: request.user.id,
				upload_id: existingFile.id, // eslint-disable-line camelcase
				original_file_name: name, // eslint-disable-line camelcase
			});

			response.context = {statusCode: 200, body: {success: true}};
			return;
		}

		response.context = createUploadContext(existingFile.id);
		return;
	}

	const id = objectID().toHexString();
	await executeGlobalStoreMethod('insert', 'uploads', {
		id,
		hash,
		path: null,
		type: 'syllabus',
	});

	response.context = createUploadContext(id);
}
