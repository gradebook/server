after(() => {
	const knex = require('../lib/database/knex');
	knex.instance.destroy();

	const cron = require('../lib/services/cron/init');
	cron._tasks.forEach(task => task.stop());
});
