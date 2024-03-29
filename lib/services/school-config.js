// @ts-check
import config from '../config.js';
import logging from '../logging.js';
import {InternalServerError} from '../errors/index.js';
import {fetchEnhanced} from '../utils/enhanced-fetch.js';

const DEFAULT_CONFIG = config.get('default school configuration');
const CDN_ROOT = config.get('cdnRoot');

/**
 * @param {string} name
 * @returns {string}
 */

function withName(name) {
	if (!name) {
		return `<link rel="icon" href="${CDN_ROOT}favicon.svg" type="image/svg+xml" />`;
	}

	return `
	<link rel="icon" href="https://schools.gradebook.app/api/v1/${name.toLowerCase()}/favicon.svg" type="image/svg+xml" />
	<link rel="manifest" href="https://schools.gradebook.app/api/v1/${name.toLowerCase()}/manifest.webmanifest" crossorigin="anonymous" />
`.trim();
}

/**
 * @param {Theme} theme
 * @param {SchoolConfig} schoolConfig
 */
const buildHead = (theme, schoolConfig) => `
${withName(schoolConfig.name)}
<link rel="mask-icon" href="${CDN_ROOT}safari-pinned-tab.svg" color="${theme.primary}" />
<meta name="theme-color" content="${theme.primary}" />
<meta name="site-config" value="${encodeURI(JSON.stringify(schoolConfig))}" />
<style>
	:root {
		--primary: ${theme.primary} !important;
		--hover: ${theme.hover} !important;
		--image: url('${theme.background || `${CDN_ROOT}generic.jpg`}') !important;
	}
</style>
`.trim();

export class SchoolConfigService {
	/**
	* @typedef CompiledConfig
	* @property {string} head
	*/

	/**
	 * @typedef {object} SchoolConfig
	 * @property {string} name
	 * @property {Theme} theme
	 * @property {boolean} gpa
	 * @property {object} cutoffs
	 * @property {string} feedbackLink
	 * @property {boolean} [partner]
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

		/**
		 * @private
		 */
		this._fetch = fetchEnhanced;
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
	 * @param {string} hostname the host to check
	 */
	isPartnered(hostname) {
		return Boolean(this._schoolConfigs.get(hostname)?.partner);
	}

	/**
	 * @private
	 * @param {Map<string, SchoolConfig>} schools
	 * @returns {Promise<boolean>}
	 */
	async _loadConfig(schools) {
		try {
			// @TODO: use fetchEnhanced util (don't create a private class property) when nock supports native fetch
			const response = await this._fetch(config.get('schoolConfigurationEndpoint'), {}, {json: true});
			for (const [school, configuration] of Object.entries(response)) {
				schools.set(school, configuration);
			}

			return true;
		} catch (error) {
			logging.error(new InternalServerError({
				message: 'Failed to fetch school configs!',
				err: error,
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

export const schoolConfigService = new SchoolConfigService();
