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

// ==========================
// FIREBASE
// ==========================

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ==========================
// VARIABLES
// ==========================

let grupos = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// ==========================
// ELEMENTOS DEL DOM
// ==========================

const splash = document.getElementById("splash");
const main = document.querySelector("main");

const fabButton = document.getElementById("fabButton");

const profileBtn = document.getElementById("profileBtn");
const notificationBtn = document.getElementById("notificationBtn");

const publishModal = document.getElementById("publishModal");
const publishForm = document.getElementById("publishForm");

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

const searchInput = document.getElementById("searchInput");

const homeNavBtn = document.getElementById("homeNavBtn");
const exploreNavBtn = document.getElementById("exploreNavBtn");
const favoritesNavBtn = document.getElementById("favoritesNavBtn");
const profileNavBtn = document.getElementById("profileNavBtn");

const logoutBtn = document.getElementById("logoutBtn");
const backToHomeBtn = document.getElementById("backToHomeBtn");

const featuredBtn = document.getElementById("featuredBtn");
const refreshBtn = document.getElementById("refreshBtn");

// ==========================
// FUNCIONES GENERALES
// ==========================

function guardarFavoritos() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function esFavorito(nombre) {
    return favorites.some(f => f.name === nombre);
}

function tiempoTranscurrido(fecha) {

    if (!fecha) return "Hace un momento";

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

// ==========================
// SPLASH
// ==========================

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

// ==========================
// MODAL PUBLICAR
// ==========================

if (fabButton && publishModal) {

    fabButton.onclick = () => {

        publishModal.style.display = "flex";

    };

    window.addEventListener("click", (e) => {

        if (e.target === publishModal) {

            publishModal.style.display = "none";

        }

    });

}

// ==========================
// LOGIN GOOGLE
// ==========================

onAuthStateChanged(auth, (user) => {

    if (!profileBtn) return;

    if (user) {

        profileBtn.innerHTML = `
            <img
                src="${user.photoURL}"
                style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
        `;

    } else {

        profileBtn.innerHTML = `
            <i class="fa-solid fa-user"></i>
        `;

    }

});

if (profileBtn) {

    profileBtn.onclick = async () => {

        try {

            await signInWithPopup(auth, provider);

        } catch (error) {

            if (error.code !== "auth/cancelled-popup-request") {

                alert(error.message);

            }

        }

    };

}

// ==========================
// NOTIFICACIONES
// ==========================

if (notificationBtn) {

    notificationBtn.onclick = () => {

        alert("Aún no tienes notificaciones.");

    };

}

// ==========================
// CREAR TARJETA DE GRUPO
// ==========================

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
    const btnVer = card.querySelector(".verGrupoBtn");

    btnFavorito.onclick = (e) => {

        e.stopPropagation();

        if (esFavorito(grupo.name)) {

            favorites = favorites.filter(f => f.name !== grupo.name);
            btnFavorito.classList.remove("active");

        } else {

            favorites.push({
                ...grupo
            });

            btnFavorito.classList.add("active");

        }

        guardarFavoritos();

    };

    btnVer.onclick = async () => {

        ocultarPantallas();

        groupDetailsPage.style.display = "block";

        if (fabButton) fabButton.style.display = "none";

        detailImage.src = imagen;
        detailName.textContent = grupo.name;
        detailCategory.textContent = "📂 " + grupo.category;
        detailDescription.textContent = grupo.description || "Sin descripción";
        detailTime.textContent = "🕒 " + tiempoTranscurrido(grupo.createdAt);

                try {

            const vistasGuardadas = JSON.parse(localStorage.getItem("groupViews")) || {};

            if (!vistasGuardadas[grupo.id]) {

                await updateDoc(doc(db, "groups", grupo.id), {
                    views: increment(1)
                });

                vistasGuardadas[grupo.id] = true;

                localStorage.setItem("groupViews", JSON.stringify(vistasGuardadas));

                grupo.views = (grupo.views || 0) + 1;

            }

        } catch (error) {

            console.error(error);

        }

        detailViews.textContent = "👁️ " + (grupo.views || 0) + " vistas";

        detailJoinBtn.onclick = () => {

            window.open(grupo.link, "_blank");

        };

    };

    return card;

}

// ==========================
// CARGAR GRUPOS
// ==========================

async function cargarGrupos() {

    grupos = [];

    const snapshot = await getDocs(collection(db, "groups"));

    snapshot.forEach((documento) => {

        const grupo = {
            id: documento.id,
            ...documento.data()
        };

        if (grupo.createdAt?.seconds) {
            grupo.createdAt = grupo.createdAt.seconds * 1000;
        }

        const limite = 48 * 60 * 60 * 1000;

        if (grupo.createdAt && (Date.now() - grupo.createdAt) > limite) {
            return;
        }

        grupos.push(grupo);

    });

    const destacada = document.querySelector(".featured .groupList");
    const nuevos = document.querySelector(".latestGroups .groupList");

    if (destacada) destacada.innerHTML = "";
    if (nuevos) nuevos.innerHTML = "";

    const destacados = [...grupos].sort((a, b) => (b.views || 0) - (a.views || 0));
    const recientes = [...grupos].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    destacados.slice(0, 10).forEach(grupo => {
        destacada?.appendChild(crearCardGrupo(grupo));
    });

    recientes.slice(0, 10).forEach(grupo => {
        nuevos?.appendChild(crearCardGrupo(grupo));
    });

}

