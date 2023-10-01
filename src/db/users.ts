import { Connection, ResultSetHeader } from "mysql2";

import { DEFAULT_RATING, USERS_TABLE_NAME } from './constants';
import User from "./models/user.model";

export class Users {
  private connection: Connection;

  private constructor(connection: Connection) {
    this.connection = connection;
  }

  public retrieveById(userId: number): Promise<User> {
    return new Promise((resolve, reject) => {
      this.connection.query<User[]>(
      `SELECT * FROM ${USERS_TABLE_NAME} WHERE id = ?`,
      [userId],
      (err, res) => {
        if (err) reject(`${USERS_TABLE_NAME} retrieveById ERROR: ${JSON.stringify(err, null, 4)}`);
        else resolve(res?.[0]);
      }
    );
    });
  }

  public save(user: User) {
    return new Promise((resolve, reject) => {
      this.connection.query<ResultSetHeader>(
        `INSERT INTO ${USERS_TABLE_NAME} (id, name, rating, last_usage_data) VALUES(?,?,?,?)`,
        [user.id, user.name, user.rating || DEFAULT_RATING, user.last_usage_data || null],
        (err, res) => {
          if (err) reject(`${USERS_TABLE_NAME} save ERROR: ${JSON.stringify(err, null, 4)}`);
          else
            this.retrieveById(res.insertId)
              .then((user) => resolve(user!))
              .catch(reject);
        }
      );
    });
  }

  public update(user: User): Promise<number> {
    return new Promise((resolve, reject) => {
      this.connection.query<ResultSetHeader>(
        `UPDATE ${USERS_TABLE_NAME} SET name = ?, rating = ?, last_usage_data = ? WHERE id = ?`,
        [user.name, user.rating || DEFAULT_RATING, user.last_usage_data, user.id],
        (err, res) => {
          if (err) reject(err);
          else resolve(res.affectedRows);
        }
      );
    });
  }
}
