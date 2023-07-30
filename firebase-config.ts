// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app")
const {getFirestore}  = require("firebase/firestore")
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBrutwE6tegnaNSNntemoB9_xG7zN0I6Bo",
    authDomain: "horse-racing-cd020.firebaseapp.com",
    projectId: "horse-racing-cd020",
    storageBucket: "horse-racing-cd020.appspot.com",
    messagingSenderId: "568621899844",
    appId: "1:568621899844:web:fb432a9e24b4b0f6cb9c11",
    measurementId: "G-E5X0ZD67JC"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)