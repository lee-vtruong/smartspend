// firebaseClient.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // <--- Thêm GoogleAuthProvider
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC5NBPi5N8exIcQBQuQf8-nNSX626soag0",
  authDomain: "smartspend-7db78.firebaseapp.com",
  projectId: "smartspend-7db78",
  storageBucket: "smartspend-7db78.firebasestorage.app",
  messagingSenderId: "1035589252706",
  appId: "1:1035589252706:web:1c17cb0c174c47ed2e433b",
  measurementId: "G-NJMT5L01W6"
};

// Khởi tạo App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo các dịch vụ
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider(); // <--- Tạo provider Google

// Analytics
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Export googleProvider ra để dùng
export { app, auth, db, storage, analytics, googleProvider };