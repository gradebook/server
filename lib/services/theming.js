// @ts-check
const got = require('got');
const config = require('../../lib/config');

class ThemeService {
	/**
	 * @typedef CompiledTheme
	 * @property {string} styles
	 * @property {{name: string}} metadata
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
		* internal theme data storage
		* @type {Map<string, Theme>}
		*/
		this._themes = new Map();

		/**
		 * @private
		 * cached theme data
		 * @type {Map<string, CompiledTheme>}
		 */
		this._compiledCache = new Map();
	}

	/**
	* @param {string} hostname the host of the requested theme
	* @returns {Theme}
	*/
	getThemeForHost(hostname) {
		const school = hostname.split('.').shift();

		if (!this._themes.has(school)) {
			return Object.assign({}, this._themes.get('www'));
		}

		return Object.assign({}, this._themes.get(school));
	}

	/**
	 * @param {string} hostname the host of the requested theme
	 * @returns {CompiledTheme} Compiled styles + data to inject into user-state
	 */
	getCompiledTheme(hostname) {
		if (this._compiledCache.has(hostname)) {
			return Object.assign({}, this._compiledCache.get(hostname));
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

		this._compiledCache.set(hostname, payload);

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
			this._themes.set(school, response[school]);
		}
	}

	async refresh() {
		this.init();
	}
}

module.exports = new ThemeService();
