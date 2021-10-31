// @ts-check
const randomLetters = require('../../security/random-letters');

/**
 * @abstract
 */
module.exports = class AbstractSettingsStore {
	/* eslint-disable camelcase */
	static DEFAULT_SETTINGS = {
		session_secret: randomLetters(40),
		max_courses_per_semester: 8,
		max_categories_per_course: 25,
		max_grades_per_category: 40,
	};
	/* eslint-enable camelcase */

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
	 * @param {keyof AbstractSettingsStore.DEFAULT_SETTINGS} key the setting to lookup
	 */
	get(key) {
		const value = this._cache.get(key);
		return value === undefined ? AbstractSettingsStore.DEFAULT_SETTINGS[key] : value;
	}
};
