import { app, db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    increment
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// =========================
// FIREBASE
// =========================

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// =========================
// VARIABLES GLOBALES
// =========================

let grupos = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// =========================
// ELEMENTOS DEL DOM
// =========================

const splash = document.getElementById("splash");
const main = document.querySelector("main");
const fabButton = document.getElementById("fabButton");

const profileBtn = document.getElementById("profileBtn");
const notificationBtn = document.getElementById("notificationBtn");

const profilePage = document.getElementById("profilePage");
const favoritesPage = document.getElementById("favoritesPage");
const explorePage = document.getElementById("explorePage");
const groupDetailsPage = document.getElementById("groupDetailsPage");

const profileImage = document.getElementById("profileImage");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");

const detailImage = document.getElementById("detailImage");
const detailName = document.getElementById("detailName");
const detailCategory = document.getElementById("detailCategory");
const detailDescription = document.getElementById("detailDescription");
const detailViews = document.getElementById("detailViews");
const detailTime = document.getElementById("detailTime");
const detailJoinBtn = document.getElementById("detailJoinBtn");
const backToHomeBtn = document.getElementById("backToHomeBtn");

const publishModal = document.getElementById("publishModal");
const publishForm = document.getElementById("publishForm");

const favoritesNavBtn = document.getElementById("favoritesNavBtn");
const exploreNavBtn = document.getElementById("exploreNavBtn");
const profileNavBtn = document.getElementById("profileNavBtn");
const homeNavBtn = document.getElementById("homeNavBtn");
const logoutBtn = document.getElementById("logoutBtn");

const searchInput = document.getElementById("searchInput");

// =========================
// FUNCIONES GENERALES
// =========================

function guardarFavoritos() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function esFavorito(nombre) {
    return favorites.some(f => f.name === nombre);
}

function tiempoTranscurrido(fecha) {

    if (!fecha) return "Hace un momento";

    // Compatibilidad con Timestamp de Firebase
    if (fecha.seconds) {
        fecha = fecha.seconds * 1000;
    }

    const ahora = Date.now();
    const diferencia = ahora - fecha;

    const minutos = Math.floor(diferencia / 60000);

    if (minutos < 1) return "Hace unos segundos";
    if (minutos < 60) return `Hace ${minutos} min`;

    const horas = Math.floor(minutos / 60);

    if (horas < 24) return `Hace ${horas} h`;

    const dias = Math.floor(horas / 24);

    return `Hace ${dias} día${dias > 1 ? "s" : ""}`;
}

function ocultarPantallas() {

    if (main) main.style.display = "none";
    if (profilePage) profilePage.style.display = "none";
    if (favoritesPage) favoritesPage.style.display = "none";
    if (explorePage) explorePage.style.display = "none";
    if (groupDetailsPage) groupDetailsPage.style.display = "none";

}

// =========================
// SPLASH
// =========================

window.addEventListener("load", () => {

    setTimeout(() => {

        if (splash) {

            splash.style.opacity = "0";
            splash.style.transition = "0.5s";

            setTimeout(() => {

                splash.style.display = "none";

            }, 500);

        }

    }, 1500);

});

// =========================
// MODAL PUBLICAR
// =========================

if (fabButton && publishModal) {

    fabButton.addEventListener("click", () => {

        publishModal.style.display = "flex";

    });

    window.addEventListener("click", (e) => {

        if (e.target === publishModal) {

            publishModal.style.display = "none";

        }

    });

}

// =========================
// LOGIN GOOGLE
// =========================

onAuthStateChanged(auth, (user) => {

    if (!profileBtn) return;

    if (user) {

        profileBtn.innerHTML = `
            <img src="${user.photoURL}"
            style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
        `;

    } else {

        profileBtn.innerHTML = `
            <i class="fa-solid fa-user"></i>
        `;

    }

});

if (profileBtn) {

    profileBtn.addEventListener("click", async () => {

        try {

            await signInWithPopup(auth, provider);

        } catch (error) {

            if (error.code !== "auth/cancelled-popup-request") {

                alert(error.message);

            }

        }

    });

}
