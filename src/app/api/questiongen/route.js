import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const Question = z.object({
  question: z.string(),
  answers: z.array(z.string()),
  correct_answer: z.string(),
  explanation: z.string(),  // New field
});

// Create a new schema for an array of questions
const QuestionArray = z.array(Question);

// Modify the schema to be an object containing the array of questions
const ResponseSchema = z.object({
  questions: z.array(Question)
});

export async function POST(request) {
  try {
    const { text } = await request.json();

    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", 
          content: 'You are a helpful teaching assistant. Analyze the provided study materials and generate 10 multiple choice questions with 4 options, 1 correct answer, and a detailed explanation for the correct answer. The explanation must always begin with "The correct answer is <correct_answer>. It is correct because ..."" followed by a detailed explanation.', },
        { role: "user", content: text },
      ],
      response_format: zodResponseFormat(ResponseSchema, "questions"),
    });
    
    const questions = response.choices[0].message.parsed.questions;  // Access the questions array from the parsed object
    return Response.json(questions);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return Response.json({ error: 'Failed to analyze text' }, { status: 500 });
  }
}