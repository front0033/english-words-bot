import { ensureDatabase } from './connect';
import { DEFAULT_RATING, DEFAULT_RESOLVE, ESERS_TABLE_NAME } from './constants';

const DEFAULT_DICTIONARY = 'default';

interface User {
  id: number;
  name: string;
  /**
   * from 0 to 10
   */
  rating: number;
  last_usage_data: string;
}

export class WordsCollector {

    public async recordUser(userId: number, name: string) {
        (await ensureDatabase()).query(`INSERT INTO ${ESERS_TABLE_NAME} (${userId},${name},${DEFAULT_RATING},${new Date()})`);
    }

}
