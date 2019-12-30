// Don't import as module since the queries depend on the cache being initialized
const knex = require('../../database/knex');
const AbstractSettingsStore = require('./base-adapter');

module.exports = class SQLSettingsStore extends AbstractSettingsStore {
	/**
	 * Create SQL query for SQLite
	 * @private
	 */
	static _makeSqliteUpsertQuery(txn, key, value) {
		return txn.raw('INSERT OR REPLACE INTO settings(key, value) VALUES (?, ?);', [key, value]);
	}

	/**
	 * Create SQL query for MariaDB / MySQL
	 * @private
	 */
	static _makeMysqlUpsertQuery(txn, key, value) {
		return txn.raw(
			'INSERT INTO settings(key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE key=VALUES(key), value=VALUES(value);',
			[key, value]
		);
	}

	/**
	 * @override
	 */
	async updateMultiple(kvPairs) {
		const txn = await knex.instance.transaction();

		try {
			const update = knex.instance.config.client === 'sqlite3' ?
				SQLSettingsStore._makeSqliteUpsertQuery : SQLSettingsStore._makeMysqlUpsertQuery;

			const promises = [];

			for (const [key, value] of kvPairs) {
				promises.push(update(txn, key, value));
			}

			await Promise.all(promises);
			await txn.commit();
		} catch (error) {
			await txn.rollback();
			throw error;
		}
	}

	async fetch() {
		const data = await knex({table: 'settings'}).select('*');

		return data.reduce((obj, {key, value}) => {
			obj[key] = value;
			return obj;
		}, {});
	}
};