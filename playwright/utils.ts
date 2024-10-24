import { spawn } from 'child_process';
import http from 'http';
import path from 'path';

let serverProcess: any = null;

export async function startFrontend() {
  return new Promise<void>((resolve, reject) => {
    console.log('Starting the frontend server...');

    const frontendPath = path.join(__dirname, '../frontend');

    serverProcess = spawn('npm', ['start'], {
      cwd: frontendPath,
      stdio: 'inherit',
      detached: true,
      env: { ...process.env, BROWSER: 'none' },
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start frontend:', err);
      reject(err);
    });

    const checkFrontend = () => {
      http.get('http://localhost:3000', (res) => {
        if (res.statusCode === 200) {
          console.log('Frontend is running...');
          resolve();
        } else {
          setTimeout(checkFrontend, 500);
        }
      }).on('error', () => {
        setTimeout(checkFrontend, 500);
      });
    };

    checkFrontend();
  });
}

export async function stopFrontend() {
  if (serverProcess) {
    console.log('Stopping the frontend server...');
    process.kill(-serverProcess.pid);
  } else {
    console.log('No frontend server process found to stop.');
  }
}
