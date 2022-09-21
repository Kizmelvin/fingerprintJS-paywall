// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbaEm_QejmHi_D6PIo1BKt_qBsdj09ZvQ",
  authDomain: "vistors-d4b61.firebaseapp.com",
  projectId: "vistors-d4b61",
  storageBucket: "vistors-d4b61.appspot.com",
  messagingSenderId: "583594379030",
  appId: "1:583594379030:web:3038630fd92d1fe76df237",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
