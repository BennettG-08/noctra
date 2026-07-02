// ==============================
// Firebase NOCTRA
// ==============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {

    apiKey: "AIzaSyDavM_1KqDWtuM5t88lrQnp3spnZxi-8GM",

    authDomain: "noctra-bbdaf.firebaseapp.com",

    projectId: "noctra-bbdaf",

    storageBucket: "noctra-bbdaf.firebasestorage.app",

    messagingSenderId: "1047689936282",

    appId: "1:1047689936282:web:bc83f1c390256821b3ce23"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
