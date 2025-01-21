import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA3uSmnF0oHbCr4RUJbUgM0JfD7W6vE41I",
  authDomain: "recordatorios-deka.firebaseapp.com",
  projectId: "recordatorios-deka",
  storageBucket: "recordatorios-deka.firebasestorage.app",
  messagingSenderId: "231646103911",
  appId: "1:231646103911:web:dfdafa52b338063abf87c2",
  measurementId: "G-2TPQN4HK79",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)