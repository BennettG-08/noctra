import { app, db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

onAuthStateChanged(auth, (user) => {

    const profileBtn = document.getElementById("profileBtn");

    if (user) {

        if (profileBtn) {
            profileBtn.innerHTML = `
                <img src="${user.photoURL}"
                     alt="Perfil"
                     style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
            `;
        }

    } else {

        if (profileBtn) {
            profileBtn.innerHTML = `<i class="fa fa-user"></i>`;
        }

    }

});

/* =========================
   NOCTRA - SCRIPT BASE
========================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       SPLASH SCREEN
    ========================= */

    const splash = document.getElementById("splash");

    setTimeout(() => {

        if (splash) {

            splash.style.opacity = "0";
            splash.style.transition = "0.5s";

            setTimeout(() => {
                splash.style.display = "none";
            }, 500);

        }

    }, 1800);

    /* =========================
       MODALES
    ========================= */

    const fabButton = document.getElementById("fabButton");
    const publishModal = document.getElementById("publishModal");
    const loginModal = document.getElementById("loginModal");

    // Abrir modal publicar
    if (fabButton && publishModal) {

        fabButton.addEventListener("click", () => {

            publishModal.style.display = "flex";

        });

    }

    // Cerrar modal al hacer click fuera
    window.addEventListener("click", (e) => {

        if (e.target === publishModal) {
            publishModal.style.display = "none";
        }

        if (e.target === loginModal) {
            loginModal.style.display = "none";
        }

    });

    /* =========================
       LOGIN ICON
    ========================= */

  const profileBtn = document.getElementById("profileBtn");

if (profileBtn) {

    profileBtn.addEventListener("click", async () => {

        try {

            const result = await signInWithPopup(auth, provider);

            const user = result.user;

            profileBtn.innerHTML = `
                <img src="${user.photoURL}"
                style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
            `;

            alert("Bienvenido " + user.displayName);

        } catch (error) {

            if (error.code !== "auth/cancelled-popup-request") {
                alert(error.message);
            }

        }

    });

}

});

/* =========================
   SEARCH FUNCTION
========================= */

const searchInput = document.getElementById("searchInput");

const groupCards = document.querySelectorAll(".groupCard");

if (searchInput) {

    searchInput.addEventListener("input", (e) => {

        const value = e.target.value.toLowerCase();

        groupCards.forEach(card => {

            const text = card.innerText.toLowerCase();

            if (text.includes(value)) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }

        });

    });

}

/* =========================
   CATEGORY FILTER
========================= */

const categories = document.querySelectorAll(".category");

if (categories) {

    categories.forEach(cat => {

        cat.addEventListener("click", () => {

            const value = cat.innerText.toLowerCase();

            groupCards.forEach(card => {

                const text = card.innerText.toLowerCase();

                if (text.includes(value) || value === "todos") {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }

            });

        });

    });

}

/* =========================
   NAVIGATION ACTIVE STATE
========================= */

const navItems = document.querySelectorAll(".navItem");

navItems.forEach(item => {

    item.addEventListener("click", () => {

        navItems.forEach(i => i.classList.remove("active"));

        item.classList.add("active");

    });

});

/* =========================
   FAVORITOS (LOCAL STORAGE)
========================= */

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const joinButtons = document.querySelectorAll(".joinBtn");
const favoriteButtons = document.querySelectorAll(".favoriteBtn");

joinButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        const card = btn.closest(".groupCard");

        const title = card.querySelector("h3").innerText;

        const exists = favorites.includes(title);

        if (!exists) {

            favorites.push(title);
            localStorage.setItem("favorites", JSON.stringify(favorites));

            btn.innerText = "✔ Agregado";

            setTimeout(() => {
                btn.innerText = "Unirse";
            }, 1500);

        } else {

            favorites = favorites.filter(f => f !== title);
            localStorage.setItem("favorites", JSON.stringify(favorites));

            btn.innerText = "Unirse";

        }

    });

});

favoriteButtons.forEach(btn => {

    const card = btn.closest(".groupCard");

    if (!card) return;

    const title = card.querySelector("h3").innerText;

    if (favorites.includes(title)) {
        btn.classList.add("active");
    }

    btn.addEventListener("click", () => {

        if (favorites.includes(title)) {

            favorites = favorites.filter(f => f !== title);
            btn.classList.remove("active");

        } else {

            favorites.push(title);
            btn.classList.add("active");

        }

        localStorage.setItem("favorites", JSON.stringify(favorites));

    });

});

/* =========================
   PUBLICAR GRUPO (FIREBASE)
========================= */

