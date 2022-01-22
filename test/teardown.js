// @ts-check
/* eslint-disable mocha/no-top-level-hooks */
/* eslint-disable mocha/no-hooks-for-single-case */

import {preFetch} from './utils/schema-validator.js';

before(preFetch);

after(async function () {
	const knex = await import('../lib/database/index.js').then(mod => mod.knex.instance);
	knex.destroy();

	const cronTasks = await import('../lib/services/cron/init.js').then(mod => mod._tasks);
	cronTasks.forEach(task => task.stop()); // eslint-disable-line unicorn/no-array-for-each
});
