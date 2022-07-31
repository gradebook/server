// @ts-check
import config from '../../config.js';

const adapterFile = String(config.get('redis')) === 'true' ? './redis-adapter.js' : './sql-adapter.js';
/** @type {import('./redis-adapter.js') | import('./sql-adapter.js')} */
const {Adapter} = await import(adapterFile);

export const settings = new Adapter();
