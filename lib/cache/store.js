const debug = require('ghost-ignition').debug('cache');

const cache = {};
let locked = false;

module.exports = {
	get(key) {
		return cache[key];
	},
	purge(expression = '*') {
		if (locked) {
			return false;
		}

		locked = true;
		const star = expression.indexOf('*');
		// CASE: wildcard specified
		if (star >= 0) {
			// CASE: middle wildcard (i.e. visit:*:relations@null)
			if (expression.lastIndexOf('*') !== star) {
				debug(`PURGE ${expression} is not possible`);
				throw new Error('Expressions with middle wildcards are not supported');
			}

			const prefix = expression.substr(0, star);
			Object.keys(cache)
				.filter(key => key.indexOf(prefix) === 0)
				.forEach(key => {
					debug(`PURGE key ${key} from expression ${expression}`);
					delete cache[key];
				});
		} else {
			debug(`PURGE ${expression} (single)`);
			delete cache[expression];
		}

		locked = false;
	},
	update(key, value) {
		if (locked) {
			return false;
		}

		locked = true;
		cache[key] = value;
		locked = false;
	}
};
