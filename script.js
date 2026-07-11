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

let favorites = JSON.parse(
    localStorage.getItem("favorites")
) || [];

const viewsCache = JSON.parse(
    localStorage.getItem("groupViews")
) || {};

// ==========================
// ELEMENTOS DEL DOM
// ==========================

const splash = document.getElementById("splash");

const main = document.querySelector("main");

const fabButton = document.getElementById("fabButton");

const notificationBtn = document.getElementById("notificationBtn");
const profileBtn = document.getElementById("profileBtn");

const publishModal = document.getElementById("publishModal");
const publishForm = document.getElementById("publishForm");

const homeNavBtn = document.getElementById("homeNavBtn");
const exploreNavBtn = document.getElementById("exploreNavBtn");
const favoritesNavBtn = document.getElementById("favoritesNavBtn");
const profileNavBtn = document.getElementById("profileNavBtn");

const featuredBtn = document.getElementById("featuredBtn");
const refreshBtn = document.getElementById("refreshBtn");

const searchInput = document.getElementById("searchInput");

const profilePage = document.getElementById("profilePage");
const favoritesPage = document.getElementById("favoritesPage");
const explorePage = document.getElementById("explorePage");
const groupDetailsPage = document.getElementById("groupDetailsPage");

const favoritesList = document.getElementById("favoritesList");
const exploreGroups = document.getElementById("exploreGroups");

const profileImage = document.getElementById("profileImage");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");

const logoutBtn = document.getElementById("logoutBtn");

const detailImage = document.getElementById("detailImage");
const detailName = document.getElementById("detailName");
const detailCategory = document.getElementById("detailCategory");
const detailDescription = document.getElementById("detailDescription");
const detailViews = document.getElementById("detailViews");
const detailTime = document.getElementById("detailTime");
const detailJoinBtn = document.getElementById("detailJoinBtn");

const backToHomeBtn = document.getElementById("backToHomeBtn");

// ==========================
// FUNCIONES GENERALES
// ==========================

function ocultarPantallas() {

    if (main) main.style.display = "none";

    if (profilePage) profilePage.style.display = "none";

    if (favoritesPage) favoritesPage.style.display = "none";

    if (explorePage) explorePage.style.display = "none";

    if (groupDetailsPage) groupDetailsPage.style.display = "none";

}

