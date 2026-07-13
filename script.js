import { app, db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    increment
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
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

let favoritos = JSON.parse(
    localStorage.getItem("favorites")
) || [];

let vistasLocales = JSON.parse(
    localStorage.getItem("groupViews")
) || {};

// ==========================
// ELEMENTOS DEL DOM
// ==========================

const splash = document.getElementById("splash");

const main = document.querySelector("main");

const featuredGroups = document.getElementById("featuredGroups");
const latestGroups = document.getElementById("latestGroups");
const exploreGroups = document.getElementById("exploreGroups");
const favoritesList = document.getElementById("favoritesList");

const searchInput = document.getElementById("searchInput");

const fabButton = document.getElementById("fabButton");
const publishModal = document.getElementById("publishModal");
const publishForm = document.getElementById("publishForm");

const notificationBtn = document.getElementById("notificationBtn");
const profileBtn = document.getElementById("profileBtn");

const homeNavBtn = document.getElementById("homeNavBtn");
const exploreNavBtn = document.getElementById("exploreNavBtn");
const favoritesNavBtn = document.getElementById("favoritesNavBtn");
const profileNavBtn = document.getElementById("profileNavBtn");

const featuredBtn = document.getElementById("featuredBtn");
const refreshBtn = document.getElementById("refreshBtn");

const profilePage = document.getElementById("profilePage");
const favoritesPage = document.getElementById("favoritesPage");
const explorePage = document.getElementById("explorePage");
const groupDetailsPage = document.getElementById("groupDetailsPage");

const backToHomeBtn = document.getElementById("backToHomeBtn");

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

    document.querySelectorAll(".navItem").forEach(btn => {

        btn.classList.remove("active");

    });

    homeNavBtn?.classList.add("active");

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

function guardarFavoritos() {

    localStorage.setItem(

        "favorites",

        JSON.stringify(favoritos)

    );

}

function esFavorito(id) {

    return favoritos.some(grupo => grupo.id === id);

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
// SPLASH
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

        if (profileImage) {

            profileImage.src = user.photoURL || "https://placehold.co/150x150";

            profileName.textContent = user.displayName || "Usuario";

            profileEmail.textContent = user.email || "";

        }

        if (logoutBtn) {

            logoutBtn.textContent = "Cerrar sesión";

        }

    } else {

        profileBtn.innerHTML = `
            <i class="fa-solid fa-user"></i>
        `;

        if (profileImage) {

            profileImage.src = "https://placehold.co/150x150";

            profileName.textContent = "Invitado";

            profileEmail.textContent = "No has iniciado sesión";

        }

        if (logoutBtn) {

            logoutBtn.textContent = "Iniciar sesión con Google";

        }

    }

});

profileBtn?.addEventListener("click", async () => {

    if (!auth.currentUser) {

        try {

            await signInWithPopup(auth, provider);

        } catch (error) {

            if (error.code !== "auth/cancelled-popup-request") {

                alert(error.message);

            }

        }

        return;

    }

    ocultarPantallas();

    profilePage.style.display = "block";

    if (fabButton) {

        fabButton.style.display = "none";

    }

});

logoutBtn?.addEventListener("click", async () => {

    if (!auth.currentUser) {

        try {

            await signInWithPopup(auth, provider);

        } catch (error) {

            alert(error.message);

        }

        return;

    }

    await signOut(auth);

    mostrarInicio();

});

// ==========================
// BOTONES Y NAVEGACIÓN
// ==========================

fabButton?.addEventListener("click", () => {

    publishModal.style.display = "flex";

});

window.addEventListener("click", (e) => {

    if (e.target === publishModal) {

        publishModal.style.display = "none";

    }

});

notificationBtn?.addEventListener("click", () => {

    alert("No tienes notificaciones.");

});

homeNavBtn?.addEventListener("click", () => {

    mostrarInicio();

});

