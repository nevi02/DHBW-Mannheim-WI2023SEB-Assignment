import 'dotenv/config';
import * as TPLink from 'tplink-bulbs';

const email    = process.env.TP_EMAIL!;
const password = process.env.TP_PASSWORD!;

async function run() {
  try {
    
    const cloudApi = await TPLink.API.cloudLogin(email, password);
    console.log('Cloud-Login erfolgreich');

   
    const bulbs = await cloudApi.listDevicesByType('SMART.TAPOBULB');
    console.log(`Gefundene Bulbs (${bulbs.length}):`, bulbs);

  } catch (err) {
    console.error('Login fehlgeschlagen:', err);
  }
}

run();
