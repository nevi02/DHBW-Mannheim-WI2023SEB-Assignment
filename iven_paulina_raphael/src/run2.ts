// src/run.ts
import 'dotenv/config';
import * as TPLink from 'tplink-bulbs';

const email    = process.env.TP_EMAIL!;
const password = process.env.TP_PASSWORD!;
const deviceId = process.env.TP_DEVICE_ID!;

async function run() {
  try {
    const cloudApi = await TPLink.API.cloudLogin(email, password);
    console.log('Cloud-Login erfolgreich');

    const bulbs = await cloudApi.listDevicesByType('SMART.TAPOBULB');
    console.log(`Gefundene Bulbs (${bulbs.length}):`, bulbs);

    const target = bulbs.find(b => b.deviceId === deviceId);
    if (!target) {
      console.error(`Lampe mit ID ${deviceId} nicht gefunden.`);
      return;
    }

    const device = await TPLink.API.loginDevice(email, password, target);
    console.log(`Verbunden mit Lampe "${target.alias}" (${deviceId}).`);

    await device.turnOn();
    console.log('Lampe AN');
    await TPLink.API.delay(1000);
    await device.turnOff();
    console.log('Lampe AUS');
  } catch (err) {
    console.error('Fehler:', err);
  }
}

run();
