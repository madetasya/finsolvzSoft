
import "dotenv/config";
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  tls: false,
});

redis.on("connect", () => {
  console.log("Connected to Redis Cloud");
});

redis.on("error", (err) => {
  console.error(err);
});

export default redis;
