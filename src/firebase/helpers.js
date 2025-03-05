// src/firebase/helpers.js
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./config"; // Your firebase config file

// Now the function accepts userId as well as quizId
export async function addQuestionToQuiz(userId, quizId, newQuestion) {
  const quizRef = doc(db, "users", userId, "quizzes", quizId);
  const docSnap = await getDoc(quizRef);

  if (docSnap.exists()) {
    // Update existing quiz document
    await updateDoc(quizRef, {
      questions: arrayUnion(newQuestion)
    });
  } else {
    // Create the quiz document if it doesn't exist
    await setDoc(quizRef, { questions: [newQuestion] });
  }
}

export async function replaceQuestionInQuiz(userId, quizId, oldQuestion, newQuestion) {
  const quizRef = doc(db, "users", userId, "quizzes", quizId);
  const docSnap = await getDoc(quizRef);

  if (!docSnap.exists()) {
    throw new Error(`Quiz ${quizId} for user ${userId} does not exist`);
  }

  const quizData = docSnap.data();
  const oldQuestions = quizData.questions || [];

  // Example method: remove any question with the same 'question' text.
  // If you have a unique 'id' for each question, prefer that approach:
  const updatedQuestions = oldQuestions.filter(
    (q) => q.question !== oldQuestion.question
  );

  // Now append the newly generated question
  updatedQuestions.push(newQuestion);

  // Update the quiz doc
  await updateDoc(quizRef, { questions: updatedQuestions });
}