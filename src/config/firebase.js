import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 1. Replace with your actual config from Firebase Console
const firebaseConfig = {
   apiKey: "AIzaSyAlEDfIh-R9LWP1zYTSuLqyaV-O8kTqPao",
  authDomain: "mes-pdc.firebaseapp.com",
  projectId: "mes-pdc",
  storageBucket: "mes-pdc.firebasestorage.app",
  messagingSenderId: "950509692448",
  appId: "1:950509692448:web:a48b395a96d1cecd287e45",
  measurementId: "G-RQLPRZVWG4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// App ID Sanitization
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'mes-pdc-local';
export const appId = rawAppId.replace(/\//g, '_').replace(/\./g, '-');

const PUBLIC_DATA = `artifacts/${appId}/public/data`;

// --- UPDATED COLLECTIONS ---
export const COLLECTIONS = {
  USERS: `${PUBLIC_DATA}/users`,
  REPORTS: `${PUBLIC_DATA}/reports`,
  STUDENTS: `${PUBLIC_DATA}/students`,
  OTPS: `${PUBLIC_DATA}/otps`,
  QUESTIONNAIRES: `${PUBLIC_DATA}/questionnaires`,
  RESPONSES: `${PUBLIC_DATA}/responses`,
  EVENTS: `${PUBLIC_DATA}/events`,
  SCHEDULES: `${PUBLIC_DATA}/schedules` // NEW COLLECTION
};