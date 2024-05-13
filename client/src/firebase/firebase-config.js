import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCyaA-5Sbr14Q-MyWLonjWmSLbnhsntck4",
    authDomain: "notes-summarizer-eade5.firebaseapp.com",
    projectId: "notes-summarizer-eade5",
    storageBucket: "notes-summarizer-eade5.appspot.com",
    messagingSenderId: "838459443483",
    appId: "1:838459443483:web:f5bc23e9022a41bf9e2bbe",
    measurementId: "G-6YL3624CG4"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleAuthProvider = new GoogleAuthProvider();

export { auth, googleAuthProvider };