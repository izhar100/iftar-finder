// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5DTZqsHomb3AhOPcJvr6qzPvFwId85cw",
  authDomain: "iftar-finder.firebaseapp.com",
  databaseURL: "https://iftar-finder-default-rtdb.firebaseio.com",
  projectId: "iftar-finder",
  storageBucket: "iftar-finder.firebasestorage.app",
  messagingSenderId: "204353063340",
  appId: "1:204353063340:web:55f2661b99d7aafc165209",
  measurementId: "G-E0GKP232TH"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);