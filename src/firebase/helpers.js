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