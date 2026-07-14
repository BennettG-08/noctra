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

    apiKey: "AIzaSyDavM_1KqDWtuM5t88lrQnp3spnZxi-8GM",

    authDomain: "noctra-bbdaf.firebaseapp.com",

    projectId: "noctra-bbdaf",

    storageBucket: "noctra-bbdaf.firebasestorage.app",

    messagingSenderId: "1047689936282",

    appId: "1:1047689936282:web:bc83f1c390256821b3ce23",

    measurementId: "G-6C20CHJNX8"

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

console.error("Error login:", error);

}

}


async function logoutUser(){

try{

await signOut(auth);

}catch(error){

console.error("Error cerrar sesión:", error);

}

}


// ===========================
// ESTADO DE SESIÓN
// ===========================

onAuthStateChanged(auth,(user)=>{

if(user){

console.log("Usuario conectado:", user.email);

}else{

console.log("Usuario sin sesión");

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
