// @ts-check
const DEFAULT_MUTEX_DURATION = 5000;

class TimedMutex {
	constructor() {
		/**
	* List of mutexes and their associated expiry
	* @private
	*/
		this._locks = {};
	}

	/**
	 * Attempt to acquire a lock on {name} for {expiresAfter}ms
	 * @param {string} name the mutex to lock
	 * @param {number} expiresAfter amount of time mutex is valid, in ms
	 * @returns {boolean} if the mutex was successfully acquired
	 */
	acquire(name, expiresAfter = DEFAULT_MUTEX_DURATION) {
		if (name in this._locks) {
			const expiry = this._locks[name];

			// CASE: Mutex is still valid
			if (expiry < Date.now()) {
				return false;
			}
		}

		this._locks[name] = Date.now() + expiresAfter;
		return true;
	}

	/**
	* Release a mutex lock
	* @param {string} name the mutex to free
	*/
	release(name) {
		delete this._locks[name];
	}
}

module.exports = new TimedMutex();
