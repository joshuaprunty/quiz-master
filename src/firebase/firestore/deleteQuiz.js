import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import firebase_app from "../config";
import { deletePublicQuiz } from './publicQuizzes';

const db = getFirestore(firebase_app);

export default async function deleteQuiz(userId, quizId, publicQuizId = null) {
  let error = null;

  try {
    // Delete from user's quizzes
    await deleteDoc(doc(db, `users/${userId}/quizzes/${quizId}`));
    
    // If it's a public quiz, also delete from public-quizzes
    if (publicQuizId) {
      await deletePublicQuiz(publicQuizId);
    }
  } catch (e) {
    error = e;
  }

  return { error };
}