function mostrarInicio() {

    ocultarPantallas();

    if (main) {
        main.style.display = "block";
    }

    if (fabButton) {
        fabButton.style.display = "flex";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

function guardarFavoritos() {

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

}

function esFavorito(id) {

    return favorites.some(grupo => grupo.id === id);

}

function tiempoTranscurrido(fecha) {

    if (!fecha) return "Hace un momento";

    if (fecha.seconds) {

        fecha = fecha.seconds * 1000;

    }

    const diferencia = Date.now() - fecha;

    const minutos = Math.floor(diferencia / 60000);

    if (minutos < 1) return "Hace unos segundos";

    if (minutos < 60) {

        return `Hace ${minutos} min`;

    }

    const horas = Math.floor(minutos / 60);

    if (horas < 24) {

        return `Hace ${horas} h`;

    }

    const dias = Math.floor(horas / 24);

    return `Hace ${dias} día${dias > 1 ? "s" : ""}`;

}

// ==========================
// SPLASH SCREEN
// ==========================

window.addEventListener("load", () => {

    setTimeout(() => {

        if (splash) {

            splash.style.opacity = "0";

            setTimeout(() => {

                splash.style.display = "none";

            }, 500);

        }

    }, 1500);

});

// ==========================
// LOGIN GOOGLE
// ==========================

onAuthStateChanged(auth, (user) => {

    if (!profileBtn) return;

    if (user) {

        profileBtn.innerHTML = `
            <img
                src="${user.photoURL}"
                style="
                    width:100%;
                    height:100%;
                    border-radius:50%;
                    object-fit:cover;
                ">
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
// BOTÓN PUBLICAR
// ==========================

if (fabButton) {

    fabButton.onclick = () => {

        publishModal.style.display = "flex";

    };

}

window.addEventListener("click", (e) => {

    if (e.target === publishModal) {

        publishModal.style.display = "none";

    }

});

// ==========================
// BOTONES SUPERIORES
// ==========================

if (notificationBtn) {

    notificationBtn.onclick = () => {

        alert("No tienes notificaciones.");

    };

}

if (refreshBtn) {

    refreshBtn.onclick = () => {

        cargarGrupos();

    };

}

if (featuredBtn) {

    featuredBtn.onclick = () => {

        document.querySelector(".latestGroups")
            ?.scrollIntoView({

                behavior: "smooth"

            });

    };

}

// ==========================
// CREAR TARJETA DEL GRUPO
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

            <small>

                👁️ ${grupo.views || 0} vistas

                <br>

                🕒 ${tiempoTranscurrido(grupo.createdAt)}

            </small>

            <div class="groupActions">

                <button class="favoriteBtn ${esFavorito(grupo.id) ? "active" : ""}">

                    <i class="fa-solid fa-heart"></i>

                </button>

                <button class="joinBtn verGrupoBtn">

                    Ver grupo

                </button>

            </div>

        </div>

    `;

    const favoriteBtn = card.querySelector(".favoriteBtn");

    const verGrupoBtn = card.querySelector(".verGrupoBtn");

    // ==========================
    // FAVORITOS
    // ==========================

    favoriteBtn.onclick = (e) => {

        e.stopPropagation();

        if (esFavorito(grupo.id)) {

            favorites = favorites.filter(f => f.id !== grupo.id);

            favoriteBtn.classList.remove("active");

        } else {

            favorites.push(grupo);

            favoriteBtn.classList.add("active");

        }

        guardarFavoritos();

    };

    // ==========================
    // VER DETALLE
    // ==========================

    verGrupoBtn.onclick = async () => {

        ocultarPantallas();

        groupDetailsPage.style.display = "block";

        if (fabButton) {

            fabButton.style.display = "none";

        }

        detailImage.src = imagen;

        detailName.textContent = grupo.name;

        detailCategory.textContent = "📂 " + grupo.category;

        detailDescription.textContent = grupo.description || "Sin descripción";

        detailTime.textContent = "🕒 " + tiempoTranscurrido(grupo.createdAt);

        // Contar solo una vista por dispositivo

        if (!viewsCache[grupo.id]) {

            try {

                await updateDoc(

                    doc(db, "groups", grupo.id),

                    {

                        views: increment(1)

                    }

                );

                grupo.views = (grupo.views || 0) + 1;

                viewsCache[grupo.id] = true;

                localStorage.setItem(

                    "groupViews",

                    JSON.stringify(viewsCache)

                );

            } catch (error) {

                console.error(error);

            }

        }

        detailViews.textContent = `👁️ ${grupo.views || 0} vistas`;

        detailJoinBtn.onclick = () => {

            window.open(grupo.link, "_blank");

        };

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    };

    return card;

}

// ==========================
// CARGAR GRUPOS
// ==========================

async function cargarGrupos() {

    try {

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

            grupos.push(grupo);

        });

        // Destacados por vistas

        const destacados = [...grupos].sort((a, b) => (b.views || 0) - (a.views || 0));

        // Nuevos por fecha

        const recientes = [...grupos].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        const featuredContainer = document.getElementById("featuredGroups");
        const latestContainer = document.getElementById("latestGroups");

        if (featuredContainer) {

            featuredContainer.innerHTML = "";

            destacados.forEach(grupo => {

                featuredContainer.appendChild(crearCardGrupo(grupo));

            });

        }

        if (latestContainer) {

            latestContainer.innerHTML = "";

            recientes.forEach(grupo => {

                latestContainer.appendChild(crearCardGrupo(grupo));

            });

        }

    } catch (error) {

        console.error(error);

        alert("Error al cargar los grupos.");

    }

}

// ==========================
// CARGA INICIAL
// ==========================

cargarGrupos();

// Actualizar automáticamente cada minuto

setInterval(cargarGrupos, 60000);

// ==========================
// BUSCADOR
// ==========================

if (searchInput) {

    searchInput.addEventListener("input", () => {

        const texto = searchInput.value
            .trim()
            .toLowerCase();

        const featuredContainer = document.getElementById("featuredGroups");
        const latestContainer = document.getElementById("latestGroups");

        if (featuredContainer) featuredContainer.innerHTML = "";
        if (latestContainer) latestContainer.innerHTML = "";

        let resultados = grupos;

        if (texto !== "") {

            resultados = grupos.filter(grupo =>

                grupo.name.toLowerCase().includes(texto) ||

                grupo.category.toLowerCase().includes(texto) ||

                (grupo.description || "")
                    .toLowerCase()
                    .includes(texto)

            );

        }

        const destacados = [...resultados].sort((a,b)=>(b.views||0)-(a.views||0));
        const recientes = [...resultados].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));

        destacados.forEach(grupo=>{

            featuredContainer?.appendChild(
                crearCardGrupo(grupo)
            );

        });

        recientes.forEach(grupo=>{

            latestContainer?.appendChild(
                crearCardGrupo(grupo)
            );

        });

    });

}

