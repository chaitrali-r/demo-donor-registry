const redis = require("redis");
const {promisify} = require('util');
let client;
let getAsync;

async function initRedis(config) {
  client = redis.createClient(config.REDIS_URL);
  client.on("error", function (error) {
    console.error(error);
  });
  getAsync = promisify(client.get).bind(client);
  await client.connect();
}

async function storeKeyWithExpiry(key, value, expiry) {
  await client.set(key, value, 'EX', expiry);
}

async function getKey(key) {
  return await client.get(key);
}

function deleteKey(key) {
    client.del(key);
}

module.exports = {
  storeKeyWithExpiry,
  initRedis,
  getKey,
  deleteKey
};
