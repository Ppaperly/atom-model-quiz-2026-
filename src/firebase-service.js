import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCMrXcbMrqjcxtIVtHFK4kRGqCCshx8O9A",
  authDomain: "atom-quiz2026.firebaseapp.com",
  projectId: "atom-quiz2026",
  storageBucket: "atom-quiz2026.firebasestorage.app",
  messagingSenderId: "215913928615",
  appId: "1:215913928615:web:47a7822c3d065e41dac882"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const DEFAULT_SETTINGS = {
  answerRevealEnabled: false,
  elementSearchEnabled: false
};

export async function createSession(profile) {
  const ref = await addDoc(collection(db, "sessions"), {
    ...profile,
    createdAt: serverTimestamp(),
    completedAt: null
  });
  return ref.id;
}

export async function completeSession(sessionId) {
  await setDoc(doc(db, "sessions", sessionId), { completedAt: serverTimestamp() }, { merge: true });
}

export async function saveSubmission(submission) {
  const ref = await addDoc(collection(db, "submissions"), {
    ...submission,
    submittedAt: serverTimestamp()
  });
  return ref.id;
}

export async function listSubmissions() {
  const snapshot = await getDocs(query(collection(db, "submissions"), orderBy("submittedAt", "desc")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function saveFeedback(feedback) {
  const ref = await addDoc(collection(db, "feedback"), {
    ...feedback,
    createdAt: serverTimestamp()
  });
  return ref.id;
}

export async function listFeedback() {
  const snapshot = await getDocs(query(collection(db, "feedback"), orderBy("createdAt", "asc")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getSettings() {
  const ref = doc(db, "settings", "app");
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    await setDoc(ref, { ...DEFAULT_SETTINGS, updatedAt: serverTimestamp() }, { merge: true });
    return { ...DEFAULT_SETTINGS };
  }
  return { ...DEFAULT_SETTINGS, ...snapshot.data() };
}

export async function saveSettings(settings) {
  await setDoc(doc(db, "settings", "app"), {
    answerRevealEnabled: Boolean(settings.answerRevealEnabled),
    elementSearchEnabled: Boolean(settings.elementSearchEnabled),
    updatedAt: serverTimestamp()
  }, { merge: true });
}
