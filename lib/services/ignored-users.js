// @ts-check
import {hostMap} from './host.js';

export const ignoredUsers = new class {
	constructor() {
		/** @type {Set<string>} */
		this._users = new Set();
		/** @type {Set<string>} */
		this._gidList = new Set();
		this._initMutex = false;
	}

	/**
	 * @private
	 * @param {import('../database').knex} knex
	 * @param {string} db
	 * @param {string[]} ignoreList
	 */
	async _getUsersFromSchool(knex, db, ignoreList) {
		const users = await knex({db, table: 'users'}).select('id').whereIn('gid', ignoreList);
		for (const {id} of users) {
			this._users.add(id);
		}
	}

	/**
	 * @param {import('../config').default} config
	 * @param {import('../database').knex} knex
	 * @returns {Promise<void[]>}
	 */
	init(config, knex) {
		if (this._initMutex) {
			return;
		}

		const ignoredUsers = config.get('ignoredUsers');

		if (!Array.isArray(ignoredUsers)) {
			throw new TypeError('ignoredUsers in config is not an array');
		}

		this._gidList = new Set(ignoredUsers);
		const promises = [];

		if (hostMap) {
			for (const host of hostMap.values()) {
				promises.push(this._getUsersFromSchool(knex, host, ignoredUsers));
			}
		} else {
			promises.push(this._getUsersFromSchool(knex, null, ignoredUsers));
		}

		return Promise.all(promises);
	}

	/**
	 * @description determines if a user in a school is ignored
	 * @param {string} id
	 */
	isUserIdIgnored(id) {
		return this._users.has(id);
	}

	/**
	 * @description determines if a gid should be ignored
	 * @param {string} gid
	 * @returns {boolean}
	 */
	isUserIgnored(gid) {
		return this._users.has(gid);
	}
}();
