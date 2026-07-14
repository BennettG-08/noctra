// ===========================
// FIREBASE.JS - 𓆩⍣⃝ 𝙉𝙊𝘾𝙏𝙍𝘼⍣⃝ 𓆪
// ===========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    increment
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ===========================
// CONFIGURACIÓN FIREBASE
// ===========================

const firebaseConfig = {

    apiKey: "TU_API_KEY",

    authDomain: "TU_AUTH_DOMAIN",

    projectId: "TU_PROJECT_ID",

    storageBucket: "TU_STORAGE_BUCKET",

    messagingSenderId: "TU_MESSAGING_SENDER_ID",

    appId: "TU_APP_ID"

};


// ===========================
// INICIAR FIREBASE
// ===========================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// ===========================
// PROVEEDOR LOGIN
// ===========================

const provider = new GoogleAuthProvider();


// ===========================
// COLECCIONES
// ===========================

const groupsCollection = collection(db,"groups");

const usersCollection = collection(db,"users");

const reportsCollection = collection(db,"reports");

const commentsCollection = collection(db,"comments");

const notificationsCollection = collection(db,"notifications");


// ===========================
// FUNCIONES DE USUARIO
// ===========================

async function loginGoogle(){

try{

const result = await signInWithPopup(auth,provider);

return result.user;

}catch(error){

console.error(error);

}

}


async function logoutUser(){

try{

await signOut(auth);

}catch(error){

console.error(error);

}

}


onAuthStateChanged(auth,(user)=>{

if(user){

console.log("Usuario conectado:", user.email);

}

});


// ===========================
// EXPORTAR
// ===========================

export {

app,
db,
auth,

groupsCollection,
usersCollection,
reportsCollection,
commentsCollection,
notificationsCollection,

addDoc,
getDocs,
getDoc,
doc,
updateDoc,
deleteDoc,
query,
where,
orderBy,
limit,
serverTimestamp,
increment,

loginGoogle,
logoutUser

};
