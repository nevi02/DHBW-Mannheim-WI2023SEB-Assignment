import { textToMorse } from '../utils/morse.js';
import * as TPLink from 'tplink-bulbs';

export async function blinkMorse(device, message) {
  const morse = textToMorse(message);
  for (let symbol of morse) {
    if (symbol === '.') {
      await device.turnOn();
      await TPLink.API.delay(300);
    } else if (symbol === '-') {
      await device.turnOn();
      await TPLink.API.delay(700);
    } else {
      await TPLink.API.delay(500); // Pause für Leerzeichen oder Trennzeichen
    }
    await device.turnOff();
    await TPLink.API.delay(300);
  }
}