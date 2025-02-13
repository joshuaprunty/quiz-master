import { getFirestore, doc, updateDoc } from "firebase/firestore";
import firebase_app from "../config";
import { updatePublicQuiz } from './publicQuizzes';

const db = getFirestore(firebase_app);

const updateQuiz = async (userId, quizId, updatedQuiz, publicQuizId = null) => {
  try {
    const quizRef = doc(db, `users/${userId}/quizzes/${quizId}`);

    await updateDoc(quizRef, updatedQuiz);
    
    if (publicQuizId) {
      await updatePublicQuiz(publicQuizId, updatedQuiz);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating quiz in database:", error);
    return { error };
  }
};

export default updateQuiz;