// ==========================
// FAVORITOS
// ==========================

function mostrarFavoritos(){

    if(!favoritesList) return;

    favoritesList.innerHTML="";

    if(favorites.length===0){

        favoritesList.innerHTML=`

        <p style="text-align:center;color:#888">

            No tienes grupos favoritos.

        </p>

        `;

        return;

    }

    favorites.forEach(grupo=>{

        favoritesList.appendChild(

            crearCardGrupo(grupo)

        );

    });

}

// ==========================
// EXPLORAR
// ==========================

function mostrarCategorias(){

    if(!exploreGroups) return;

    const categorias=document.querySelectorAll(
        "#explorePage .category"
    );

    categorias.forEach(categoria=>{

        categoria.onclick=()=>{

            exploreGroups.innerHTML="";

            const nombre=categoria.textContent
            .replace(/[^\p{L}\p{N}\s]/gu,"")
            .trim()
            .toLowerCase();

            const encontrados=grupos.filter(grupo=>

                grupo.category.toLowerCase()===nombre

            );

            if(encontrados.length===0){

                exploreGroups.innerHTML=`

                <p style="text-align:center;color:#888">

                No hay grupos en esta categoría.

                </p>

                `;

                return;

            }

            encontrados.forEach(grupo=>{

                exploreGroups.appendChild(

                    crearCardGrupo(grupo)

                );

            });

        };

    });

}

// ==========================
// NAVEGACIÓN
// ==========================

if (homeNavBtn) {

    homeNavBtn.onclick = () => {

        mostrarInicio();

        cargarGrupos();

    };

}

if (favoritesNavBtn) {

    favoritesNavBtn.onclick = () => {

        ocultarPantallas();

        favoritesPage.style.display = "block";

        if (fabButton) {

            fabButton.style.display = "none";

        }

        mostrarFavoritos();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };

}

if (exploreNavBtn) {

    exploreNavBtn.onclick = () => {

        ocultarPantallas();

        explorePage.style.display = "block";

        if (fabButton) {

            fabButton.style.display = "none";

        }

        mostrarCategorias();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };

}

if (profileNavBtn) {

    profileNavBtn.onclick = () => {

        ocultarPantallas();

        profilePage.style.display = "block";

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

if (backToHomeBtn) {

    backToHomeBtn.onclick = () => {

        mostrarInicio();

    };

}

if (logoutBtn) {

    logoutBtn.onclick = async () => {

        try {

            await signOut(auth);

            mostrarInicio();

            profileImage.src = "https://placehold.co/150x150";

            profileName.textContent = "Invitado";

            profileEmail.textContent = "No has iniciado sesión";

            alert("Sesión cerrada correctamente.");

        } catch (error) {

            alert(error.message);

        }

    };

}


