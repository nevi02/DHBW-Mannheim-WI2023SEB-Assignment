import * as TPLink from 'tplink-bulbs';

const email = 'paupau1105@web.de';
const password = 'Lampenprojekt';
const deviceId = '8023D8C274F3E61C342C3A825E76747A237F6D68';

async function safeCloudLogin(email, password) {
  try {
    return await TPLink.API.cloudLogin(email, password);
  } catch (e) {
    if (e.message.includes('API rate limit exceeded')) {
      console.warn('Rate limit erreicht. Warte 60 Sekunden...');
      await TPLink.API.delay(60000);
      return TPLink.API.cloudLogin(email, password);
    } else {
      throw e;
    }
  }
}

async function run() {
  const cloudApi = await safeCloudLogin(email, password);

  const devices = await cloudApi.listDevicesByType('SMART.TAPOBULB');
  const targetDevice = devices.find(device => device.deviceId === deviceId);

  if (!targetDevice) {
    console.error(`Gerät mit ID "${deviceId}" nicht gefunden.`);
    return;
  }

  const device = await TPLink.API.loginDevice(email, password, targetDevice);
  await device.turnOn();
  await device.setColour('blue');
}

run().catch(console.error);