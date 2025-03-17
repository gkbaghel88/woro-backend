const amqp = require("amqplib");

async function publishOrder(orderData) {
  const conn = await amqp.connect("amqp://localhost");
  const channel = await conn.createChannel();
  await channel.assertQueue("orderQueue");
  channel.sendToQueue("orderQueue", Buffer.from(JSON.stringify(orderData)));
}

module.exports = { publishOrder };