import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { addQuestionToQuiz } from "../../../firebase/helpers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define Zod schemas for each question type
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

// Helper function to clean up message content
function extractJson(content) {
  content = content.trim();
  if (content.startsWith("```")) {
    content = content.replace(/^```(?:json)?\n/, "");
    content = content.replace(/```$/, "");
  }
  return content.trim();
}

export async function POST(request) {
  try {
    const { currentQuestion } = await request.json();

    if (!currentQuestion || !currentQuestion.quizId || !currentQuestion.userId) {
      throw new Error("Missing currentQuestion, quizId, or userId in the request");
    }

    // Determine the original question type and build type-specific instructions
    let promptDetails = "";
    if (currentQuestion.type === "multiple-choice") {
      promptDetails = `
        Please generate a extremely similar multiple-choice question.
        Use the following JSON format:
        {
          "type": "multiple-choice",
          "question": "Your new question text",
          "answers": ["Answer1", "Answer2", "Answer3", "Answer4"],
          "correct_answer": "Exact text of the correct answer",
          "explanation": "The correct answer is <correct_answer>. Because ..."
        }
      `;
    } else if (currentQuestion.type === "true-false") {
      promptDetails = `
        Please generate a extremely similar true-false question.
        Use the following JSON format:
        {
          "type": "true-false",
          "question": "Your new question text",
          "answers": ["True", "False"],
          "correct_answer": "True" or "False",
          "explanation": "The correct answer is <correct_answer>. Because ..."
        }
      `;
    } else if (currentQuestion.type === "short-answer") {
      promptDetails = `
        Please generate a extremely similar short-answer question.
        Use the following JSON format:
        {
          "type": "short-answer",
          "question": "Your new question text",
          "correct_answer": "Exact text of the correct answer",
          "explanation": "The correct answer is <correct_answer>. Because ..."
        }
      `;
    } else {
      throw new Error("Unsupported question type: " + currentQuestion.type);
    }

    // Build the full system prompt with a strong instruction for high similarity
    const systemPrompt = `
      Generate a new question that is extremely similar to the original.
      Original Question: ${currentQuestion.question}
      Correct Answer: ${currentQuestion.correct_answer}
      ${promptDetails}
    `;

    // Call OpenAI API (you can change the model as needed)
    const modelName = "gpt-4o-2024-08-06"; // or "gpt-3.5-turbo"
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: "system", content: systemPrompt }],
    });

    console.log("OpenAI response:", response);
    if (!response.choices || response.choices.length === 0) {
      throw new Error("No choices returned from OpenAI");
    }

    let messageContent = response.choices[0].message.content;
    console.log("Raw message content:", messageContent);

    messageContent = extractJson(messageContent);
    console.log("Extracted JSON content:", messageContent);

    let parsedData;
    try {
      parsedData = JSON.parse(messageContent);
    } catch (e) {
      console.error("Failed to parse message content as JSON", e);
      throw new Error("Failed to parse message content as JSON");
    }

    // Validate the parsed data using Zod
    const parsedResponse = ResponseSchema.parse({ questions: [parsedData] });
    const similarQuestion = parsedResponse.questions[0];

    if (!similarQuestion) {
      throw new Error("Failed to extract similar question");
    }

    // Save the new question into Firestore under the user's quiz
    await addQuestionToQuiz(currentQuestion.userId, currentQuestion.quizId, similarQuestion);

    return NextResponse.json(similarQuestion);
  } catch (error) {
    console.error("Error generating similar question:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to generate similar question" },
      { status: 500 }
    );
  }
}