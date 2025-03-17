const redis = require("redis");
const client = redis.createClient({ url: "redis://127.0.0.1:6379" });

client.connect().catch(console.error);

module.exports = client;
