// @ts-check
class ThemeService {
	constructor() {
		/**
		* @private
		* internal theme data storage
		* @type {Map<string, string>}
		*/
		this._themes = new Map();
		this._themes.set('default', '{"primary": "#5E3B4D", "hover": "#945d79", "siteNickname": "", "imageName": "generic.jpg"}');
		this._themes.set('aggie', '{"primary": "#500000", "hover": "#bb0000", "siteNickname": "Aggie", "imageName": "aggie.jpg"}');
		this._themes.set('lsu', '{"primary": "#461d7c", "hover": "#6e2dc4", "siteNickname": "Tiger", "imageName": ""}');
		this._themes.set('rebel', '{"primary": "#14213d", "hover": "#2e4c8d", "siteNickname": "Rebel", "imageName": ""}');
		this._themes.set('crimson', '{"primary": "#9e1b32", "hover": "#db2e4d", "siteNickname": "Crimson", "imageName": ""}');
		this._themes.set('cajun', '{"primary": "#ce181e", "hover": "#e94248", "siteNickname": "Cajun", "imageName": ""}');
		this._themes.set('latech', '{"primary": "#002f8b", "hover": "#004ee7", "siteNickname": "Bulldog", "imageName": ""}');
		this._themes.set('gator', '{"primary": "#0021a5", "hover": "#0032fb", "siteNickname": "Gator", "imageName": ""}');
		this._themes.set('colonial', '{"primary": "#002654", "hover": "#0056be", "siteNickname": "Colonial", "imageName": ""}');
		this._themes.set('vandy', '{"primary": "#866d4b", "hover": "#ad926e", "siteNickname": "Vandy", "imageName": ""}');
		this._themes.set('tiger', '{"primary": "#f56600", "hover": "#ff8a38", "siteNickname": "Tiger", "imageName": ""}');
		this._themes.set('wolfpack', '{"primary": "#cc0000", "hover": "#ff1919", "siteNickname": "Wolfpack", "imageName": ""}');
		this._themes.set('buckeye', '{"primary": "#bb0000", "hover": "#ff0c0c", "siteNickname": "Buckeye", "imageName": ""}');
		this._themes.set('raider', '{"primary": "#cc0000", "hover": "#ff1919", "siteNickname": "Raider", "imageName": ""}');
		this._themes.set('nittany', '{"primary": "#041e42", "hover": "#0a4da9", "siteNickname": "Nittany", "imageName": ""}');
		this._themes.set('boilermaker', '{"primary": "#ceb888", "hover": "#dac9a5", "siteNickname": "Boilermaker", "imageName": ""}');
		this._themes.set('wildcat', '{"primary": "#512888", "hover": "#773dc6", "siteNickname": "Wildcat", "imageName": ""}');
		this._themes.set('husker', '{"primary": "#e41c38", "hover": "#ea5469", "siteNickname": "Husker", "imageName": ""}');
		this._themes.set('longhorn', '{"primary": "#bf5700", "hover": "#fe7c0f", "siteNickname": "Longhorn", "imageName": ""}');
		this._themes.set('comet', '{"primary": "#e87500", "hover": "#ff972e", "siteNickname": "Comet", "imageName": ""}');
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

		let schoolTheme = JSON.parse(this._themes.get(school));

		if(!schoolTheme.imageName || schoolTheme.imageName === '') {
			schoolTheme.imageName = 'generic.jpg';
		}

		return JSON.stringify(schoolTheme);
	}
/* // Stubs for later
	async init() {

	}

	async refresh() {

	} */
}

module.exports = new ThemeService();
