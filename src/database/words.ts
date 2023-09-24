const DEFAULT_DICTIONARY = 'default';

interface Word {
    value: string;
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

    public recordWord(value: string, translate: string) {
        this.words.push({
            value,
            translate,
            dictionary: DEFAULT_DICTIONARY,
            example: '',
            lastShow: Date.now(),
        });
    }

    public getRandomWord(): Word {
        return this.words[Math.floor((Math.random()*this.words.length))];
    }
}