// @ts-check

/**
 * @class Queue
 * @classdesc Base queue class
 * @template T
 */
module.exports = class Queue {
	/**
	 * @param {function} op the function to process queue items
	 * @param {boolean} runImmediately if queue should run when an item is added
	 */
	constructor(op = () => null, runImmediately = true) {
		this._running = false;
		this.processFn = op;
		/** @type {T[]} _list */
		this._list = [];
		this.immediate = runImmediately;
		this._continue = true;
		/** @type {Promise|void} */
		this._promise = null;
	}

	/**
	 * @name Queue#add
	 * @description Add item to queue
	 * @param {T} item the item to add to the process queue
	 */
	add(item) {
		this._list.push(item);

		if (this.immediate) {
			this.process();
		}
	}

	/**
	 * @name Queue#pause
	 * @description stops queue processing
	 * @returns {Promise<void>} resolves once the queue is done processing
	 */
	async pause() {
		this._continue = false;
		await this._promise;
	}

	/**
	 * @name Queue#resume
	 * @description resumes queue processing
	 */
	resume() {
		if (this._continue) {
			return;
		}

		this._continue = true;
		if (this.immediate) {
			this.process();
		}
	}

	/**
	 * @name Queue#process
	 * @description process the next item in the queue
	 */
	async process() {
		if (this._promise || this._list.length === 0) {
			return;
		}

		// We're using async execution in this promise because we need to make the promise visible to
		// other internal functions (e.g. committing in the history queue)
		// eslint-disable-next-line no-async-promise-executor
		this._promise = new Promise(async (resolve, reject) => {
			try {
				await this.processFn(this._list.shift());

				if (this.immediate && this._continue) {
					this._promise = null;
					resolve(this.process());
				} else {
					this._promise = null;
					resolve();
				}
			} catch (error) {
				this._promise = null;
				reject(error);
			}
		});

		return this._promise;
	}
};
