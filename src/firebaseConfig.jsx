// import { initializeApp } from "firebase/app";
// import firebase from 'firebase/app'; 
// import { collection, onSnapshot } from "firebase/firestore";
// import { db } from "./firebaseConfig";
// import { getAnalytics } from "firebase/analytics";

// const usersCollectionRef = collection(db, "users");

// const firebaseConfig = {
//   apiKey: "AIzaSyAatUior8VAiixgcdEzbaR75af53fb81h8",
//   authDomain: "layer-be1b2.firebaseapp.com",
//   projectId: "layer-be1b2",
//   storageBucket: "layer-be1b2.appspot.com",
//   messagingSenderId: "676347296607",
//   appId: "1:676347296607:web:836b441cceab0a30e614ea",
//   measurementId: "G-ZQK5WC9M46"
// };

// const app = initializeApp(firebaseConfig);
// const db = firebase.firestore();
// const analytics = getAnalytics(app);

// export { db, analytics };


import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDLG9AQuZpFhyE-b3TvKASzTRpM3-_d47g",
  authDomain: "layer-24a25.firebaseapp.com",
  projectId: "layer-24a25",
  storageBucket: "layer-24a25.appspot.com",
  messagingSenderId: "407246477458",
  appId: "1:407246477458:web:43560535d599873fbd2e4b",
  measurementId: "G-WEKPHG0RE3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const usersCollectionRef = collection(db, "users");

const auth = getAuth(app);

// Sign in with email and password
const signIn = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in successfully.");
  } catch (error) {
    console.error("Error signing in:", error);
  }
};

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user);
  } else {
    console.log("User is signed out");
  }
});


const unsubscribe = onSnapshot(usersCollectionRef, (querySnapshot) => {
  // This function will be called whenever the "users" collection changes
  querySnapshot.docChanges().forEach((change) => {
    const document = change.doc;
    if (change.type === "added") {
      console.log("New user: ", document.data());
    }
    if (change.type === "modified") {
      console.log("Modified user: ", document.data());
    }
    if (change.type === "removed") {
      console.log("Removed user: ", document.data());
    }
  });
});

console.log(unsubscribe)
// Stop listening for updates when no longer needed
// unsubscribe();

export { db, analytics, signIn };