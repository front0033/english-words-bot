import { RowDataPacket } from "mysql2"

export default interface Word extends RowDataPacket {
  user_id: number;
  word: string; // varchar(100)
  resolve?: 0 | 1;
  last_time_to_revise: null | string; // datetime
  translate: null | string; // varchar(100)
}
