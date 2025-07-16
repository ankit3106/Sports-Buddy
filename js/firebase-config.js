// ADD YOUR FIREBASE CONFIG HERE
const firebaseConfig = { 
    apiKey: "AIzaSyCF7ld8f3B7SywaWSOL1vnJf8VCvMezTBU",
    authDomain: "sport-buddy-36b16.firebaseapp.com",
    projectId: "sport-buddy-36b16",
    storageBucket: "sport-buddy-36b16.firebasestorage.app",
    messagingSenderId: "619935314281",
    appId: "1:619935314281:web:272e91728eee6da4420df8",
    measurementId: "G-12S8833VLM"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
export { auth, db };
