import dotenv from "dotenv";
dotenv.config({quiet: true});

import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL);
