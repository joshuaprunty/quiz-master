// /src/firebase/firestore/syncPublicQuiz.js
import { db } from "@/firebase/config";
import { deleteDoc, doc, setDoc } from "firebase/firestore";

export async function syncPublicQuiz(quizId, quizData, isPublic) {
  try {
    const publicQuizRef = doc(db, "public-quizzes", quizId);
    if (isPublic) {
      // Upsert the quiz in the public collection using the same quizId
      await setDoc(
        publicQuizRef,
        {
          ...quizData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } else {
      // If the quiz is not public, remove it from the public collection
      await deleteDoc(publicQuizRef);
    }
    return { success: true };
  } catch (error) {
    console.error("Error syncing public quiz:", error);
    return { error: error.message };
  }
}