import amqp from 'amqplib';
import { blinkMorse } from '../lamp/controller.js';

export async function startConsumer(queueName, device) {
  try {
    const conn = await amqp.connect('amqp://127.0.0.1');
    const ch = await conn.createChannel();
    await ch.assertQueue(queueName);

    ch.consume(queueName, async (msg) => {
      const data = JSON.parse(msg.content.toString());
      console.log('Empfangener Befehl:', data);

      try {
        if (data.type === 'basic') {
          if (data.command === 'on') await device.turnOn();
          else if (data.command === 'off') await device.turnOff();
          else if (["red", "green", "blue"].includes(data.command)) {
            await device.setColour(data.command);
          }
        } else if (data.type === 'brightness') {
          await device.setBrightness(parseInt(data.value));
        } else if (data.type === 'morse') {
          await blinkMorse(device, data.text);
        }
      } catch (err) {
        console.error('Fehler bei der Verarbeitung der Nachricht:', err.message);
      }

      ch.ack(msg);
    });
  } catch (err) {
    console.error('Fehler beim Starten des RabbitMQ Consumers:', err.message);
  }
}
