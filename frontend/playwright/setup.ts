import { startFrontend } from './utils';

async function globalSetup() {
    process.env.REACT_APP_SKIP_BACKEND_CHECK = true;

    await startFrontend();
}

export default globalSetup;
