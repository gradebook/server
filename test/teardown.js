/* eslint-disable mocha/no-top-level-hooks */
/* eslint-disable mocha/no-hooks-for-single-case */
after(function () {
	const knex = require('../lib/database/knex');
	knex.instance.destroy();

	const cron = require('../lib/services/cron/init');
	cron._tasks.forEach(task => task.stop()); // eslint-disable-line unicorn/no-array-for-each
});
