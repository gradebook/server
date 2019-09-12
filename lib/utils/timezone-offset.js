/**
 * @name TimeZoneOffset
 * @description returns the timezone difference between the server time and the America/Chicago time zone
 *   relative to the server time
 * @returns {number} difference between America/Chicago and server time zone
 * @todo Allow time zone to be configured
 */
function init() {
	const now = Date.now();
	const currentHour = now.toLocaleTimeString(undefined, {hour12: false}).split(':').pop();
	const chicagoHour = now.toLocaleTimeString(undefined, {timeZone: 'America/Chicago', hour12: false}).split(':').pop;

	const offsetFromNowToChicago = Number(currentHour) - Number(chicagoHour);

	return offsetFromNowToChicago;
}

module.exports = init();
