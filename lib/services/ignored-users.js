// @ts-check
module.exports = new class {
	constructor() {
		/** @type {Map<string, Set<string>>} */
		this._users = new Map();
		/** @type {Set<string>} */
		this._gidList = new Set();
		this._initMutex = false;
	}

	/**
	 * @private
	 * @param {import('../database/knex')} knex
	 * @param {string} db
	 * @param {string[]} ignoreList
	 */
	async _getUsersFromSchool(knex, db, ignoreList) {
		const users = await knex({db, table: 'users'}).select('id').whereIn('gid', ignoreList);
		this._users.set(db, new Set(users.map(({id}) => id)));
	}

	/**
	 * @param {import('../config')} config
	 * @param {import('../database/knex')} knex
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

		const hosts = require('./host');
		this._gidList = new Set(ignoredUsers);
		const promises = [];

		if (hosts) {
			for (const host of hosts.values()) {
				promises.push(this._getUsersFromSchool(knex, host, ignoredUsers));
			}
		} else {
			promises.push(this._getUsersFromSchool(knex, null, ignoredUsers));
		}

		return Promise.all(promises);
	}

	/**
	 * @description get a list of user ids to ignore
	 * @param {string} school
	 * @returns {Set<string>} users to ignore
	 */
	getIgnoreUserList(school) {
		return this._users.get(school) || new Set();
	}

	/**
	 * @description determines if a user in a school is ignored
	 * @param {string} db
	 * @param {string} id
	 */
	isUserIdIgnored(db, id) {
		const ignoreList = this._users.get(db);

		if (!ignoreList) {
			throw new Error(`Unknown database: ${db}`);
		}

		return ignoreList.has(id);
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