exploreNavBtn?.addEventListener("click", () => {

    ocultarPantallas();

    explorePage.style.display = "block";

    if (fabButton) {

        fabButton.style.display = "none";

    }

    document.querySelectorAll(".navItem").forEach(btn => {

        btn.classList.remove("active");

    });

    exploreNavBtn.classList.add("active");

});

favoritesNavBtn?.addEventListener("click", () => {

    ocultarPantallas();

    favoritesPage.style.display = "block";

    if (fabButton) {

        fabButton.style.display = "none";

    }

    document.querySelectorAll(".navItem").forEach(btn => {

        btn.classList.remove("active");

    });

    favoritesNavBtn.classList.add("active");

    mostrarFavoritos();

});

profileNavBtn?.addEventListener("click", () => {

    if (!auth.currentUser) {

        signInWithPopup(auth, provider);

        return;

    }

    ocultarPantallas();

    profilePage.style.display = "block";

    if (fabButton) {

        fabButton.style.display = "none";

    }

    document.querySelectorAll(".navItem").forEach(btn => {

        btn.classList.remove("active");

    });

    profileNavBtn.classList.add("active");

});

backToHomeBtn?.addEventListener("click", () => {

    mostrarInicio();

});

// ==========================
// CREAR TARJETA DEL GRUPO
// ==========================

