import { ensureDatabase } from './connect';
import { DEFAULT_RESOLVE, WORDS_TABLE_NAME } from './constants';

const DEFAULT_DICTIONARY = 'default';

interface Word {
    word: string;
    translate: string;
    dictionary: string;
    example: string;
    lastShow: number | null;
}

export class WordsCollector {
    private words: Word[];

    constructor() {
        this.words = [];
    }

    public async recordWord(userId: number, word: string, translate?: string) {
        (await ensureDatabase()).query(`INSERT INTO ${WORDS_TABLE_NAME} (${userId},${word},${DEFAULT_RESOLVE},${new Date()},${translate || null})`);
    }

    public getRandomWord(): Word {
        return this.words[Math.floor((Math.random()*this.words.length))];
    }
}
