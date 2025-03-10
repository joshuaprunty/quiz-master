// /src/firebase/firestore/getAllPublicQuizzes.js
import { db } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";

const getAllPublicQuizzes = async () => {
  try {
    const publicQuizRef = collection(db, "public-quizzes");
    const snapshot = await getDocs(publicQuizRef);
    const quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { result: quizzes, error: null };
  } catch (err) {
    return { result: null, error: err.message };
  }
};

export default getAllPublicQuizzes;