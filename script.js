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

const splash = document.getElementById("splash");
const main = document.querySelector("main");
const fabButton = document.getElementById("fabButton");

const profileBtn = document.getElementById("profileBtn");
const profilePage = document.getElementById("profilePage");
const favoritesPage = document.getElementById("favoritesPage");

const profileImage = document.getElementById("profileImage");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");

// =========================
// ABRIR MODAL PUBLICAR
// =========================

const publishModal = document.getElementById("publishModal");

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
// FUNCIONES
// =========================

function guardarFavoritos() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function esFavorito(nombre) {
    return favorites.some(f => f.name === nombre);
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

// =========================
// CREAR TARJETA DE GRUPO
// =========================

function crearCardGrupo(grupo) {

    const card = document.createElement("div");
    card.className = "groupCard";

    const imagen = grupo.image || "https://placehold.co/120x120/png";

    card.innerHTML = `
        <div class="groupImage">
            <img src="${imagen}" alt="${grupo.name}">
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
            image: imagen
        });

        btnFavorito.classList.add("active");

    }

    guardarFavoritos();

    // Si la página de favoritos está abierta, la actualiza
    if (favoritesPage && favoritesPage.style.display === "block") {
        mostrarFavoritos();
    }

});

    return card;

}

// =========================
// CARGAR GRUPOS
// =========================

async function cargarGrupos() {

    const lista = document.querySelector(".groupList");

    if (!lista) return;

    lista.innerHTML = "";

    const snapshot = await getDocs(collection(db, "groups"));

    snapshot.forEach((doc) => {

        lista.prepend(crearCardGrupo(doc.data()));

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

        const card = crearCardGrupo(grupo);

        const btn = card.querySelector(".favoriteBtn");

        btn.classList.add("active");

        btn.onclick = () => {

            favorites = favorites.filter(f => f.name !== grupo.name);

            guardarFavoritos();

            mostrarFavoritos();

            document.querySelectorAll(".groupCard").forEach(c => {

                const titulo = c.querySelector("h3");

                if (titulo && titulo.textContent === grupo.name) {

                    c.querySelector(".favoriteBtn")?.classList.remove("active");

                }

            });

        };

        favoritesList.appendChild(card);

    });

}

// =========================
// ABRIR FAVORITOS
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
// INICIO
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

            alert("Sesión cerrada correctamente.");

        } catch (error) {

            alert(error.message);

        }

    });

}

// =========================
// PUBLICAR GRUPO
// =========================

const publishForm = document.getElementById("publishForm");

if (publishForm) {

    publishForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("groupName").value.trim();
        const description = document.getElementById("groupDescription").value.trim();
        const category = document.getElementById("groupCategory").value;
        const link = document.getElementById("groupLink").value.trim();

        const imageInput = document.getElementById("groupImage");

        let image = "https://placehold.co/120x120/png";

        if (imageInput.files.length > 0) {

            const file = imageInput.files[0];

            image = await new Promise((resolve) => {

                const reader = new FileReader();

                reader.onload = e => resolve(e.target.result);

                reader.readAsDataURL(file);

            });

        }

        if (!name || !description || !category || !link) return;

        try {

    await addDoc(collection(db, "groups"), {

    name,
    description,
    category,
    link,
    image,
    createdAt: Date.now()

});

    publishForm.reset();

    document.getElementById("publishModal").style.display = "none";

    await cargarGrupos();

    alert("Grupo publicado correctamente.");

} catch (error) {

    console.error(error);

    alert(error.message);

}

});

}
