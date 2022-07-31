// @ts-check
import {knex as wrapper} from '../database/index.js';

const knex = wrapper.instance;

export const getTransaction = () => knex.transaction();
