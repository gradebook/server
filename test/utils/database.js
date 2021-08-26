const connection = require('../../lib/database/knex');

module.exports = {
	init() {
		connection.init();
		return connection;
	},
	async destroy() {
		// Remove unneeded data
		await connection.transaction(trx => {
			const queries = [
				'DELETE FROM `sessions` WHERE `sessionAGB` NOT LIKE "%authorized";',
			];

			return Promise.all(queries.map(query => trx.raw(query)));
		});
		connection.destroy();
	},
};
