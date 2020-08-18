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
		 * cached config strings
		 * @type {Map<string, CompiledConfig>}
		 */
		this._configCache = new Map();
	}

	/**
	 * @param {string} hostname the host of the requested theme
	 * @returns {CompiledConfig} Compiled styles + data to inject into user-state
	 */
	getSchoolConfig(hostname) {
		if (this._configCache.has(hostname)) {
			return this._configCache.get(hostname);
		}

		const [school] = hostname.split('.');
		const config = this._schoolConfigs.get(school) || this._schoolConfigs.get('default');

		// We don't want to include the theme config in the `site-config` meta tag
		// since we hard code the theme in a style
		const {theme} = config;
		delete config.theme;

		const payload = {head: buildHead(theme, config)};
		this._configCache.set(hostname, payload);
		config.theme = theme;

		return payload;
	}

	/**
	 * @private
	 * @param {Map<string, SchoolConfig>} schools
	 * @returns {Promise<boolean>}
	 */
	async _loadConfig(schools) {
		try {
			const response = await got(config.get('schoolConfigurationEndpoint')).json();
			for (const [school, configuration] of Object.entries(response)) {
				schools.set(school, configuration);
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
		return this._loadConfig(this._schoolConfigs);
	}

	async refresh() {
		/** @type {Map<string, SchoolConfig>} */
		const newSchools = new Map([['default', DEFAULT_CONFIG]]);

		const wasSuccessful = await this._loadConfig(newSchools);

		if (wasSuccessful) {
			this._schoolConfigs = newSchools;
			this._configCache.clear();
		}
	}
}

module.exports = new SchoolConfigService();
module.exports.SchoolConfigService = SchoolConfigService;
