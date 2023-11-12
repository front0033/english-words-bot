import { Connection, OkPacket, ProcedureCallPacket, ResultSetHeader, RowDataPacket } from "mysql2";

import { DEFAULT_RATING, USERS_TABLE_NAME } from './constants';
import User from "./models/user.model";

export class UserDB {
  private connection: Connection;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  public retrieveById(userId: number): Promise<User> {
    console.log('[User]: retrieveById - ', userId);
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
    console.log('[User]: save - ', user);
    return new Promise((resolve, reject) => {
      this.connection.query<ResultSetHeader>(
        `INSERT INTO ${USERS_TABLE_NAME} (id, name, chat_id, rating, last_usage_data, subscribed) VALUES(?,?,?,?,?,?)`,
        [user.id, user.name, user.chat_id, user.rating || DEFAULT_RATING, user.last_usage_data || null, user.subscribed || null],
        (err, res) => {
          if (err) reject(`${USERS_TABLE_NAME} save ERROR: ${JSON.stringify(err, null, 4)}`);
          else
            resolve(user!)
        }
      );
    });
  }

  public update(user: User): Promise<number> {
    console.log('[User]: update - ', user);
    return new Promise((resolve, reject) => {
      this.connection.query<ResultSetHeader>(
        `UPDATE ${USERS_TABLE_NAME} SET chat_id = ?, subscribed = ? WHERE id = ?`,
        [user.chat_id, user.subscribed, user.id, ],
        (err, res) => {
          if (err) reject(err);
          else resolve(res.affectedRows);
        }
      );
    });
  }

  public getSubscribedUsersCount(): Promise<ResultSetHeader[]> {
    return new Promise((resolve, reject) => {
      this.connection.query<ResultSetHeader[]>(
        `SELECT COUNT(id) AS fieldCount FROM ${USERS_TABLE_NAME} WHERE subscribed = 1`,
        [],
        (err, res) => {
          if (err) reject(err);
          else resolve(res);
        }
      );
    });
  }
}
