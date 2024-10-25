import { stopBackend, stopFrontend } from './utils';

async function globalTeardown() {
  await stopFrontend();
  await stopBackend();
}

export default globalTeardown;
