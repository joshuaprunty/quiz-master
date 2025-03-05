// src/app/api/regenerate/route.js
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MCQuestion = z.object({
  type: z.literal("multiple-choice"),
  question: z.string(),
  answers: z.array(z.string()),
  correct_answer: z.string(),
  explanation: z.string(),
});
const TFQuestion = z.object({
  type: z.literal("true-false"),
  question: z.string(),
  answers: z.array(z.string()),
  correct_answer: z.string(),
  explanation: z.string(),
});
const SAQuestion = z.object({
  type: z.literal("short-answer"),
  question: z.string(),
  correct_answer: z.string(),
  explanation: z.string(),
});
const Question = z.union([MCQuestion, TFQuestion, SAQuestion]);
const ResponseSchema = z.object({
  questions: z.array(Question),
});

export async function POST(request) {
  try {
    const { text, questionType } = await request.json();
    if (!text || !questionType) {
      throw new Error("Missing text or questionType");
    }

    const systemPrompt = `You are a helpful teaching assistant. Generate 1 ${questionType} question. Format in valid JSON:
{
  "type": "${questionType}",
  "question": "question text",
  "answers": ["Answer1", "Answer2", "Answer3", "Answer4"],
  "correct_answer": "Exact correct answer text",
  "explanation": "A brief explanation"
}`;

    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      response_format: zodResponseFormat(ResponseSchema, "questions"),
    });

    const question = response.choices[0].message.parsed.questions[0];
    return new Response(JSON.stringify(question), { status: 200 });
  } catch (error) {
    console.error("Error regenerating question:", error);
    return new Response(
      JSON.stringify({ error: "Failed to regenerate question" }),
      { status: 500 }
    );
  }
}