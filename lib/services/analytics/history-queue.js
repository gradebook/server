const debug = require('debug')('agb:analytics:history-queue');
const date = require('dayjs');
const sleep = require('../../utils/sleep');
const Queue = require('../../utils/queue');
const {knex} = require('../../database');
const log = require('../../logging');

module.exports = class HistoryQueue extends Queue {
	constructor(eventName) {
		super();
		this.processFn = this.processEvent.bind(this);
		this.internalSummations = [];
		this.empty = true;
		this.eventName = eventName;
	}

	async processEvent(dataArray) {
		debug(`Processing event ${dataArray} for ${this.eventName}`);
		if (!this._continue) {
			await sleep(25);
		}

		for (let index = 0; index < dataArray.length; ++index) {
			if (isNaN(this.internalSummations[index])) {
				this.internalSummations[index] = dataArray[index];
				this.empty = false;
				continue;
			}

			this.internalSummations[index] += dataArray[index];
		}

		this.empty = false;
	}

	async commit() {
		if (this.empty) {
			debug(`Not flushing ${this.eventName} since it's empty`);
			return;
		}

		await this.pause();
		const timestamp = date().format('YYYY-MM-DD hh:mm');
		const initialSummations = this.internalSummations;
		this.internalSummations = [];
		this.empty = true;

		const data = initialSummations.join('|');

		try {
			const rowID = await knex('actions').insert({type: this.eventName, timestamp, data});

			if (rowID < 1) {
				log.error(`Failed to insert action ${this.eventName}, response was ${rowID}`);
				this.internalSummations = [...initialSummations, ...this.internalSummations];
				this.empty = false;
			}
		} catch (error) {
			log.error(`Failed to insert action ${this.eventName}`);
			log.error(error);

			this.internalSummations = [...initialSummations, ...this.internalSummations];
			this.empty = false;
		}

		this.resume();
	}
};
