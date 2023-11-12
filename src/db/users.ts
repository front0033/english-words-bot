import { Connection, ResultSetHeader } from "mysql2";

import { DEFAULT_RATING, USERS_TABLE_NAME } from './constants';
import User from "./models/user.model";

export class Users {
  private connection: Connection;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  public retrieveById(userId: number): Promise<User> {
    console.log('[Users]: retrieveById - ', userId);
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
    console.log('[Users]: save - ', user);
    return new Promise((resolve, reject) => {
      this.connection.query<ResultSetHeader>(
        `INSERT INTO ${USERS_TABLE_NAME} (id, name, rating, last_usage_data, subscribed) VALUES(?,?,?,?,?)`,
        [user.id, user.name, user.rating || DEFAULT_RATING, user.last_usage_data || null, user.subscribed || null],
        (err, res) => {
          if (err) reject(`${USERS_TABLE_NAME} save ERROR: ${JSON.stringify(err, null, 4)}`);
          else
            resolve(user!)
        }
      );
    });
  }

  public update(user: User): Promise<number> {
    // TODO: need to fix https://stackoverflow.com/questions/45664388/error-1031-hy000-at-line-table-storage-engine-for-table-name-doesnt
    console.log('[Users]: update - ', user);
    return new Promise((resolve, reject) => {
      this.connection.query<ResultSetHeader>(
        `UPDATE ${USERS_TABLE_NAME} SET subscribed = ? WHERE id = ?`,
        [user.subscribed, user.id],
        (err, res) => {
          if (err) reject(err);
          else resolve(res.affectedRows);
        }
      );
    });
  }
}