cargarGrupos();

setInterval(() => {

    cargarGrupos();

}, 60000);

// ==========================
// BUSCADOR
// ==========================

if (searchInput) {

    searchInput.addEventListener("input", () => {

        const texto = searchInput.value.trim().toLowerCase();

        const destacada = document.querySelector(".featured .groupList");
        const nuevos = document.querySelector(".latestGroups .groupList");

        if (destacada) destacada.innerHTML = "";
        if (nuevos) nuevos.innerHTML = "";

        let resultados = grupos;

        if (texto !== "") {

            resultados = grupos.filter(grupo =>

                grupo.name.toLowerCase().includes(texto) ||
                grupo.category.toLowerCase().includes(texto)

            );

        }

        const destacados = [...resultados].sort((a, b) => (b.views || 0) - (a.views || 0));
        const recientes = [...resultados].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        destacados.slice(0, 10).forEach(grupo => {
            destacada?.appendChild(crearCardGrupo(grupo));
        });

        recientes.slice(0, 10).forEach(grupo => {
            nuevos?.appendChild(crearCardGrupo(grupo));
        });

    });

}

// ==========================
// BOTÓN "VER TODOS"
// ==========================

if (featuredBtn) {

    featuredBtn.onclick = () => {

        document.querySelector(".latestGroups")?.scrollIntoView({
            behavior: "smooth"
        });

    };

}

// ==========================
// BOTÓN ACTUALIZAR
// ==========================

if (refreshBtn) {

    refreshBtn.onclick = async () => {

        await cargarGrupos();

        alert("Grupos actualizados.");

    };

}

// ==========================
// FAVORITOS
// ==========================

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

if (favoritesNavBtn) {

    favoritesNavBtn.onclick = () => {

        ocultarPantallas();

        favoritesPage.style.display = "block";

        if (fabButton) {

            fabButton.style.display = "none";

        }

        mostrarFavoritos();

    };

}

// ==========================
// EXPLORAR
// ==========================

if (exploreNavBtn) {

    exploreNavBtn.onclick = () => {

        ocultarPantallas();

        explorePage.style.display = "block";

        if (fabButton) {

            fabButton.style.display = "none";

        }

        mostrarCategorias();

    };

}

function mostrarCategorias() {

    const categorias = document.querySelectorAll("#explorePage .category");
    const contenedor = document.getElementById("exploreGroups");

    if (!contenedor) return;

    contenedor.innerHTML = "";

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

}

// ==========================
// PERFIL - INICIO - VOLVER
// ==========================

if (profileNavBtn) {

    profileNavBtn.onclick = () => {

        ocultarPantallas();

        if (profilePage) {
            profilePage.style.display = "block";
        }

        if (fabButton) {
            fabButton.style.display = "none";
        }

        const user = auth.currentUser;

        if (user) {

            profileImage.src = user.photoURL || "https://placehold.co/150x150";
            profileName.textContent = user.displayName || "Usuario";
            profileEmail.textContent = user.email || "";

        } else {

            profileImage.src = "https://placehold.co/150x150";
            profileName.textContent = "Invitado";
            profileEmail.textContent = "No has iniciado sesión";

        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };

}

if (homeNavBtn) {

    homeNavBtn.onclick = () => {

        ocultarPantallas();

        if (main) {
            main.style.display = "block";
        }

        if (fabButton) {
            fabButton.style.display = "flex";
        }

        cargarGrupos();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };

}

if (backToHomeBtn) {

    backToHomeBtn.onclick = () => {

        ocultarPantallas();

        if (main) {
            main.style.display = "block";
        }

        if (fabButton) {
            fabButton.style.display = "flex";
        }

        cargarGrupos();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };

}

if (logoutBtn) {

    logoutBtn.onclick = async () => {

        try {

            await signOut(auth);

            ocultarPantallas();

            if (main) {
                main.style.display = "block";
            }

            if (fabButton) {
                fabButton.style.display = "flex";
            }

            profileImage.src = "https://placehold.co/150x150";
            profileName.textContent = "Invitado";
            profileEmail.textContent = "No has iniciado sesión";

            cargarGrupos();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            alert("Sesión cerrada correctamente.");

        } catch (error) {

            alert(error.message);

        }

    };

}

// ==========================
// PUBLICAR GRUPO
// ==========================

if (publishForm) {

    publishForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("groupName").value.trim();
        const description = document.getElementById("groupDescription").value.trim();
        const category = document.getElementById("groupCategory").value;
        const link = document.getElementById("groupLink").value.trim();

        if (!name || !description || !category || !link) {
            alert("Completa todos los campos.");
            return;
        }

        let image = "https://placehold.co/120x120/png";

        const imageInput = document.getElementById("groupImage");

        if (imageInput && imageInput.files.length > 0) {

            image = await new Promise((resolve) => {

                const reader = new FileReader();

                reader.onload = (e) => resolve(e.target.result);

                reader.readAsDataURL(imageInput.files[0]);

            });

        }

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

            publishModal.style.display = "none";

            await cargarGrupos();

            alert("Grupo publicado correctamente.");

        } catch (error) {

            console.error(error);

            alert(error.message);

        }

    });

}

// ==========================
// NOTIFICACIONES
// ==========================

if (notificationBtn) {

    notificationBtn.onclick = () => {

        alert("Aún no tienes notificaciones.");

    };

}
