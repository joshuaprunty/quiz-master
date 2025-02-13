import { getFirestore, collection, addDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function saveQuizResult(userId, resultData) {
  let result = null;
  let error = null;

  try {
    const quizResultRef = collection(db, `users/${userId}/quiz-results`);
    const docRef = await addDoc(quizResultRef, {
      ...resultData,
      timestamp: new Date().toISOString(),
    });
    result = { id: docRef.id };
  } catch (e) {
    error = e;
  }

  return { result, error };
}