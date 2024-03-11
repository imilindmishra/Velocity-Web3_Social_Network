import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAatUior8VAiixgcdEzbaR75af53fb81h8",
  authDomain: "layer-be1b2.firebaseapp.com",
  projectId: "layer-be1b2",
  storageBucket: "layer-be1b2.appspot.com",
  messagingSenderId: "676347296607",
  appId: "1:676347296607:web:836b441cceab0a30e614ea",
  measurementId: "G-ZQK5WC9M46"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics
const analytics = getAnalytics(app);

export { db, analytics };
