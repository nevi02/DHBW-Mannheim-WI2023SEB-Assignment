import express from 'express';
import amqp from 'amqplib';
import * as TPLink from 'tplink-bulbs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();


const email = process.env.EMAIL;
const password = process.env.PASSWORD;
const deviceId = process.env.DEVICE_ID;

console.log(email);

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicPath = path.join(__dirname, '..', 'public');

const queueName = 'lamp-control';
let device;
let cloudApi;

async function setupLamp() {
  try {
    if (!cloudApi) {
      cloudApi = await TPLink.API.cloudLogin(email, password);
    }

    const devices = await cloudApi.listDevicesByType('SMART.TAPOBULB');
    const targetDevice = devices.find(d => d.deviceId === deviceId);
    if (!targetDevice) throw new Error('Gerät nicht gefunden.');

    if (!device) {
      device = await TPLink.API.loginDevice(email, password, targetDevice);
    }

    console.log('Lampe erfolgreich eingerichtet.');
  } catch (err) {
    console.error('Fehler beim Setup der Lampe:', err.message);
  }
}

function textToMorse(text) {
  const morseTable = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..',
    'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
    'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
    'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', ' ': '/',
    '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.'
  };
  return text.toUpperCase().split('').map(c => morseTable[c] || '').join(' ');
}

async function blinkMorse(message) {
  const morse = textToMorse(message);
  for (let symbol of morse) {
    if (symbol === '.') {
      await device.turnOn();
      await TPLink.API.delay(300);
    } else if (symbol === '-') {
      await device.turnOn();
      await TPLink.API.delay(700);
    } else {
      await TPLink.API.delay(500); // Space
    }
    await device.turnOff();
    await TPLink.API.delay(300);
  }
}

async function startRabbitMQConsumer() {
  try {
    const conn = await amqp.connect('amqp://127.0.0.1');
    const ch = await conn.createChannel();
    await ch.assertQueue(queueName);

    ch.consume(queueName, async (msg) => { console.log(msg);
      const data = JSON.parse(msg.content.toString());
      console.log('Empfangener Befehl:', data);

      if (data.type === 'basic') {
        if (data.command === 'on') await device.turnOn();
        if (data.command === 'off') await device.turnOff();
        if (['red', 'green', 'blue'].includes(data.command)) {
          await device.setColor(data.command);
        }
      } else if (data.type === 'brightness') {
        await device.setBrightness(parseInt(data.value));
      } else if (data.type === 'morse') {
        await blinkMorse(data.text);
      }

      ch.ack(msg);
    });
  } catch (err) {
    console.error('Fehler beim Starten des RabbitMQ Consumers:', err.message);
  }
}

// API-Route vor statischem Middleware setzen:
app.post('/api/command', async (req, res) => {
  try {
    const conn = await amqp.connect('amqp://localhost');
    const ch = await conn.createChannel();
    await ch.assertQueue(queueName);
    ch.sendToQueue(queueName, Buffer.from(JSON.stringify(req.body)));
    console.log('Befehl gesendet:', req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error('Fehler beim POST /api/command:', err.message);
    res.sendStatus(500);
  }
});

// Static Middleware
app.use(express.static(publicPath));

app.listen(4000, async () => {
  console.log('Serving static files from:', publicPath);
  console.log('Server läuft auf http://localhost:4000');
  await setupLamp();
  await startRabbitMQConsumer();
});
