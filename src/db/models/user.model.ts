import { RowDataPacket } from "mysql2"

export default interface User extends RowDataPacket {
  id: number;
  name: string;
  /**
   * from 0 to 10
   */
  rating: null | number;
  last_usage_data: null | string; // datetime
  subscribed: null | number;
}
