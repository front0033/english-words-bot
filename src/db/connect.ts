import mysql from 'mysql2';
import { config } from '../config';

const { MYSQL_DATABASE_NAME, MYSQL_DATABASE_PORT, MYSQL_DATABASE_USER, MYSQL_DATABASE_IP, MYSQL_DATABASE_PASSWORD } = config;

// console.table({
//   MYSQL_DATABASE_NAME: MYSQL_DATABASE_NAME,
//   MYSQL_DATABASE_PORT: MYSQL_DATABASE_PORT,
//   MYSQL_DATABASE_USER: MYSQL_DATABASE_USER,
//   MYSQL_DATABASE_IP: MYSQL_DATABASE_IP,
//   MYSQL_DATABASE_PASSWORD: MYSQL_DATABASE_PASSWORD
// });

export const connection = mysql.createConnection({
  database: MYSQL_DATABASE_NAME,
  port: Number(MYSQL_DATABASE_PORT),
  user: MYSQL_DATABASE_USER,
  host: MYSQL_DATABASE_IP,
  password: MYSQL_DATABASE_PASSWORD,
});

connection.connect(function(err: any) {
  if (err) {
    return console.error('error: ' + err.message);
  }

  console.log('Connected to the MySQL server...');
});
