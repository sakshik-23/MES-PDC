import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'mes-pdc-local';
export const appId = rawAppId.replace(/\//g, '_').replace(/\./g, '-');

const PUBLIC_DATA = `artifacts/${appId}/public/data`;

export const COLLECTIONS = {
  USERS: `${PUBLIC_DATA}/users`,
  REPORTS: `${PUBLIC_DATA}/reports`,
  STUDENTS: `${PUBLIC_DATA}/students`,
  OTPS: `${PUBLIC_DATA}/otps`,
  QUESTIONNAIRES: `${PUBLIC_DATA}/questionnaires`,
  RESPONSES: `${PUBLIC_DATA}/responses`,
  EVENTS: `${PUBLIC_DATA}/events`,
  SCHEDULES: `${PUBLIC_DATA}/schedules`
};