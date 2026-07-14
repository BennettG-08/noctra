// =================================
// FIREBASE CONFIG - 𓆩⍣⃝  𝙉𝙊𝘾𝙏𝙍𝘼⍣⃝  𓆪
// =================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { 
    getFirestore 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// COLOCA AQUÍ LOS DATOS DE TU PROYECTO FIREBASE

const firebaseConfig = {

    apiKey: "TU_API_KEY",

    authDomain: "TU_AUTH_DOMAIN",

    projectId: "TU_PROJECT_ID",

    storageBucket: "TU_STORAGE_BUCKET",

    messagingSenderId: "TU_MESSAGING_SENDER_ID",

    appId: "TU_APP_ID"

};


// INICIAR FIREBASE

const app = initializeApp(firebaseConfig);


// SERVICIOS

const db = getFirestore(app);

const auth = getAuth(app);


// EXPORTAR

export {
    app,
    db,
    auth
};
