import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// const Question = z.object({
//   question: z.string(),
//   answers: z.array(z.string()),
//   correct_answer: z.string(),
//   explanation: z.string(),  // New field
// });

// const TFQuestion = z.object({
//   question: z.string(),
//   correct_answer: z.boolean(),
//   explanation: z.string(),
// });

const Question = z.object({
  type: z.literal('multiple-choice'),
  question: z.string(),
  answers: z.array(z.string()),
  correct_answer: z.string(),
  explanation: z.string(),
});

const TFQuestion = z.object({
  type: z.literal('true-false'),
  question: z.string(),
  correct_answer: z.boolean(),
  explanation: z.string(),
});

// // Modify the schema to be an object containing the array of questions
// const ResponseSchema = z.object({
//   questions: z.array(Question)
// });

// const TFResponseSchema = z.object({
//   questions: z.array(TFQuestion)
// });

// const MixedResponseSchema = z.object({
//   questions: z.array(z.discriminatedUnion('type', [Question, TFQuestion]))
// });

// Rest of the schemas remain the same
const ResponseSchema = z.object({
  questions: z.array(Question)
});

const TFResponseSchema = z.object({
  questions: z.array(TFQuestion)
});

const MixedResponseSchema = z.object({
  questions: z.array(z.discriminatedUnion('type', [Question, TFQuestion]))
});

export async function POST(request) {
  try {
    const { text, type } = await request.json();

    let systemPrompt = '';
    let responseSchema = ResponseSchema;
    let selectedResponseFormat = zodResponseFormat(ResponseSchema, "questions");

    switch (type) {
      case 'true-false':
        systemPrompt = 'You are a helpful teaching assistant. Analyze the provided study materials and generate 10 true/false questions with detailed explanations. The explanation must always begin with "The correct answer is <true/false>. It is correct because ..."';
        responseSchema = TFResponseSchema;
        selectedResponseFormat = zodResponseFormat(TFResponseSchema, "questions");
        break;
      case 'mixed':
        systemPrompt = 'You are a helpful teaching assistant. Analyze the provided study materials and generate a mix of questions: 5 multiple choice questions with 4 options and 1 correct answer, and 5 true/false questions. For each question, provide a detailed explanation. The explanation must always begin with "The correct answer is <answer>. It is correct because ..."';
        // You'll need to create a mixed schema that accepts both types
        responseSchema = MixedResponseSchema;
        selectedResponseFormat = zodResponseFormat(MixedResponseSchema, "questions");
        break;
      default: // multiple-choice
        systemPrompt = 'You are a helpful teaching assistant. Analyze the provided study materials and generate 10 multiple choice questions with 4 options, 1 correct answer, and a detailed explanation for the correct answer. The explanation must always begin with "The correct answer is <correct_answer>. It is correct because ..."';
        break;
    }



    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", 
          content: systemPrompt, },
        { role: "user", content: text },
      ],
      response_format: selectedResponseFormat,
    });
    
    const questions = response.choices[0].message.parsed.questions;  // Access the questions array from the parsed object
    return Response.json(questions);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return Response.json({ error: 'Failed to analyze text' }, { status: 500 });
  }
}