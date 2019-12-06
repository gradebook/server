const get = require('lodash.get');
// Don't import as module since the queries depend on the cache being initialized
const knex = require('../database/knex');
const randomLetters = require('../security/random-letters');
const log = require('../logging');

let cache = {};

async function update() {
	cache = {};
	const data = await knex.select('*').from('settings');
	data.forEach(({key, value}) => {
		cache[key] = value;
	});
}

async function initialize() {
	await update();
	let updateRequired = false;

	if (!cache.session_secret) {
		await knex('settings').insert({
			key: 'session_secret',
			value: randomLetters(40)
		});
		updateRequired = true;
	}

	if (!cache.max_courses_per_semester) {
		log.info('Adding setting: max_courses_per_semester');
		await knex('settings').insert({
			key: 'max_courses_per_semester',
			value: 7
		});
		updateRequired = true;
	}

	if (!cache.max_categories_per_course) {
		log.info('Adding setting: max_categories_per_course');
		await knex('settings').insert({
			key: 'max_categories_per_course',
			value: 25
		});
		updateRequired = true;
	}

	if (!cache.max_grades_per_category) {
		log.info('Adding setting: max_grades_per_category');
		await knex('settings').insert({
			key: 'max_grades_per_category',
			value: 40
		});
		updateRequired = true;
	}

	if (updateRequired) {
		await update();
	}
}

module.exports.init = initialize;
module.exports.update = update;
module.exports.get = (key, defaultValue) => {
	return get(cache, key, defaultValue);
};
