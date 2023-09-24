import OpenAI from "openai";

import { ensureChartGPT } from "./ensureChartGPT";

let instance: ChartGPTService | null = null;

export class ChartGPTService {
  private openai: OpenAI;

  private constructor() {
    this.openai = ensureChartGPT();
  }

  public static ensure() {
    if (instance) {
      return instance;
    }

    return new ChartGPTService();
  }

  public async getSentenceByWord(word: string): Promise<string | null> {
    const chatCompletion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: `write sentence with word '${word}'` }],
      model: 'gpt-3.5-turbo',
    });

    const [firstChoice] = chatCompletion.choices;
    const currentSentence = firstChoice.message.content;

    return currentSentence;
  }
}
