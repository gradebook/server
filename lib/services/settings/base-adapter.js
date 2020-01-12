// @ts-check
const randomLetters = require('../../security/random-letters');

/* eslint-disable camelcase */
const DEFAULT_SETTINGS = {
	session_secret: randomLetters(40),
	max_courses_per_semester: 7,
	max_categories_per_course: 25,
	max_grades_per_category: 40
};
/* eslint-enable camelcase */

/**
 * @abstract
 */
module.exports = class AbstractSettingsStore {
	// @todo: make this a property when eslint supports it
	static get DEFAULT_SETTINGS() {
		return DEFAULT_SETTINGS;
	}

	constructor() {
		/**
		 * Key-value cache
		 * @private
		 * @type {Map<String, any>}
		 */
		this._cache = new Map();

		/**
		 * Initialization is only allowed once
		 * @private
		 */
		this._initialized = false;
	}

	/**
	 * @abstract
	 * @returns {Promise<{}>}
	 */
	fetch() {
		throw new Error('fetch is not implemented');
	}

	/**
	 * @abstract
	 * @param {[string, any][]} settings Array of [key, value] pairs to set
	 * @returns {Promise<void>}
	 */
	setMultiple(settings) { // eslint-disable-line no-unused-vars
		throw new Error('setMultiple is not implemented');
	}

	/**
	 * Initialize the settings object
	 */
	async init() {
		if (this._initialized) {
			return;
		}

		const settings = await this.fetch();

		/**
		 * @type {[String, any][]}
		 */
		const missingSettings = [];

		// eslint-disable-next-line guard-for-in
		for (const setting in AbstractSettingsStore.DEFAULT_SETTINGS) {
			if (setting in settings) {
				this._cache.set(setting, settings[setting]);
				continue;
			}

			const settingValue = AbstractSettingsStore.DEFAULT_SETTINGS[setting];
			missingSettings.push([setting, settingValue]);
			this._cache.set(setting, settingValue);
		}

		if (missingSettings.length > 0) {
			await this.setMultiple(missingSettings);
			// After making changes to our cache, we _must_ update our values to prevent network race conditions
			await this.update();
		}
	}

	/**
	 * Update stored settings
	 */
	async update() {
		const settings = await this.fetch();

		for (const setting in AbstractSettingsStore.DEFAULT_SETTINGS) {
			if (setting in settings) {
				this._cache.set(setting, settings[setting]);
			}
		}
	}

	/**
	 * Get a setting property
	 * @param {string} key the setting to lookup
	 * @param {any} defaultValue fallback if the setting doesn't exist
	 */
	get(key, defaultValue) {
		const value = this._cache.get(key);
		return value === undefined ? defaultValue : value;
	}
};
