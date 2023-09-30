import mysql, { Connection } from 'mysql2';
import { MYSQL_DATABASE_NAME, MYSQL_DATABASE_PORT, MYSQL_DATABASE_USER, MYSQL_DATABASE_IP, MYSQL_DATABASE_PASSWORD } from '../config';

let connectionInstance: Connection;

const getDatabaseConnect = async (): Promise<Connection> => {
  const connection = await mysql.createConnection({
    database: MYSQL_DATABASE_NAME,
    port: Number(MYSQL_DATABASE_PORT),
    user: MYSQL_DATABASE_USER,
    host: MYSQL_DATABASE_IP,
    password: MYSQL_DATABASE_PASSWORD,
  });

  return connection;
}

export const ensureDatabase = async (): Promise<Connection> => {
  if (connectionInstance) {
    return connectionInstance;
  }

  connectionInstance = await getDatabaseConnect();

  return connectionInstance;
}


