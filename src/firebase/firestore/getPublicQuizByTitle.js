// Example: /firebase/firestore/getPublicQuizByTitle.js
import { db } from "@/firebase/config"; // adjust import as needed
import { collection, getDocs, query, where } from "firebase/firestore";

const getPublicQuizByTitle = async (quizTitle) => {
  try {
    const publicQuizRef = collection(db, "public_quizzes");
    const q = query(publicQuizRef, where("title", "==", quizTitle));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return { result: null, error: "No public quiz found" };
    }
    const doc = querySnapshot.docs[0];
    const quizData = { ...doc.data(), id: doc.id };
    return { result: quizData, error: null };
  } catch (err) {
    return { result: null, error: err.message };
  }
};

export default getPublicQuizByTitle;