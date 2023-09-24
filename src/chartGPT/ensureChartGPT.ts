import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../config';

let openai: OpenAI | null = null;

export const ensureChartGPT = () => {
  if (openai) {
    return openai;
  }

  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  return openai;
}


