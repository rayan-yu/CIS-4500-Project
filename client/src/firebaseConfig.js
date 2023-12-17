import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyB3DJwZPgGAeIK6r9BBCzzzW73AERQlP9k",
    authDomain: "cis450-71a29.firebaseapp.com",
    projectId: "cis450-71a29",
    storageBucket: "cis450-71a29.appspot.com",
    messagingSenderId: "908522762233",
    appId: "1:908522762233:web:8f3df9cdf2506f3b2ed728"
  };

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
export default {auth};