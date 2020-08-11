// @ts-check
const got = require('got').default;
const config = require('../../lib/config');

class ThemeService {
	/**
	 * @typedef CompiledTheme
	 * @property {string} styles
	 * @property {{name: string}} metadata
	 */

	/**
	* @typedef CompiledConfig
	* @property {string} config
	*/

	/**
	 * @typedef Theme
	 * @property {string} primary color
	 * @property {string} hover color
	 * @property {string | null} [name]
	 * @property {string | null} [background]
	 */

	constructor() {
		/**
		* @private
		* internal config storage
		* @type {Map<string, Theme>}
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
		 * cached theme strings
		 * @type {Map<string, CompiledTheme>}
		 */
		this._themeCache = new Map();

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
	* @returns {Theme}
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
		const payload = {config: encodeURI(JSON.stringify(config))};
		this._configCache.set(hostname, payload);

		return payload;
	}

	/**
	 * @param {string} hostname the host of the requested theme
	 * @returns {CompiledTheme} Compiled styles + data to inject into user-state
	 */
	getCompiledTheme(hostname) {
		if (this._themeCache.has(hostname)) {
			return Object.assign({}, this._themeCache.get(hostname));
		}

		const theme = this.getThemeForHost(hostname);
		// @NOTE: we're not escaping these values since they come from trusted services. Either it comes from the hardcoded
		// values we provide, or the theme micro-service will handle escaping.
		const styles = `
		<style>
			:root {
				--primary: ${theme.primary} !important;
				--hover: ${theme.hover} !important;
				--image: url('${theme.background || 'https://static.gradebook.app/sYbR9JXKTI/generic.jpg'}') !important;
			}
		</style>`;

		const metadata = {
			name: theme.name || ''
		};

		const payload = {styles, metadata};

		this._themeCache.set(hostname, payload);

		return Object.assign({}, payload);
	}

	async init() {
		const endpoint = config.get('themeEndpoint');
		const headers = {
			'content-type': 'application/json'
		};

		// @todo: What should we do if the request fails?
		const response = await got(endpoint, {headers}).then(r => JSON.parse(r.body));

		for (const school of Object.keys(response)) {
			this._schoolConfigs.set(school, response[school]);
			this._themeConfigs.set(school, response[school].theme);
		}
	}

	async refresh() {
		this.init();
	}
}

module.exports = new ThemeService();
