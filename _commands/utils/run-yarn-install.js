// @ts-check
import {execaCommand} from 'execa';

export const runInstall = (cwd = '.') => execaCommand(`yarn --cwd ${cwd} install`);
