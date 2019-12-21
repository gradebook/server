// @ts-check
const DEFAULT_MUTEX_DURATION = 5000;

class TimedMutex {
	constructor() {
		/**
		* List of mutexes and their associated expiry
		* @type {Map<String, number>}
		* @private
		*/
		this._locks = new Map();
	}

	/**
	 * Attempt to acquire a lock on {name} for {expiresAfter}ms
	 * @param {string} name the mutex to lock
	 * @param {number} expiresAfter amount of time mutex is valid, in ms
	 * @returns {boolean} if the mutex was successfully acquired
	 */
	acquire(name, expiresAfter = DEFAULT_MUTEX_DURATION) {
		if (this._locks.has(name)) {
			const expiry = this._locks.get(name);

			// CASE: Mutex is still valid
			if (expiry < Date.now()) {
				return false;
			}
		}

		this._locks.set(name, Date.now() + expiresAfter);
		return true;
	}

	/**
	* Release a mutex lock
	* @param {string} name the mutex to free
	* @return {boolean} if the lock was deleted
	*/
	release(name) {
		return this._locks.delete(name);
	}
}

module.exports = new TimedMutex();
