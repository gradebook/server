// @ts-check
export class Context {
	#action;
	#context;

	/**
	 * @param {string} action
	 */
	constructor(action) {
		this.#action = action;
		this.#context = [];
	}

	/**
	 * @param {string} additionalContext
	 */
	unshift(additionalContext) {
		this.#context.unshift(additionalContext);
	}

	/**
	 * @param {string} additionalContext
	 */
	push(additionalContext) {
		this.#context.push(additionalContext);
	}

	shift() {
		this.#context.shift();
	}

	pop() {
		this.#context.pop();
	}

	/**
	 * @param {string} reason
	 * @throws {Error}
	 * @returns {never}
	 */
	throw(reason) {
		throw new Error(`${this.#action} failed on "${this.#context.join('')}" - ${reason}`);
	}
}
