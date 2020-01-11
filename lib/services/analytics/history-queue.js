// @ts-check
const debug = require('ghost-ignition').debug('analytics:history-queue');
const date = require('dayjs');
const sleep = require('../../utils/sleep');
const Queue = require('../../utils/queue');
const {knex} = require('../../database');
const log = require('../../logging');
const config = require('../../config');
const hostMatches = require('../host');

const NO_DB = '__NO_DATABASE__';

module.exports = class HistoryQueue extends Queue {
	/** @param {string} eventName */
	constructor(eventName) {
		super();
		this.processFn = this.processEvent.bind(this);
		this.empty = true;
		this.eventName = eventName;
		/** @type {Map<string, any[]>} */
		this._summations = new Map();
		this._resetSummations();
	}

	/**
	 *  @param {array} dataArray
	 */
	async processEvent(dataArray) {
		debug(`Processing event ${dataArray} for ${this.eventName}`);
		if (!this._continue) {
			await sleep(25);
		}

		const [database, ...data] = dataArray;

		const summation = this._getSummation(database);

		/* eslint-disable-next-line unicorn/no-for-loop */
		for (let index = 0; index < data.length; ++index) {
			if (isNaN(summation[index])) {
				summation[index] = data[index];
				this.empty = false;
				continue;
			}

			summation[index] += data[index];
		}

		this.empty = false;
	}

	async commit() {
		if (config.get('analytics').toString() === 'false') {
			this._resetSummations();
			return;
		}

		if (this.empty) {
			debug(`Not flushing ${this.eventName} since it's empty`);
			return;
		}

		await this.pause();
		const timestamp = date().format('YYYY-MM-DD HH:mm');
		const initialSummations = this._summations.entries();
		this._resetSummations();
		this.empty = true;

		const promises = [];

		// @TODO: DRY
		if (hostMatches) {
			for (const [database, summation] of initialSummations) {
				promises.push(
					this._commitSummation(summation, timestamp, database).then(succeeded => {
						if (!succeeded) {
							this.empty = false;
							this._summations.set(database, [...summation, this._summations.get(database)]);
						}
					})
				);
			}
		} else {
			for (const [database, summation] of initialSummations) {
				if (database !== NO_DB) {
					continue;
				}

				promises.push(
					this._commitSummation(summation, timestamp).then(succeeded => {
						if (!succeeded) {
							this.empty = false;
							this._summations.set(NO_DB, [...summation, this._summations.get(NO_DB)]);
						}
					})
				);
			}
		}

		await Promise.all(promises);

		this.resume();
	}

	/**
	 * @private
	 * Resets every known summation
	 */
	_resetSummations() {
		this._summations.clear();

		if (hostMatches) {
			for (const [, database] of hostMatches) {
				this._summations[database] = [];
			}
		} else {
			this._summations.set(NO_DB, []);
		}
	}

	/**
	 * @private
	 * Gets the summation associated with {database}
	 * @param {string} database
	 * @returns {number[]}
	 */
	_getSummation(database) {
		if (!hostMatches) {
			return this._summations.get(NO_DB);
		}

		return this._summations.get(database);
	}

	/**
	 * @param {any[]} summation
	 * @param {string} timestamp
	 * @param {string} db
	 * @returns {Promise<boolean>} if the data was successfully committed
	 */
	async _commitSummation(summation, timestamp, db = null) {
		const data = summation.join('|');

		try {
			await knex({db, table: 'actions'}).insert({type: this.eventName, timestamp, data});
		} catch (error) {
			log.error(`Failed to insert action ${this.eventName}`);
			log.error(error);

			return false;
		}

		return true;
	}
};
