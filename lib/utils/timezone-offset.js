/**
 * @name TimeZoneOffset
 * @description returns the timezone difference between the server time and the America/Chicago time zone
 *   relative to the server time
 * @returns {number} difference between America/Chicago and server time zone
 * @todo Allow time zone to be configured
 * @todo Add to cron to compute every 6 hours to prevent DST issues
 */
function init() {
	const now = new Date();
	const currentHour = now.toLocaleTimeString(undefined, {hour12: false}).split(':').shift();
	const chicagoHour = now.toLocaleTimeString(undefined, {timeZone: 'America/Chicago', hour12: false}).split(':').shift();

	const offsetFromNowToChicago = (Number(currentHour) - Number(chicagoHour)) % 24;

	return offsetFromNowToChicago;
}

module.exports = init();
