// @ts-check
class ThemeService {
	constructor() {
		/**
		* @private
		* internal theme data storage
		* @type {Map<string, string>}
		*/
		this._themes = new Map();
		this._themes.set('default', '{"primary": "#000000", "hover": "#555", "siteNickname": "", "imageName": "generic.jpg"}');
		this._themes.set('aggie', '{"primary": "#500000", "hover": "#c00000", "siteNickname": "Aggie", "imageName": "aggie.jpg"}');
	}

	/**
	* @param {string} hostname the host of the requested theme
	* @returns {string} json blob of theme data
	*/
	getThemeForHost(hostname) {
		const school = hostname.split('.').shift();
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
