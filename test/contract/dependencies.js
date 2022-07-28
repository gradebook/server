// @ts-check
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_ROOT = '../../lib/frontend/client/src/app/interfaces/';

export const clientDependencies = {
	'api.contract.ts': path.resolve(__dirname, CLIENT_ROOT, 'api.contract.ts'),
	'network.ts': path.resolve(__dirname, CLIENT_ROOT, 'network.ts'),
	'category.ts': path.resolve(__dirname, CLIENT_ROOT, 'category.ts'),
	'grade.ts': path.resolve(__dirname, CLIENT_ROOT, 'grade.ts'),
};
