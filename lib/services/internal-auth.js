import {AuthManager} from '@gradebook/client-auth';
import config from '../config.js';

const gateway = config.get('gateway');

export default gateway ? new AuthManager(gateway, [['shrink']]) : null;
