const amqp = require("amqplib");

async function consumeOrders() {
  const conn = await amqp.connect("amqp://localhost");
  const channel = await conn.createChannel();
  await channel.assertQueue("orderQueue");

  channel.consume("orderQueue", (msg) => {
    const order = JSON.parse(msg.content.toString());
    console.log("Processing Order:", order);
    channel.ack(msg);
  });
}

consumeOrders();
