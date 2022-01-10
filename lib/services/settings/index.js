// @ts-check
const config = require('../../config');

class AdapterManager {
	constructor() {
		/** @type {import('./base-adapter')} */
		this._store = null;
	}

	async init() {
		const adapterFile = String(config.get('redis')) === 'true' ? './redis-adapter' : './sql-adapter';
		const Adapter = require(adapterFile);

		/** @type {import('./base-adapter')} */
		this._store = new Adapter();
		await this._store.init();
	}

	/**
	 * @param {Parameters<import('./base-adapter')['get']>[0]} key
	 * @returns {ReturnType<import('./base-adapter')['get']>}
	 */
	get(key) {
		if (!this._store) {
			throw new Error('Settings service has not been initialized');
		}

		return this._store.get(key);
	}
}

module.exports = new AdapterManager();
