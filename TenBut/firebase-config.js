// Firebase Realtime Database Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdgoyDsUteoRBIQ74NXvg5Xfj8V105Dnw",
  authDomain: "chirpssgames.firebaseapp.com",
  // CORRECTED DATABASE URL:
  databaseURL: "https://chirpssgames-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "chirpssgames",
  storageBucket: "chirpssgames.firebasestorage.app",
  messagingSenderId: "949878456642",
  appId: "1:949878456642:web:4287fe5fe9577ce1b688db",
  measurementId: "G-E628QMNRQY"
};

// Initialize Firebase App
firebase.initializeApp(firebaseConfig);
