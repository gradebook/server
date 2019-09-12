const {knex} = require('../database');

module.exports = () => knex.transaction();
