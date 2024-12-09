import { ClientOptions, LocalAuth } from 'whatsapp-web.js';
import path from 'path';

const AUTH_DIR = '.wwebjs_auth';
const SESSION_DIR = path.join(process.cwd(), AUTH_DIR);

export const whatsappConfig: ClientOptions = {
  authStrategy: new LocalAuth({
    clientId: 'whatsapp-api',
    dataPath: SESSION_DIR
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--disable-gpu',
      '--disable-web-security',
      '--aggressive-cache-discard',
      '--disable-cache',
      '--disable-application-cache',
      '--disk-cache-size=1',
      '--disable-background-networking'
    ]
  },
  qrMaxRetries: 5,
  restartOnAuthFail: true,
  takeoverOnConflict: false,
  takeoverTimeoutMs: 0
}; 