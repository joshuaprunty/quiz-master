import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MCQuestion = z.object({
  type: z.literal('multiple-choice'),
  question: z.string(),
  answers: z.array(z.string()),
  correct_answer: z.string(),
  explanation: z.string(),
});

const TFQuestion = z.object({
  type: z.literal('true-false'),
  question: z.string(),
  answers: z.array(z.string()),
  correct_answer: z.string(),
  explanation: z.string(),
});

const SAQuestion = z.object({
  type: z.literal('short-answer'),
  question: z.string(),
  correct_answer: z.string(),
  explanation: z.string(),
});

const Question = z.union([MCQuestion, TFQuestion, SAQuestion]);

const ResponseSchema = z.object({
  questions: z.array(Question)
});

export async function POST(request) {
  try {
    const { text, type } = await request.json();
    let systemPrompt = '';
    switch (type) {
      case 'true-false':
        systemPrompt = `You are a helpful teaching assistant. Analyze the provided study materials and generate 10 true/false questions with detailed explanations. 
        Each question must follow this exact format:
        {
          "type": "true-false",
          "question": "question text",
          "answers": ["True", "False"],
          "correct_answer": "True" or "False",
          "explanation": "The correct answer is <true/false>. It is correct because ..."
        }`;
        break;
      case 'multiple-choice':
        systemPrompt = `You are a helpful teaching assistant. Analyze the provided study materials and generate 10 multiple choice questions with 4 options, 1 correct answer, and detailed explanations.
        Each question must follow this exact format:
        {
          "type": "multiple-choice",
          "question": "question text",
          "answers": ["option1", "option2", "option3", "option4"],
          "correct_answer": "exact text of correct answer",
          "explanation": "The correct answer is <correct_answer>. It is correct because ..."
        }`;
        break;
      case 'mixed':
        systemPrompt = `You are a helpful teaching assistant. Analyze the provided study materials and generate a mix of questions:
        4 multiple choice questions in this format:
        {
          "type": "multiple-choice",
          "question": "question text",
          "answers": ["option1", "option2", "option3", "option4"],
          "correct_answer": "exact text of correct answer",
          "explanation": "The correct answer is <correct_answer>. It is correct because ..."
        }
        
        3 true/false questions in this format:
        {
          "type": "true-false",
          "question": "question text",
          "answers": ["True", "False"],
          "correct_answer": "True" or "False",
          "explanation": "The correct answer is <true/false>. It is correct because ..."
        }

        And 3 short answer questions in this format:
        {
          "type": "short-answer",
          "question": "question text",
          "correct_answer": "exact text of correct answer",
          "explanation": "The correct answer is <correct_answer>. It is correct because ..."
        }`;
        break;
      case 'short-answer':
        systemPrompt = `You are a helpful teaching assistant. Analyze the provided study materials and generate 10 short answer questions with detailed explanations. 
        Each question must follow this exact format:
        {
          "type": "short-answer",
          "question": "question text",
          "correct_answer": "exact text of correct answer",
          "explanation": "The correct answer is <correct_answer>. It is correct because ..."
        }`;
        break;
      default: // multiple-choice
        systemPrompt = 'You are a helpful teaching assistant. Analyze the provided study materials and generate 10 multiple choice questions with 4 options, 1 correct answer, and a detailed explanation for the correct answer. The explanation must always begin with "The correct answer is <correct_answer>. It is correct because ..."';
        break;
    }

    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: systemPrompt, },
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