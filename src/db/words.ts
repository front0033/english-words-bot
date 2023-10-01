import { Connection, ResultSetHeader } from "mysql2";

import { DEFAULT_RESOLVE, WORDS_TABLE_NAME } from './constants';
import Word from "./models/word.model";

export class Words {
  private connection: Connection;

  private constructor(connection: Connection) {
    this.connection = connection;
  }

  public retrieveById(id: number): Promise<Word> {
    return new Promise((resolve, reject) => {
      this.connection.query<Word[]>(
      `SELECT * FROM ${WORDS_TABLE_NAME} WHERE id = ?`,
      [id],
      (err, res) => {
        if (err) reject(`${WORDS_TABLE_NAME} retrieveById ERROR: ${JSON.stringify(err, null, 4)}`);
        else resolve(res?.[0]);
      }
    );
    });
  }

  public retrieveByUserId(userId: number): Promise<Word> {
    return new Promise((resolve, reject) => {
      this.connection.query<Word[]>(
      `SELECT * FROM ${WORDS_TABLE_NAME} WHERE user_id = ?`,
      [userId],
      (err, res) => {
        if (err) reject(`${WORDS_TABLE_NAME} retrieveById ERROR: ${JSON.stringify(err, null, 4)}`);
        else resolve(res?.[0]);
      }
    );
    });
  }

  public save(word: Word, userId: number) {
    return new Promise((resolve, reject) => {
      this.connection.query<ResultSetHeader>(
        `INSERT INTO ${WORDS_TABLE_NAME} (user_id, word, resolve, last_time_to_revise, translate) VALUES(?,?,?,?,?)`,
        [userId, word.word, word.resolve || DEFAULT_RESOLVE, word.last_time_to_revise || null, word.translate || null],
        (err, res) => {
          if (err) reject(`${WORDS_TABLE_NAME} save ERROR: ${JSON.stringify(err, null, 4)}`);
          else
            this.retrieveById(res.insertId)
              .then((words) => resolve(words!))
              .catch(reject);
        }
      );
    });
  }

  public update(word: Word, userId: number): Promise<number> {
    return new Promise((resolve, reject) => {
      this.connection.query<ResultSetHeader>(
        `UPDATE ${WORDS_TABLE_NAME} SET user_id = ?, word = ?, resolve = ?, last_time_to_revise = ?, translate = ? WHERE id = ?`,
        [userId, word.word, word.resolve || DEFAULT_RESOLVE, word.last_time_to_revise || null, word.translate || null],
        (err, res) => {
          if (err) reject(err);
          else resolve(res.affectedRows);
        }
      );
    });
  }
}