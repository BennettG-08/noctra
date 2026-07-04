import { app, db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs
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

// =========================
// VARIABLES GLOBALES
// =========================

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const main = document.querySelector("main");
const fabButton = document.getElementById("fabButton");
const profilePage = document.getElementById("profilePage");
const favoritesPage = document.getElementById("favoritesPage");

// =========================
// GUARDAR FAVORITOS
// =========================

function guardarFavoritos() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// =========================
// VERIFICAR SI ES FAVORITO
// =========================

function esFavorito(nombre) {
    return favorites.some(f => f.name === nombre);
}

// =========================
// LOGIN GOOGLE
// =========================

onAuthStateChanged(auth, (user) => {

    const profileBtn = document.getElementById("profileBtn");

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

const profileBtn = document.getElementById("profileBtn");

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

// =========================
// CREAR TARJETA DE GRUPO
// =========================

function crearCardGrupo(grupo) {

    const card = document.createElement("div");
    card.className = "groupCard";

    card.innerHTML = `
        <div class="groupImage">
            <img src="${grupo.image || "https://placehold.co/120x120/png"}" alt="${grupo.name}">
        </div>

        <div class="groupInfo">

            <h3>${grupo.name}</h3>

            <p>${grupo.category}</p>

            <div class="groupActions">

                <button class="favoriteBtn ${esFavorito(grupo.name) ? "active" : ""}">
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

    const btnFavorito = card.querySelector(".favoriteBtn");

    btnFavorito.addEventListener("click", () => {

        if (esFavorito(grupo.name)) {

            favorites = favorites.filter(f => f.name !== grupo.name);
            btnFavorito.classList.remove("active");

        } else {

            favorites.push({
                name: grupo.name,
                category: grupo.category,
                link: grupo.link,
                image: grupo.image || "https://placehold.co/120x120/png"
            });

            btnFavorito.classList.add("active");

        }

        guardarFavoritos();

    });

    return card;

}

// =========================
// CARGAR GRUPOS FIREBASE
// =========================

async function cargarGrupos() {

    const groupLists = document.querySelectorAll(".groupList");

    if (groupLists.length === 0) return;

    const lista = groupLists[groupLists.length - 1];

    lista.innerHTML = "";

    const snapshot = await getDocs(collection(db, "groups"));

    snapshot.forEach((documento) => {

        const grupo = documento.data();

        lista.prepend(crearCardGrupo(grupo));

    });

}

cargarGrupos();

// =========================
// MOSTRAR FAVORITOS
// =========================

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

    favorites.forEach(grupo => {

        const card = document.createElement("div");

        card.className = "groupCard";

        card.innerHTML = `
            <div class="groupImage">
                <img src="${grupo.image}" alt="${grupo.name}">
            </div>

            <div class="groupInfo">

                <h3>${grupo.name}</h3>

                <p>${grupo.category}</p>

                <div class="groupActions">

                    <button class="favoriteBtn active">
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

        const btn = card.querySelector(".favoriteBtn");

        btn.addEventListener("click", () => {

            favorites = favorites.filter(f => f.name !== grupo.name);

            guardarFavoritos();

            mostrarFavoritos();

            document.querySelectorAll(".groupCard").forEach(c => {

                const titulo = c.querySelector("h3");

                if (!titulo) return;

                if (titulo.textContent === grupo.name) {

                    c.querySelector(".favoriteBtn")?.classList.remove("active");

                }

            });

        });

        favoritesList.appendChild(card);

    });

}

// =========================
// ABRIR PÁGINA FAVORITOS
// =========================

const favoritesNavBtn = document.getElementById("favoritesNavBtn");

if (favoritesNavBtn) {

    favoritesNavBtn.addEventListener("click", () => {

        mostrarFavoritos();

        if (main) main.style.display = "none";

        if (profilePage) profilePage.style.display = "none";

        if (favoritesPage) favoritesPage.style.display = "block";

        if (fabButton) fabButton.style.display = "none";

    });

}

// =========================
// PERFIL
// =========================

const profileNavBtn = document.getElementById("profileNavBtn");
const homeNavBtn = document.getElementById("homeNavBtn");
const logoutBtn = document.getElementById("logoutBtn");

const profileImage = document.getElementById("profileImage");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");

if (profileNavBtn) {

    profileNavBtn.addEventListener("click", () => {

        if (main) main.style.display = "none";
        if (favoritesPage) favoritesPage.style.display = "none";
        if (profilePage) profilePage.style.display = "block";
        if (fabButton) fabButton.style.display = "none";

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

// =========================
// VOLVER AL INICIO
// =========================

if (homeNavBtn) {

    homeNavBtn.addEventListener("click", () => {

        if (main) main.style.display = "block";
        if (profilePage) profilePage.style.display = "none";
        if (favoritesPage) favoritesPage.style.display = "none";
        if (fabButton) fabButton.style.display = "flex";

    });

}

// =========================
// CERRAR SESIÓN
// =========================

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            if (main) main.style.display = "block";
            if (profilePage) profilePage.style.display = "none";
            if (favoritesPage) favoritesPage.style.display = "none";
            if (fabButton) fabButton.style.display = "flex";

            profileImage.src = "https://placehold.co/150x150";
            profileName.textContent = "Invitado";
            profileEmail.textContent = "No has iniciado sesión";

            alert("Sesión cerrada.");

        } catch (error) {

            alert(error.message);

        }

    });

}
