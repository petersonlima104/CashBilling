// IMPORTAÇÕES MODULARES (SDK v9+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_3MtihQkeoyYf0F3Iz6xwe1Tt9pyKNO8",
  authDomain: "cashbilling-8a2cb.firebaseapp.com",
  projectId: "cashbilling-8a2cb",
  storageBucket: "cashbilling-8a2cb.firebasestorage.app",
  messagingSenderId: "693401697523",
  appId: "1:693401697523:web:6069ac203c84ea2c324b86",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
