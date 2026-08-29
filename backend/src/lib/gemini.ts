import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI } from '@google/genai';

export const getGeminiClient = (): GoogleGenAI => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
  });
};

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export default ai;
