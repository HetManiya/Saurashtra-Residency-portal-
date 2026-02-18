// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBiGp3c-Xa9WWMG9vzmtnpKMxUCq5_4-YA",
  authDomain: "saurashtra-residency-portal.firebaseapp.com",
  projectId: "saurashtra-residency-portal",
  storageBucket: "saurashtra-residency-portal.firebasestorage.app",
  messagingSenderId: "1022208617782",
  appId: "1:1022208617782:web:f445f13171b05ecd56d797",
  measurementId: "G-2YG7MXVK82"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);