import { spawn } from 'child_process';
import http from 'http';
import path from 'path';

let frontendProcess: any = null;
let backendProcess: any = null;

export async function startFrontend() {
  return new Promise<void>((resolve, reject) => {
    console.log('Starting the frontend server...');

    const frontendPath = path.join(__dirname, '../frontend');

    frontendProcess = spawn('npm', ['start'], {
      cwd: frontendPath,
      stdio: 'inherit',
      detached: true,
      env: { ...process.env, BROWSER: 'none' },
    });

    frontendProcess.on('error', (err) => {
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
  if (frontendProcess) {
    console.log('Stopping the frontend server...');
    process.kill(-frontendProcess.pid);
  } else {
    console.log('No frontend server process found to stop.');
  }
}


export async function startBackend() {
  return new Promise<void>((resolve, reject) => {
    console.log("Starting backend server...")

    const backendPath = path.join(__dirname, '../backend')

    backendProcess = spawn('npm', ['start'], {
      cwd: backendPath,
      stdio: 'inherit',
      detached: true,
    })

    backendProcess.on('error', (err) => {
      console.error('Failed to start backend:', err)
      reject(err)
    })

    const checkBackend = () => {
      fetch('http://localhost:3001/health').then((res) => {
        if (res.ok) {
          console.log('Backend is running...')
          resolve()
        } else {
          setTimeout(checkBackend, 500)
        }
      }).catch(() => setTimeout(checkBackend, 500))
    }

    checkBackend();
  })
}

export async function stopBackend() {
  if (backendProcess) {
    console.log('Stopping the backend server...')
    process.kill(-backendProcess.pid)
  } else {
    console.log('No backend server process found to stop.')
  }
}