function crearCardGrupo(grupo) {

    alert("Entró a crear tarjeta");

    const card = document.createElement("div");

card.className = "groupCard";

alert("Tarjeta creada: " + grupo.name);

    const imagen = grupo.image || "https://placehold.co/300x300/png?text=NOCTRA";

    card.innerHTML = `
        <div class="groupImage">
            <img src="${imagen}" alt="${grupo.name}">
        </div>

        <div class="groupInfo">

            <h3>${grupo.name}</h3>

            <p>📂 ${grupo.category}</p>

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

    favoriteBtn.onclick = () => {

        if (esFavorito(grupo.id)) {

            favoritos = favoritos.filter(g => g.id !== grupo.id);

            favoriteBtn.classList.remove("active");

        } else {

            favoritos.push(grupo);

            favoriteBtn.classList.add("active");

        }

        guardarFavoritos();

    };

    verGrupoBtn.onclick = async () => {

        ocultarPantallas();

        groupDetailsPage.style.display = "block";

        if (fabButton) {

            fabButton.style.display = "none";

        }

        detailImage.src = imagen;
        detailName.textContent = grupo.name;
        detailCategory.textContent = "📂 " + grupo.category;
        detailDescription.textContent = grupo.description || "";

        // Aumentar vistas una sola vez por dispositivo

        if (!vistasLocales[grupo.id]) {

            try {

                await updateDoc(
                    doc(db, "groups", grupo.id),
                    {
                        views: increment(1)
                    }
                );

                grupo.views = (grupo.views || 0) + 1;

                vistasLocales[grupo.id] = true;

                localStorage.setItem(
                    "groupViews",
                    JSON.stringify(vistasLocales)
                );

            } catch (error) {

                console.error(error);

            }

        }

        detailViews.textContent = `👁️ ${grupo.views || 0} vistas`;

        detailTime.textContent = "🕒 " + tiempoTranscurrido(grupo.createdAt);

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

alert("Grupos encontrados: " + snapshot.size);

        snapshot.forEach((docSnap) => {

            const grupo = {
                id: docSnap.id,
                ...docSnap.data()
            };

            if (grupo.createdAt?.seconds) {
                grupo.createdAt = grupo.createdAt.seconds * 1000;
            }

            grupos.push(grupo);

        });

        const destacados = [...grupos].sort(
            (a, b) => (b.views || 0) - (a.views || 0)
        );

        const recientes = [...grupos].sort(
            (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        );

        featuredGroups.innerHTML = "";
latestGroups.innerHTML = "";

alert("Voy a mostrar grupos");

        destacados.slice(0, 6).forEach(grupo => {

    alert("Creando tarjeta: " + grupo.name);

    featuredGroups.appendChild(
    crearCardGrupo(grupo)
);

alert("Tarjeta agregada a destacados");

});

        recientes.forEach(grupo => {

            latestGroups.appendChild(
                crearCardGrupo(grupo)
            );

        });

    } catch (error) {

        console.error(error);

        alert("Error al cargar los grupos.");

    }

}

// ==========================
// BUSCADOR + CATEGORÍAS
// ==========================

function mostrarGrupos(lista, contenedor) {

    contenedor.innerHTML = "";

    if (lista.length === 0) {

        contenedor.innerHTML = `
            <p style="text-align:center;padding:30px;color:#888;">
                No se encontraron grupos.
            </p>
        `;

        return;

    }

    lista.forEach(grupo => {

        contenedor.appendChild(
            crearCardGrupo(grupo)
        );

    });

}

function abrirCategoria(nombre) {

    ocultarPantallas();

    explorePage.style.display = "block";

    if (fabButton) {

        fabButton.style.display = "none";

    }

    document.querySelectorAll(".navItem").forEach(btn => {

        btn.classList.remove("active");

    });

    exploreNavBtn.classList.add("active");

    const filtrados = grupos.filter(grupo =>

        grupo.category &&
        grupo.category.toLowerCase() === nombre.toLowerCase()

    );

    mostrarGrupos(filtrados, exploreGroups);

}

document.querySelectorAll("#explorePage .category").forEach(categoria => {

    categoria.onclick = () => {

        abrirCategoria(categoria.dataset.category);

    };

});

document.querySelectorAll(".homeCategory").forEach(categoria => {

    categoria.onclick = () => {

        abrirCategoria(categoria.dataset.category);

    };

});

searchInput?.addEventListener("input", () => {

    const texto = searchInput.value.trim().toLowerCase();

    if (texto === "") {

        cargarGrupos();

        return;

    }

    const resultados = grupos.filter(grupo =>

        grupo.name.toLowerCase().includes(texto) ||

        grupo.category.toLowerCase().includes(texto) ||

        (grupo.description || "").toLowerCase().includes(texto)

    );

    latestGroups.innerHTML = "";

    resultados.forEach(grupo => {

        latestGroups.appendChild(
            crearCardGrupo(grupo)
        );

    });

});

// ==========================
// FAVORITOS
// ==========================

function mostrarFavoritos() {

    if (!favoritesList) return;

    favoritesList.innerHTML = "";

    if (favoritos.length === 0) {

        favoritesList.innerHTML = `
            <p style="text-align:center;padding:30px;color:#888;">
                Aún no tienes grupos favoritos.
            </p>
        `;

        return;

    }

    favoritos.forEach(grupo => {

        favoritesList.appendChild(
            crearCardGrupo(grupo)
        );

    });

}

// ==========================
// PUBLICAR GRUPO
// ==========================

publishForm?.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.getElementById("groupName").value.trim();
    const description = document.getElementById("groupDescription").value.trim();
    const category = document.getElementById("groupCategory").value;
    const link = document.getElementById("groupLink").value.trim();

    const imageInput = document.getElementById("groupImage");

    if (!name || !description || !category || !link) {

        alert("Completa todos los campos.");

        return;

    }

    let image = "https://placehold.co/300x300/png?text=NOCTRA";

    if (imageInput.files.length > 0) {

        image = await new Promise((resolve) => {

            const reader = new FileReader();

            reader.onload = (evento) => {

                resolve(evento.target.result);

            };

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

        alert("✅ Grupo publicado correctamente.");

    } catch (error) {

        console.error(error);

        alert("Error al publicar el grupo.");

    }

});

// ==========================
// BOTONES FINALES
// ==========================

refreshBtn?.addEventListener("click", () => {

    cargarGrupos();

});

featuredBtn?.addEventListener("click", () => {

    latestGroups?.scrollIntoView({

        behavior: "smooth"

    });

});

// ==========================
// INICIAR APLICACIÓN
// ==========================

mostrarInicio();

cargarGrupos();

setInterval(() => {

    cargarGrupos();

}, 60000);

                              

