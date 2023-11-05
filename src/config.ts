import { GPTModelType } from "./types";

interface Config {
  OPENAI_API_KEY?: string;
  TELEGRAM_TOKEN?: string;
  MYSQL_DATABASE_NAME?: string;
  MYSQL_DATABASE_PORT?: number;
  MYSQL_DATABASE_IP?: string;
  MYSQL_DATABASE_USER?: string;
  MYSQL_DATABASE_PASSWORD?: string;
  OPENAI_API_MODEL: GPTModelType;
  DEFAULT_INTERVAL_VALUE: number;
  DEFAULT_USERS_AMOUNT: number;
}

export const config: Config = {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MYSQL_DATABASE_NAME: process.env.MYSQL_DATABASE_NAME,
  MYSQL_DATABASE_PORT: Number(process.env.MYSQL_DATABASE_PORT),
  MYSQL_DATABASE_IP: process.env.MYSQL_DATABASE_IP,
  MYSQL_DATABASE_USER: process.env.MYSQL_DATABASE_USER,
  MYSQL_DATABASE_PASSWORD: process.env.MYSQL_DATABASE_PASSWORD,
  OPENAI_API_MODEL: process.env.OPENAI_API_MODEL as GPTModelType || 'gpt-3.5-turbo',
  DEFAULT_INTERVAL_VALUE: Number(process.env.DEFAULT_INTERVAL_VALUE) || 5000,
  DEFAULT_USERS_AMOUNT: Number(process.env.DEFAULT_USERS_AMOUNT) || 100,
};

Object.keys(config)
  .filter((key) => !config[key as keyof typeof config])
  .forEach((key) => console.error(`ERROR: ${key} is not defined...\n`));
