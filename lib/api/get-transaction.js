const {knex: {instance: knex}} = require('../database');

module.exports = () => knex.transaction();
