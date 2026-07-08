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


const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// =========================
// VARIABLES GLOBALES
// =========================

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let grupos = [];

const splash = document.getElementById("splash");
const main = document.querySelector("main");
const fabButton = document.getElementById("fabButton");

const profileBtn = document.getElementById("profileBtn");
const profilePage = document.getElementById("profilePage");
const favoritesPage = document.getElementById("favoritesPage");
const explorePage = document.getElementById("explorePage");

const profileImage = document.getElementById("profileImage");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail"); 

const groupDetailsPage = document.getElementById("groupDetailsPage");

const detailImage = document.getElementById("detailImage");
const detailName = document.getElementById("detailName");
const detailCategory = document.getElementById("detailCategory");
const detailDescription = document.getElementById("detailDescription");
const detailViews = document.getElementById("detailViews");
const detailTime = document.getElementById("detailTime");
const detailJoinBtn = document.getElementById("detailJoinBtn");
const backToHomeBtn = document.getElementById("backToHomeBtn");

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

function tiempoTranscurrido(fecha) {

    if (!fecha) return "Hace un momento";

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

            <small style="color:#888;">
                👁️ ${grupo.views || 0} vistas
                <br>
                🕒 ${tiempoTranscurrido(grupo.createdAt)}
            </small>

            <div class="groupActions">

                <button class="favoriteBtn ${esFavorito(grupo.name) ? "active" : ""}">
                    <i class="fa-solid fa-heart"></i>
                </button>

                <button class="joinBtn verGrupoBtn">
                    Ver grupo
                </button>

            </div>

        </div>
    `;

    const btnFavorito = card.querySelector(".favoriteBtn");
    const verGrupoBtn = card.querySelector(".verGrupoBtn");

    btnFavorito.addEventListener("click", (e) => {

        e.stopPropagation();

        if (esFavorito(grupo.name)) {

            favorites = favorites.filter(f => f.name !== grupo.name);
            btnFavorito.classList.remove("active");

        } else {

            favorites.push({
                name: grupo.name,
                category: grupo.category,
                description: grupo.description,
                link: grupo.link,
                image: imagen,
                views: grupo.views,
                createdAt: grupo.createdAt
            });

            btnFavorito.classList.add("active");

        }

        guardarFavoritos();

        if (favoritesPage && favoritesPage.style.display === "block") {
            mostrarFavoritos();
        }

    });

    verGrupoBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        if (main) main.style.display = "none";
        if (favoritesPage) favoritesPage.style.display = "none";
        if (explorePage) explorePage.style.display = "none";
        if (profilePage) profilePage.style.display = "none";
        if (groupDetailsPage) groupDetailsPage.style.display = "block";

        detailImage.src = imagen;
        detailName.textContent = grupo.name;
        detailCategory.textContent = "📂 " + grupo.category;
        detailDescription.textContent = grupo.description || "Sin descripción.";
        detailViews.textContent = "👁️ " + (grupo.views || 0) + " vistas";
        detailTime.textContent = "🕒 " + tiempoTranscurrido(grupo.createdAt);

        detailJoinBtn.onclick = () => {
            window.open(grupo.link, "_blank");
        };

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

    grupos = [];

    const snapshot = await getDocs(collection(db, "groups"));

    snapshot.forEach((documento) => {

        let grupo = {
            id: documento.id,
            ...documento.data()
        };

        // Compatibilidad con Timestamp de Firebase y Date.now()
        if (grupo.createdAt?.seconds) {
            grupo.createdAt = grupo.createdAt.seconds * 1000;
        }

        const ahora = Date.now();
        const cuarentaYOchoHoras = 48 * 60 * 60 * 1000;

        if (grupo.createdAt && (ahora - grupo.createdAt) > cuarentaYOchoHoras) {
            return;
        }

        grupos.push(grupo);

    });

    grupos.sort((a, b) => (b.views || 0) - (a.views || 0));

    grupos.forEach((grupo) => {

        lista.appendChild(crearCardGrupo(grupo));

    });

}

cargarGrupos();

// Actualizar los tiempos cada minuto
setInterval(() => {
    cargarGrupos();
}, 60000);

// =========================
// BUSCADOR
// =========================

const searchInput = document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("input", () => {

        const texto = searchInput.value.toLowerCase().trim();

        const lista = document.querySelector(".groupList");

        lista.innerHTML = "";

        // Si no hay texto, mostrar todos los grupos
        if (texto === "") {

            grupos.forEach(grupo => {

                lista.prepend(crearCardGrupo(grupo));

            });

            return;

        }

        const resultados = grupos.filter(grupo =>
            grupo.name.toLowerCase().includes(texto) ||
            grupo.category.toLowerCase().includes(texto)
        );

        if (resultados.length === 0) {

            lista.innerHTML = `
                <p style="text-align:center;color:#888;padding:20px;">
                    No se encontraron grupos.
                </p>
            `;

            return;

        }

        resultados.forEach(grupo => {

            lista.prepend(crearCardGrupo(grupo));

        });

    });

}

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
// FAVORITOS Y EXPLORAR
// =========================

const favoritesNavBtn = document.getElementById("favoritesNavBtn");
const exploreNavBtn = document.getElementById("exploreNavBtn");

if (favoritesNavBtn) {

    favoritesNavBtn.addEventListener("click", () => {

        mostrarFavoritos();

        if (main) main.style.display = "none";
        if (profilePage) profilePage.style.display = "none";
        if (explorePage) explorePage.style.display = "none";
        if (favoritesPage) favoritesPage.style.display = "block";
        if (fabButton) fabButton.style.display = "none";

    });

}

if (exploreNavBtn) {

    exploreNavBtn.addEventListener("click", () => {

        if (main) main.style.display = "none";
        if (profilePage) profilePage.style.display = "none";
        if (favoritesPage) favoritesPage.style.display = "none";
        if (explorePage) explorePage.style.display = "block";
        if (fabButton) fabButton.style.display = "none";

        mostrarCategorias();

    });

}

// =========================
// EXPLORAR POR CATEGORÍA
// =========================

function mostrarCategorias() {

    const categorias = document.querySelectorAll("#explorePage .category");
    const contenedor = document.getElementById("exploreGroups");

    contenedor.innerHTML = "";

    categorias.forEach(categoria => {

        categoria.onclick = () => {

            contenedor.innerHTML = "";

            const nombreCategoria = categoria.textContent
                .replace(/[^\p{L}\p{N}\s]/gu, "")
                .trim()
                .toLowerCase();

            const encontrados = grupos.filter(grupo =>
                grupo.category.toLowerCase() === nombreCategoria
            );

            if (encontrados.length === 0) {

                contenedor.innerHTML = `
                    <p style="text-align:center;color:#888;">
                        No hay grupos en esta categoría.
                    </p>
                `;

                return;

            }

            encontrados.forEach(grupo => {

                contenedor.appendChild(crearCardGrupo(grupo));

            });

        };

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

        // Ocultar todas las pantallas
        if (main) main.style.display = "none";
        if (favoritesPage) favoritesPage.style.display = "none";
        if (explorePage) explorePage.style.display = "none";
        if (groupDetailsPage) groupDetailsPage.style.display = "none";

        // Mostrar perfil
        if (profilePage) profilePage.style.display = "block";

        // Ocultar botón +
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
// VOLVER DESDE DETALLE
// =========================

if (backToHomeBtn) {

    backToHomeBtn.addEventListener("click", () => {

        if (groupDetailsPage) groupDetailsPage.style.display = "none";

        if (profilePage) profilePage.style.display = "none";
        if (favoritesPage) favoritesPage.style.display = "none";
        if (explorePage) explorePage.style.display = "none";

        if (main) main.style.display = "block";

        if (fabButton) fabButton.style.display = "flex";

    });

}

// =========================
// INICIO
// =========================

if (homeNavBtn) {

    homeNavBtn.addEventListener("click", () => {

        if (groupDetailsPage) groupDetailsPage.style.display = "none";
        if (main) main.style.display = "block";
        if (profilePage) profilePage.style.display = "none";
        if (favoritesPage) favoritesPage.style.display = "none";
        if (explorePage) explorePage.style.display = "none";
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
    views: 0,
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
