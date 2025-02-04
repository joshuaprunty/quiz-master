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
  explanation: z.string(), // New field
});

// Create a new schema for an array of questions
const QuestionArray = z.array(Question);

// Modify the schema to be an object containing the array of questions
const ResponseSchema = z.object({
  questions: z.array(Question),
});

export async function POST(request) {
  try {
    const { text, regenerateIndex, existingQuestions } = await request.json();

    let messages = [];

    const sanitizedQuestions = existingQuestions
      ? existingQuestions.map(
          ({ question, answers, correct_answer, explanation }) => ({
            question,
            answers,
            correct_answer,
            explanation,
          })
        )
      : [];

    if (regenerateIndex !== undefined) {
      messages = [
        {
          role: "system",
          content:
            "You are an AI quiz assistant. Given the following study material and an existing quiz, regenerate only the specified question while maintaining quality and consistency. The new generated question should follow the same structure as the original question.",
        },
        {
          role: "user",
          content: JSON.stringify({
            text,
            question: sanitizedQuestions[regenerateIndex].question,
          }),
        },
      ];
    } else {
      messages = [
        {
          role: "system",
          content:
            'You are a helpful teaching assistant. Analyze the provided study materials and generate 10 multiple choice questions with 4 options, 1 correct answer, and a detailed explanation for the correct answer. The explanation must always begin with "The correct answer is <correct_answer>. It is correct because ..."" followed by a detailed explanation.',
        },
        { role: "user", content: text },
      ];
    }

    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages,
      response_format: zodResponseFormat(ResponseSchema, "questions"),
    });

    const newQuestions = response.choices[0].message.parsed.questions; // Access the questions array from the parsed object

    if (regenerateIndex !== undefined) {
      return Response.json({ question: newQuestions[0] });
    }

    return Response.json(newQuestions);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return Response.json({ error: "Failed to analyze text" }, { status: 500 });
  }
}
