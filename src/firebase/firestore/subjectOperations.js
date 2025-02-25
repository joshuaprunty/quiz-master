import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
  } from "firebase/firestore";
  import firebase_app from "../config";
  
  const db = getFirestore(firebase_app);
  
  export async function saveSubject(userId, subjectData) {
    try {
      const subjectRef = collection(db, `users/${userId}/subjects`);
      const docRef = await addDoc(subjectRef, {
        ...subjectData,
        createdAt: new Date().toISOString(),
      });
      return { result: { id: docRef.id }, error: null };
    } catch (e) {
      return { result: null, error: e };
    }
  }
  
  export async function getUserSubjects(userId) {
    try {
      const subjectRef = collection(db, `users/${userId}/subjects`);
      const querySnapshot = await getDocs(subjectRef);
      const subjects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { result: subjects, error: null };
    } catch (e) {
      return { result: null, error: e };
    }
  }