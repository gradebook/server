const passport = require('passport');
const analytics = require('../../services/analytics');

module.exports = [passport.authenticate('google'), (req, res, next) => {
	analytics.userLoggedIn.add([1]);
	next();
}];
