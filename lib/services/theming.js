// @ts-check
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
		this._themes.set('www', {primary: '#5E3B4D', hover: '#7e4f67', background: 'https://static.gradebook.app/sYbR9JXKTI/generic.jpg'});
		// @todo: these should not be hardcoded in the future
		this._themes.set('aggie', {primary: '#500000', hover: '#880000', name: 'Aggie', background: 'https://static.gradebook.app/sYbR9JXKTI/aggie.jpg'});
		this._themes.set('lsu', {primary: '#461d7c', hover: '#6e2dc4', name: 'Tiger'});
		this._themes.set('rebel', {primary: '#14213d', hover: '#2e4c8d', name: 'Rebel', background: 'https://static.gradebook.app/sYbR9JXKTI/rebel.jpg'});
		this._themes.set('crimson', {primary: '#9e1b32', hover: '#db2e4d', name: 'Crimson'});
		this._themes.set('cajun', {primary: '#ce181e', hover: '#e94248', name: 'Cajun'});
		this._themes.set('latech', {primary: '#002f8b', hover: '#004ee7', name: 'Bulldog'});
		this._themes.set('gator', {primary: '#0021a5', hover: '#0032fb', name: 'Gator', background: 'https://static.gradebook.app/sYbR9JXKTI/gator.jpg'});
		this._themes.set('colonial', {primary: '#002654', hover: '#0056be', name: 'Colonial'});
		this._themes.set('commodore', {primary: '#000000', hover: '#866d4b', name: 'Commodore', background: 'https://static.gradebook.app/sYbR9JXKTI/commodore.jpg'});
		this._themes.set('tiger', {primary: '#f66733', hover: '#ff8a38', name: 'Tiger', background: 'https://static.gradebook.app/sYbR9JXKTI/tiger.jpg'});
		this._themes.set('wolfpack', {primary: '#000000', hover: '#cc0000', name: 'Wolfpack', background: 'https://static.gradebook.app/sYbR9JXKTI/wolfpack.jpg'});
		this._themes.set('buckeye', {primary: '#bb0000', hover: '#ff0c0c', name: 'Buckeye'});
		this._themes.set('raider', {primary: '#aa0000', hover: '#880000', name: 'Raider', background: 'https://static.gradebook.app/sYbR9JXKTI/raider.jpg'});
		this._themes.set('nittany', {primary: '#041e42', hover: '#0a4da9', name: 'Nittany'});
		this._themes.set('boilermaker', {primary: '#c28e0e', hover: '#dac9a5', name: 'Boilermaker', background: 'https://static.gradebook.app/sYbR9JXKTI/boilermaker.jpg'});
		this._themes.set('wildcat', {primary: '#512888', hover: '#773dc6', name: 'Wildcat'});
		this._themes.set('husker', {primary: '#e41c38', hover: '#ea5469', name: 'Husker'});
		this._themes.set('longhorn', {primary: '#bf5700', hover: '#fe7c0f', name: 'Longhorn'});
		this._themes.set('comet', {primary: '#e87500', hover: '#ff972e', name: 'Comet'});

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

/* // Stubs for later
	async init() {

	}

	async refresh() {

	} */
}

module.exports = new ThemeService();
