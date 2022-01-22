import execa from 'execa';

export const runInstall = (cwd = '.') => execa.command(`yarn --cwd ${cwd} install`);
