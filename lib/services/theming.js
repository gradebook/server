const config = require('../config');

// @ts-check
class ThemeService {
	constructor() {
		/**
		* @private
		* internal theme data storage
		* @type {Map<string, string>}
		*/
		this._themes = new Map();
		this._themes.set('default', '{"primary": "#000000", "hover": "#555", "siteNickname": "", "slug": "generic"}');
		this._themes.set('aggie', '{"primary": "#500000", "hover": "#c00000", "siteNickname": "Aggie", "imageName": "aggie"}');
	}

	/**
	* @param {string} hostname the host of the requested theme
	* @returns {string} json blob of theme data
	*/
	getThemeForHost(hostname) {
		let school = hostname.split('.').shift();

		if (config.get('theme')) { // Use override if provided
			school = config.get('theme');
		}

		if (!this._themes.has(school)) {
			return this._themes.get('default');
		}

		return this._themes.get(school);
	}
/* // Stubs for later
	async init() {

	}

	async refresh() {

	} */
}

module.exports = new ThemeService();
