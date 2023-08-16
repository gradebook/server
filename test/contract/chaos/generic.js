// @ts-check
import {Context} from '../context.js';

/**
 * @param {number} min
 * @param {number} max
 */
export const between = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const context = new Context('Payload generation');
