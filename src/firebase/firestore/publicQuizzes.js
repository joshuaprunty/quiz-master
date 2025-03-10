import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, limit, query, updateDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export async function getPublicQuizzes(limitCount = 20) {
  let result = [];
  let error = null;

  try {
    const publicQuizzesRef = collection(db, 'public-quizzes');
    const q = query(publicQuizzesRef, limit(limitCount));
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

export async function addPublicQuiz(userId, quizData) {
  try {
    const publicQuizzesRef = collection(db, 'public-quizzes');
    const publicQuizData = {
      ...quizData,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await addDoc(publicQuizzesRef, publicQuizData);
    return { success: true };
  } catch (error) {
    console.error("Error adding public quiz:", error);
    return { error };
  }
}

export async function updatePublicQuiz(publicQuizId, updatedData) {
  try {
    const quizRef = doc(db, 'public-quizzes', publicQuizId);
    await updateDoc(quizRef, {
      ...updatedData,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating public quiz:", error);
    return { error };
  }
}

export async function deletePublicQuiz(publicQuizId) {
  try {
    await deleteDoc(doc(db, 'public-quizzes', publicQuizId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting public quiz:", error);
    return { error };
  }
}