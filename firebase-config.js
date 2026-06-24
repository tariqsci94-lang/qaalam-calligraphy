/**
 * Qaalam Calligraphy — Firebase Configuration
 * ─────────────────────────────────────────────────────────────
 * STEP 1: Go to https://console.firebase.google.com
 * STEP 2: Create a project → Add Web App → Copy the config below
 * STEP 3: Replace every "PASTE_..." value with your real values
 * STEP 4: Save this file and upload to GitHub
 * ─────────────────────────────────────────────────────────────
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAT3so0sZpenOVRWtezf8eVgVqFueNJgyI",
  authDomain: "qaalam-calligraphy.firebaseapp.com",
  projectId: "qaalam-calligraphy",
  storageBucket: "qaalam-calligraphy.firebasestorage.app",
  messagingSenderId: "69899543168",
  appId: "1:69899543168:web:04e10ffe2f9c99a8013c65",
  measurementId: "G-92W8414454"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);