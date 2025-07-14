// src/lib/firestore.ts
import { getFirestore, collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import { getAuth } from 'firebase/auth';

const availabilityRef = collection(firestore, 'availability');

// Make current user available for a topic
export async function setAvailability(topic: string) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const docRef = doc(availabilityRef, user.uid);
  await setDoc(docRef, {
    uid: user.uid,
    topic,
    timestamp: Date.now(),
  });
}

// Try to find an available competitor
export async function findMatch(topic: string): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;

  const q = query(
    availabilityRef,
    where('topic', '==', topic)
  );

  const snapshot = await getDocs(q);
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.uid !== user.uid) {
      // Found a match, delete both entries
      await deleteDoc(doc(availabilityRef, data.uid));
      await deleteDoc(doc(availabilityRef, user.uid));
      return data.uid;
    }
  }

  // No match yet
  return null;
}
