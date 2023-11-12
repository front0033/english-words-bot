import { Connection, ResultSetHeader } from "mysql2";

import { DEFAULT_RESOLVE, USERS_TABLE_NAME, WORDS_TABLE_NAME } from './constants';
import Word from "./models/word.model";
import { RowDataPacket } from "mysql2";

export interface WordWithUserId extends RowDataPacket {
  userId: number;
  chartId: number
  word: string;
  translate: string;
}

export class WordDB {
  private connection: Connection;

  public constructor(connection: Connection) {
    this.connection = connection;
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

  public selectByTopUsers(amountOfUser: number): Promise<WordWithUserId[]> {
    return new Promise((resolve, reject) => {
      /**
       * SELECT  id, word, translate
        FROM users INNER JOIN words
        ON users.id = words.user_id AND subscribed = 1
        ORDER BY RAND()
         LIMIT 1;
       */
      this.connection.query<WordWithUserId[]>( // написать вложенный запрос
      `SELECT id AS userId, chat_id AS chatId, word, translate
        FROM ${USERS_TABLE_NAME} INNER JOIN ${WORDS_TABLE_NAME}
        ON ${USERS_TABLE_NAME}.id = ${WORDS_TABLE_NAME}.user_id AND subscribed = true ORDER BY RAND() LIMIT 1`,
      [amountOfUser],
      (err, res) => {
        if (err) reject(`${USERS_TABLE_NAME} retrieveById ERROR: ${JSON.stringify(err, null, 4)}`);
        else resolve(res);
      }
    );
    });
  }

  public getRandomWordByUserId(userId: number): Promise<Word> {
    return new Promise((resolve, reject) => {
      this.connection.query<Word[]>(
      `SELECT row FROM ${WORDS_TABLE_NAME} ORDER BY RAND() LIMIT 1`, // TODO: нифига не работает, пофиксить
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
        `INSERT INTO ${WORDS_TABLE_NAME} (user_id, word, resolve, last_time_to_revise, translate, part_of_speech) VALUES(?,?,?,?,?,?)`,
        [userId, word.word, word.resolve || DEFAULT_RESOLVE, word.last_time_to_revise || null, word.translate || null, word.part_of_speech || null],
        (err, res) => {
          if (err) reject(`${WORDS_TABLE_NAME} save ERROR: ${JSON.stringify(err, null, 4)}`);
          else resolve(res);
        }
      );
    });
  }

  public update(word: Word, userId: number): Promise<number> {
    return new Promise((resolve, reject) => {
      this.connection.query<ResultSetHeader>(
        `UPDATE ${WORDS_TABLE_NAME} SET user_id = ?, word = ?, resolve = ?, last_time_to_revise = ?, translate = ?, part_of_speech = ?  WHERE id = ?`,
        [userId, word.word, word.resolve || DEFAULT_RESOLVE, word.last_time_to_revise || null, word.translate || null, word.part_of_speech || null],
        (err, res) => {
          if (err) reject(err);
          else resolve(res.affectedRows);
        }
      );
    });
  }
}
