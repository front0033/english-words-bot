import OpenAI from 'openai';
import { config } from '../config';

const { OPENAI_API_KEY, OPENAI_API_MODEL } = config;

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


