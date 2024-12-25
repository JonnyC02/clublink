import { startBackend, startFrontend } from './utils';

async function globalSetup() {
    process.env.REACT_APP_IS_TESTING = 'true';
    await startBackend();
    await startFrontend();
}

export default globalSetup;
