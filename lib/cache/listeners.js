const events = require('../events');
const cache = require('./store');

const purgeCache = () => cache.purge('*');

module.exports.init = () => {
	// @todo: add more specific cache handling
	events.on('user.removed', purgeCache);
	events.on('course.removed', purgeCache);
	events.on('row.removed', purgeCache);
	events.on('subRow.removed', purgeCache);

	events.on('user.changed', purgeCache);
	events.on('course.changed', purgeCache);
	events.on('row.changed', purgeCache);
	events.on('subRow.changed', purgeCache);
};
