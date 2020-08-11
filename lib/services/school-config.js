// @ts-check
const got = require('got').default;
const config = require('../config');

/**
 * @param {Theme} theme
 * @param {SchoolConfig} schoolConfig
 */
const buildHead = (theme, schoolConfig) => `
	<meta name="site-name" value="${encodeURI(schoolConfig.name)}" />
	<meta name="site-config" value="${encodeURI(JSON.stringify(schoolConfig))}" />
	<style>
		:root {
			--primary: ${theme.primary} !important;
			--hover: ${theme.hover} !important;
			--image: url('${theme.background || 'https://static.gradebook.app/sYbR9JXKTI/generic.jpg'}') !important;
		}
	</style>
`;

class ThemeService {
	/**
	* @typedef CompiledConfig
	* @property {string} head
	*/

	/**
	 * @typedef {object} SchoolConfig
	 * @property {string} name
	 * @property {Theme} theme
	 */

	/**
	 * @typedef Theme
	 * @property {string} primary color
	 * @property {string} hover color
	 * @property {string} [background]
	 */

	constructor() {
		/**
		* @private
		* internal config storage
		* @type {Map<string, SchoolConfig>}
		*/
		this._schoolConfigs = new Map();

		/**
		 * @private
		 * theme data - this will be removed once client is updated
		 * @type {Map<string, Theme>}
		 */
		this._themeConfigs = new Map();

		/**
		 * @private
		 * cached config strings
		 * @type {Map<string, CompiledConfig>}
		 */
		this._configCache = new Map();
	}

	/**
	* @param {string} hostname the host of the requested theme
	* @returns {Theme}
	*/
	getThemeForHost(hostname) {
		const school = hostname.split('.').shift();

		if (!this._themeConfigs.has(school)) {
			return Object.assign({}, this._themeConfigs.get('www'));
		}

		return Object.assign({}, this._themeConfigs.get(school));
	}

	/**
	* @param {string} hostname the host of the requested theme
	* @returns {SchoolConfig}
	*/
	getConfigForHost(hostname) {
		const school = hostname.split('.').shift();

		if (!this._schoolConfigs.has(school)) {
			return Object.assign({}, this._schoolConfigs.get('www'));
		}

		return Object.assign({}, this._schoolConfigs.get(school));
	}

	/**
	 * @param {string} hostname the host of the requested theme
	 * @returns {CompiledConfig} Compiled styles + data to inject into user-state
	 */
	getSchoolConfig(hostname) {
		if (this._configCache.has(hostname)) {
			return this._configCache.get(hostname);
		}

		const config = this.getConfigForHost(hostname);
		const payload = {head: buildHead(config.theme, config)};
		this._configCache.set(hostname, payload);

		return payload;
	}

	async init() {
		const endpoint = config.get('themeEndpoint');
		const headers = {
			'content-type': 'application/json'
		};

		// @todo: What should we do if the request fails?
		const response = await got(endpoint, {headers}).then(r => JSON.parse(r.body));

		for (const [school, configuration] of Object.entries(response)) {
			this._schoolConfigs.set(school, configuration);
			this._themeConfigs.set(school, configuration.theme);
		}
	}

	async refresh() {
		this.init();
	}
}

module.exports = new ThemeService();
