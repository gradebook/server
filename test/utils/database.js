// @ts-check
import connection from '../../lib/database/knex.js';

export async function destroy() {
	// Remove unneeded data
	await connection.instance.transaction(trx => {
		const queries = [
			'DELETE FROM `sessions` WHERE `sessionAGB` NOT LIKE "%authorized";',
		];

		return Promise.all(queries.map(query => trx.raw(query)));
	});
	connection.instance.destroy();
}
