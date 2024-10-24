import { stopFrontend } from './utils';

async function globalTeardown() {
  await stopFrontend();
}

export default globalTeardown;
