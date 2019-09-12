const EventEmitter = require('events');

const registry = new EventEmitter();
registry.setMaxListeners(25);

/* Const realEmit = registry.emit;

registry.emit = (...args) => {
	console.log('EMIT', ...args);
	realEmit.call(registry, ...args);
};
 */
module.exports = registry;
