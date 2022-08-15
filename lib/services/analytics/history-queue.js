// @ts-check
import {dayjs as date} from '@gradebook/time';
import createDebugger from 'ghost-ignition/lib/debug.js';
import sleep from '../../utils/sleep.js';
import {Queue} from '../../utils/queue.js';
import {knex} from '../../database/index.js';
import log from '../../logging.js';
import config from '../../config.js';
import hostMatches from '../host.js';

const debug = createDebugger('analytics:history-queue');

const NO_DB = '__NO_DATABASE__';

export default class HistoryQueue extends Queue {
	/** @param {string} eventName */
	constructor(eventName) {
		super();
		this.processFn = this.processEvent.bind(this);
		this.empty = true;
		this.eventName = eventName;
		/** @type {{[s:string]: array}} */
		this._summations = {};
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
			/* eslint-disable-next-line unicorn/prefer-number-properties */
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
		const initialSummations = this._resetSummations();
		this.empty = true;

		const promises = [];
		for (const key in initialSummations) { // eslint-disable-line guard-for-in
			const summation = initialSummations[key];
			const database = key === NO_DB ? null : key;

			if (summation.length === 0) {
				continue;
			}

			promises.push(
				this._commitSummation(summation, timestamp, database).then(succeeded => {
					if (!succeeded) {
						this.empty = false;
						this._summations[key] = [...summation, this._summations[key]];
					}
				}),
			);
		}

		await Promise.all(promises);

		this.resume();
	}

	/**
	 * @private
	 * Resets every known summation
	 * @returns {{[s: string]: array}} previous summation list
	 */
	_resetSummations() {
		const previousList = this._summations;
		this._summations = {};

		if (hostMatches) {
			for (const [, database] of hostMatches) {
				this._summations[database] = [];
			}
		} else {
			this._summations[NO_DB] = [];
		}

		return previousList;
	}

	/**
	 * @private
	 * Gets the summation associated with {database}
	 * @param {string} database
	 * @returns {number[]}
	 */
	_getSummation(database) {
		if (!hostMatches) {
			return this._summations[NO_DB];
		}

		return this._summations[database];
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
}
