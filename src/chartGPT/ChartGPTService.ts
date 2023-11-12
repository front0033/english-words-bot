import OpenAI from "openai";

import { ensureChartGPT } from "./ensureChartGPT";
import { config } from "../config";

const { OPENAI_API_MODEL } = config;

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

  public async translateWord(word: string): Promise<(string | null)[]> {
    const chatCompletion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: `translate '${word}' to russian` }],
      model: OPENAI_API_MODEL,
    });

    const choices = chatCompletion.choices.map((shoice) => shoice.message.content).filter(Boolean);

    return choices;
  }

  public async randomQuestion(): Promise<string | null> {
    return this.askAIByWord('say random question by English', '');
  }

  public async randomQuestionWithWord(word: string): Promise<string | null> {
    const text = await this.askAIByWord(`say random question by English ${word}`, '');
    return text?.replace(word, `<b>${word}</b>`) ?? null;
  }

  public async randomSentenceWithWord(word: string): Promise<string | null> {
    const text = await this.askAIByWord(`text random sentence with word "${word}" by English`, '');

    return text;
  }

  private async askAIByWord(question: string, word: string): Promise<string | null> {
    const chatCompletion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: `${question} '${word}'` }],
      model: OPENAI_API_MODEL,
    });

    const [firstChoice] = chatCompletion.choices;
    const currentSentence = firstChoice.message.content;

    return currentSentence;
  }
}
