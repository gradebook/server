after(() => {
	const knex = require('../lib/database/knex');
	knex.instance.destroy();
});
