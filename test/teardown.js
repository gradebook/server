after(() => {
	const knex = require('../lib/database/knex');
	knex.destroy();
});
