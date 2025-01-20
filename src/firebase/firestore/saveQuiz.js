import { getFirestore, collection, addDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function saveQuiz(userId, quizData) {
  let result = null;
  let error = null;

  try {
    const quizRef = collection(db, `users/${userId}/quizzes`);
    result = await addDoc(quizRef, {
      ...quizData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    error = e;
  }

  return { result, error };
}