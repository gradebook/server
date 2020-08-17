// @ts-check
const got = require('got').default;
const config = require('../config');
const logging = require('../logging');
const {InternalServerError} = require('../errors');

const DEFAULT_CONFIG = {
	name: '',
	theme: {
		primary: '#5E3B4D',
		hover: '#7e4f67',
		background: 'https://static.gradebook.app/sYbR9JXKTI/generic.jpg'
	}
};

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

class SchoolConfigService {
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
		this._schoolConfigs = new Map([['default', DEFAULT_CONFIG]]);

		/**
		 * @private
		 * theme data - this will be removed once client is updated
		 * @type {Map<string, Theme>}
		 */
		this._themeConfigs = new Map([['default', DEFAULT_CONFIG.theme]]);

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
			return Object.assign({}, this._themeConfigs.get('default'));
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
			return Object.assign({}, this._schoolConfigs.get('default'));
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

	/**
	 * @private
	 * @param {Map<string, SchoolConfig>} schools
	 * @param {Map<string, Theme>} themes
	 * @returns {Promise<boolean>}
	 */
	async _loadConfig(schools, themes) {
		try {
			const response = await got(config.get('schoolConfigurationEndpoint')).json();
			for (const [school, configuration] of Object.entries(response)) {
				schools.set(school, configuration);
				themes.set(school, configuration.theme);
			}

			return true;
		} catch (error) {
			logging.error(new InternalServerError({
				message: 'Failed to fetch school configs!',
				err: error
			}));

			return false;
		}
	}

	/**
	 * @returns {Promise<boolean>}
	 */
	init() {
		return this._loadConfig(this._schoolConfigs, this._themeConfigs);
	}

	async refresh() {
		/** @type {Map<string, SchoolConfig>} */
		const newSchools = new Map([['default', DEFAULT_CONFIG]]);
		/** @type {Map<string, Theme>} */
		const newThemes = new Map([['default', DEFAULT_CONFIG.theme]]);

		const wasSuccessful = await this._loadConfig(newSchools, newThemes);

		if (wasSuccessful) {
			this._schoolConfigs = newSchools;
			this._themeConfigs = newThemes;
		}
	}
}

module.exports = new SchoolConfigService();
module.exports.SchoolConfigService = SchoolConfigService;
