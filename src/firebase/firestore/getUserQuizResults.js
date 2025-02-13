import { getFirestore, collection, getDocs, orderBy, query } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function getUserQuizResults(userId) {
  let result = [];
  let error = null;

  try {
    const quizResultRef = collection(db, `users/${userId}/quiz-results`);
    const q = query(quizResultRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
      result.push({
        id: doc.id,
        ...doc.data()
      });
    });
  } catch (e) {
    error = e;
  }

  return { result, error };
}