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
                image: imagen,
                link: grupo.link,
                views: grupo.views,
                createdAt: grupo.createdAt
            });

            btnFavorito.classList.add("active");

        }

        guardarFavoritos();

        if (favoritesPage.style.display === "block") {
            mostrarFavoritos();
        }

    });

    verGrupoBtn.addEventListener("click", async () => {

        ocultarPantallas();

        groupDetailsPage.style.display = "block";

        detailImage.src = imagen;
        detailName.textContent = grupo.name;
        detailCategory.textContent = "📂 " + grupo.category;
        detailDescription.textContent = grupo.description || "Sin descripción";
        detailTime.textContent = "🕒 " + tiempoTranscurrido(grupo.createdAt);

        try {

            await updateDoc(doc(db, "groups", grupo.id), {
                views: increment(1)
            });

            grupo.views = (grupo.views || 0) + 1;

        } catch (e) {}

        detailViews.textContent = "👁️ " + (grupo.views || 0) + " vistas";

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

    const listas = document.querySelectorAll(".groupList");

    listas.forEach(lista => lista.innerHTML = "");

    grupos = [];

    const snapshot = await getDocs(collection(db, "groups"));

    snapshot.forEach((documento) => {

        let grupo = {
            id: documento.id,
            ...documento.data()
        };

        if (grupo.createdAt?.seconds) {
            grupo.createdAt = grupo.createdAt.seconds * 1000;
        }

        const ahora = Date.now();
        const limite = 48 * 60 * 60 * 1000;

        if (grupo.createdAt && (ahora - grupo.createdAt) > limite) {
            return;
        }

        grupos.push(grupo);

    });

    grupos.sort((a, b) => (b.views || 0) - (a.views || 0));

    const listasGrupos = document.querySelectorAll(".groupList");

    listasGrupos.forEach(lista => {

        grupos.forEach(grupo => {

            lista.appendChild(crearCardGrupo(grupo));

        });

    });

}

cargarGrupos();

setInterval(() => {

    cargarGrupos();

}, 60000);

// =========================
// BUSCADOR Y BOTONES
// =========================

const searchInput = document.getElementById("searchInput");
const featuredBtn = document.getElementById("featuredBtn");
const refreshBtn = document.getElementById("refreshBtn");

if (searchInput) {

    searchInput.addEventListener("input", () => {

        const texto = searchInput.value.trim().toLowerCase();

        const listas = document.querySelectorAll(".groupList");

        listas.forEach(lista => lista.innerHTML = "");

        let resultados = grupos;

        if (texto !== "") {

            resultados = grupos.filter(grupo =>

                grupo.name.toLowerCase().includes(texto) ||

                grupo.category.toLowerCase().includes(texto)

            );

        }

        listas.forEach(lista => {

            resultados.forEach(grupo => {

                lista.appendChild(crearCardGrupo(grupo));

            });

        });

    });

}

if (featuredBtn) {

    featuredBtn.addEventListener("click", () => {

        const lista = document.querySelector(".groupList");

        if (!lista) return;

        lista.scrollIntoView({

            behavior: "smooth"

        });

    });

}

if (refreshBtn) {

    refreshBtn.addEventListener("click", async () => {

        await cargarGrupos();

    });

}

// =========================
// FAVORITOS Y EXPLORAR
// =========================

function mostrarFavoritos() {

    const lista = document.getElementById("favoritesList");

    if (!lista) return;

    lista.innerHTML = "";

    if (favorites.length === 0) {

        lista.innerHTML = `
            <p style="text-align:center;color:#888;">
                No tienes grupos favoritos.
            </p>
        `;

        return;

    }

    favorites.forEach(grupo => {

        lista.appendChild(crearCardGrupo(grupo));

    });

}

const favoritesNavBtn = document.getElementById("favoritesNavBtn");
const exploreNavBtn = document.getElementById("exploreNavBtn");

if (favoritesNavBtn) {

    favoritesNavBtn.onclick = () => {

        if (main) main.style.display = "none";
        if (profilePage) profilePage.style.display = "none";
        if (groupDetailsPage) groupDetailsPage.style.display = "none";
        if (explorePage) explorePage.style.display = "none";

        favoritesPage.style.display = "block";

        if (fabButton) fabButton.style.display = "none";

        mostrarFavoritos();

    };

}

if (exploreNavBtn) {

    exploreNavBtn.onclick = () => {

        if (main) main.style.display = "none";
        if (profilePage) profilePage.style.display = "none";
        if (favoritesPage) favoritesPage.style.display = "none";
        if (groupDetailsPage) groupDetailsPage.style.display = "none";

        explorePage.style.display = "block";

        if (fabButton) fabButton.style.display = "none";

        mostrarCategorias();

    };

}

// =========================
// CATEGORÍAS
// =========================

function mostrarCategorias() {

    const categorias = document.querySelectorAll("#explorePage .category");
    const contenedor = document.getElementById("exploreGroups");

    if (!contenedor) return;

    categorias.forEach(categoria => {

        categoria.onclick = () => {

            contenedor.innerHTML = "";

            const nombre = categoria.textContent
                .replace(/[^\p{L}\p{N}\s]/gu, "")
                .trim()
                .toLowerCase();

            const encontrados = grupos.filter(grupo =>
                grupo.category.toLowerCase() === nombre
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

    // =========================
// PERFIL - INICIO - VOLVER
// =========================

const profileNavBtn = document.getElementById("profileNavBtn");
const homeNavBtn = document.getElementById("homeNavBtn");
const logoutBtn = document.getElementById("logoutBtn");

if (profileNavBtn) {

    profileNavBtn.onclick = () => {

        if (main) main.style.display = "none";
        if (favoritesPage) favoritesPage.style.display = "none";
        if (explorePage) explorePage.style.display = "none";
        if (groupDetailsPage) groupDetailsPage.style.display = "none";

        profilePage.style.display = "block";

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

    };

}

if (homeNavBtn) {

    homeNavBtn.onclick = () => {

        if (groupDetailsPage) groupDetailsPage.style.display = "none";
        if (profilePage) profilePage.style.display = "none";
        if (favoritesPage) favoritesPage.style.display = "none";
        if (explorePage) explorePage.style.display = "none";

        main.style.display = "block";

        if (fabButton) fabButton.style.display = "flex";

        cargarGrupos();

    };

}

if (backToHomeBtn) {

    backToHomeBtn.onclick = () => {

        groupDetailsPage.style.display = "none";

        main.style.display = "block";

        if (fabButton) fabButton.style.display = "flex";

    };

}

if (logoutBtn) {

    logoutBtn.onclick = async () => {

        try {

            await signOut(auth);

            profilePage.style.display = "none";
            main.style.display = "block";

            if (fabButton) fabButton.style.display = "flex";

            profileImage.src = "https://placehold.co/150x150";
            profileName.textContent = "Invitado";
            profileEmail.textContent = "No has iniciado sesión";

            alert("Sesión cerrada.");

        } catch (error) {

            alert(error.message);

        }

    };

}

    // =========================
// PUBLICAR - BOTONES EXTRA
// =========================

const publishForm = document.getElementById("publishForm");
const notificationBtn = document.getElementById("notificationBtn");
const featuredBtn = document.getElementById("featuredBtn");
const refreshBtn = document.getElementById("refreshBtn");

if (publishForm) {

    publishForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("groupName").value.trim();
        const description = document.getElementById("groupDescription").value.trim();
        const category = document.getElementById("groupCategory").value;
        const link = document.getElementById("groupLink").value.trim();

        let image = "https://placehold.co/120x120/png";

        const imageInput = document.getElementById("groupImage");

        if (imageInput.files.length > 0) {

            image = await new Promise(resolve => {

                const reader = new FileReader();

                reader.onload = e => resolve(e.target.result);

                reader.readAsDataURL(imageInput.files[0]);

            });

        }

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

        publishModal.style.display = "none";

        await cargarGrupos();

        alert("Grupo publicado correctamente.");

    });

}

if (featuredBtn) {

    featuredBtn.onclick = () => {

        window.scrollTo({

            top: document.querySelector(".featured").offsetTop,
            behavior: "smooth"

        });

    };

}

if (refreshBtn) {

    refreshBtn.onclick = async () => {

        await cargarGrupos();

        alert("Grupos actualizados.");

    };

}

if (notificationBtn) {

    notificationBtn.onclick = () => {

        alert("Aún no tienes notificaciones.");

    };

}

                                                 }
