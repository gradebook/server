// @ts-check
import {AuthManager} from '@gradebook/client-auth';
import config from '../config.js';

const gateway = config.get('gateway');

const services = ['shrink'];
export const globalStoreIsRemote = Boolean(config.get('globalStore:url'));

if (globalStoreIsRemote) {
	services.push('global_store');
}

export default gateway ? new AuthManager(gateway, [services]) : null;
