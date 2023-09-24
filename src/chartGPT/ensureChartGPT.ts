import OpenAI from 'openai';

let openai: OpenAI | null = null;

export const ensureChartGPT = () => {
  if (openai) {
    return openai;
  }

  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openai;
}