const publishForm = document.getElementById("publishForm");

if (publishForm) {

    publishForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("groupName").value.trim();
        const desc = document.getElementById("groupDescription").value.trim();
        const category = document.getElementById("groupCategory").value;
        const link = document.getElementById("groupLink").value.trim();

        if (!name || !desc || !category || !link) return;

        try {

            await addDoc(collection(db, "groups"), {

                name,
                description: desc,
                category,
                link,
                createdAt: new Date()

            });

            alert("Grupo publicado correctamente.");

            publishForm.reset();

                    document.getElementById("publishModal").style.display = "none";

        } catch (error) {

            console.error(error);

            alert(error.message);

        }

    });

}

async function cargarGrupos() {

    const groupList = document.querySelector(".groupList");

    if (!groupList) return;

    const snapshot = await getDocs(collection(db, "groups"));

    snapshot.forEach((doc) => {

        const grupo = doc.data();

        const card = document.createElement("div");

        card.className = "groupCard";

        card.innerHTML = `
    <div class="groupImage">
        <img src="https://placehold.co/120x120/png" alt="Grupo">
    </div>

    <div class="groupInfo">

        <h3>${grupo.name}</h3>

        <p>${grupo.category}</p>

        <div class="groupActions">

            <button class="favoriteBtn">
                <i class="fa-solid fa-heart"></i>
            </button>

            <a href="${grupo.link}" target="_blank">
                <button class="joinBtn">
                    Unirse
                </button>
            </a>

        </div>

    </div>
`;

        groupList.prepend(card);

    });

}

cargarGrupos();

// ===============================
// PÁGINA DE PERFIL
// ===============================

const profileNavBtn = document.getElementById("profileNavBtn");
const profilePage = document.getElementById("profilePage");
const main = document.querySelector("main");
const bottomNav = document.querySelector(".bottomNav");
const fabButton = document.getElementById("fabButton");

const profileImage = document.getElementById("profileImage");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");

if (profileNavBtn) {

    profileNavBtn.addEventListener("click", () => {

        if (main) main.style.display = "none";
        if (fabButton) fabButton.style.display = "none";
        if (profilePage) profilePage.style.display = "block";

        const user = auth.currentUser;

        if (user) {

            profileImage.src = user.photoURL;
            profileName.textContent = user.displayName;
            profileEmail.textContent = user.email;

        } else {

            profileImage.src = "https://placehold.co/150x150";
            profileName.textContent = "Invitado";
            profileEmail.textContent = "No has iniciado sesión";

        }

    });

}

// ===============================
// CERRAR SESIÓN
// ===============================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            if (profilePage) profilePage.style.display = "none";
            if (main) main.style.display = "block";
            if (fabButton) fabButton.style.display = "flex";
            if (bottomNav) bottomNav.style.display = "flex";

            alert("Sesión cerrada correctamente.");

        } catch (error) {

            alert(error.message);

        }

    });

}

// ===============================
// VOLVER AL INICIO
// ===============================

const homeNavBtn = document.getElementById("homeNavBtn");
const favoritesNavBtn = document.getElementById("favoritesNavBtn");
const favoritesPage = document.getElementById("favoritesPage");

if (homeNavBtn) {

    homeNavBtn.addEventListener("click", () => {

        if (profilePage) profilePage.style.display = "none";
        if (favoritesPage) favoritesPage.style.display = "none";
        if (main) main.style.display = "block";
        if (fabButton) fabButton.style.display = "flex";
        if (bottomNav) bottomNav.style.display = "flex";

    });

}

// ===============================
// ABRIR FAVORITOS
// ===============================

function mostrarFavoritos() {

    const favoritesList = document.getElementById("favoritesList");

    if (!favoritesList) return;

    favoritesList.innerHTML = "";

    if (favorites.length === 0) {

        favoritesList.innerHTML = `
            <p style="text-align:center;color:#888;">
                Aún no tienes grupos favoritos.
            </p>
        `;

        return;

    }

    favorites.forEach(nombre => {

        favoritesList.innerHTML += `
            <div class="groupCard">
                <div class="groupInfo">
                    <h3>${nombre}</h3>
                    <p>❤️ Grupo favorito</p>
                </div>
            </div>
        `;

    });

}

if (favoritesNavBtn) {

    favoritesNavBtn.addEventListener("click", () => {

        mostrarFavoritos();

        if (main) main.style.display = "none";
        if (profilePage) profilePage.style.display = "none";
        if (favoritesPage) favoritesPage.style.display = "block";
        if (fabButton) fabButton.style.display = "none";

    });

}
