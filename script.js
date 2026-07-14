// ===========================
// SCRIPT.JS - 𓆩⍣⃝ 𝙉𝙊𝘾𝙏𝙍𝘼⍣⃝ 𓆪
// ===========================

import {
    db,
    auth,
    addDoc,
    getDocs,
    getDoc,
    setDoc,
    doc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    increment,
    serverTimestamp,
    loginGoogle,
    logoutUser
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ===========================
// VARIABLES GLOBALES
// ===========================

let usuarioActual = null;

let grupos = [];

let grupoActual = null;


// ===========================
// ELEMENTOS PRINCIPALES
// ===========================

const pages = document.querySelectorAll(".page");

const navButtons = document.querySelectorAll(".navButton");


// ===========================
// CAMBIAR DE PÁGINA
// ===========================

function showPage(id){

    pages.forEach(page=>{
        page.classList.remove("active");
    });

    const pagina = document.getElementById(id);

    if(pagina){
        pagina.classList.add("active");
    }

}


// ===========================
// NAVEGACIÓN INFERIOR
// ===========================

navButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        navButtons.forEach(btn=>{
            btn.classList.remove("active");
        });

        button.classList.add("active");

        showPage(button.dataset.page);

    });

});

// ===========================
// REGISTRAR USUARIO
// ===========================

async function crearUsuario(user){

    const referencia = doc(db,"users",user.uid);

    const documento = await getDoc(referencia);

    if(!documento.exists()){

        await setDoc(referencia,{

            uid:user.uid,

            name:user.displayName || "Usuario",

            email:user.email,

            photo:user.photoURL || "",

            instagram:"",

            tiktok:"",

            bio:"",

            createdAt:serverTimestamp()

        });

    }

}



// ===========================
// SESIÓN
// ===========================

onAuthStateChanged(auth,async(user)=>{

    usuarioActual = user || null;

    const loginButton = document.getElementById("loginButton");
    const logoutButton = document.getElementById("logoutButton");

    if(user){

        await crearUsuario(user);

        if(loginButton) loginButton.style.display="none";

        if(logoutButton) logoutButton.style.display="block";

        await cargarDatosPerfil();

    }else{

        if(loginButton) loginButton.style.display="block";

        if(logoutButton) logoutButton.style.display="none";

    }

});



// ===========================
// BOTÓN LOGIN
// ===========================

const loginButton = document.getElementById("loginButton");

if(loginButton){

    loginButton.addEventListener("click",async()=>{

        await loginGoogle();

    });

}



// ===========================
// BOTÓN LOGOUT
// ===========================

const logoutButton = document.getElementById("logoutButton");

if(logoutButton){

    logoutButton.addEventListener("click",async()=>{

        await logoutUser();

        location.reload();

    });

}

// ===========================
// CARGAR GRUPOS
// ===========================

async function cargarGrupos(){

    try{

        const snapshot = await getDocs(
            collection(db,"groups")
        );

        grupos = [];

        snapshot.forEach((documento)=>{

            grupos.push({
                id: documento.id,
                ...documento.data()
            });

        });

        mostrarGrupos(grupos);

    }catch(error){

        console.error(
            "Error cargando grupos:",
            error
        );

    }

}



// ===========================
// MOSTRAR GRUPOS
// ===========================

function mostrarGrupos(lista){

    const contenedores = [

        "trendingGroups",
        "featuredGroups",
        "latestGroups",
        "exploreGroups"

    ];

    contenedores.forEach(id=>{

        const contenedor =
        document.getElementById(id);

        if(!contenedor) return;

        contenedor.innerHTML="";

        lista.forEach(grupo=>{

            crearTarjetaGrupo(
                grupo,
                contenedor
            );

        });

    });

}



// ===========================
// CREAR TARJETA
// ===========================

function crearTarjetaGrupo(
grupo,
contenedor
){

    const card =
    document.createElement("div");

    card.className="groupCard";

    card.innerHTML=`

        <img src="${
        grupo.image ||
        "https://placehold.co/400x250"
        }">

        <div class="groupContent">

            <h3>${grupo.name}</h3>

            <p>${grupo.description}</p>

            <div class="groupMeta">

                <span>${grupo.category}</span>

                <span>👁 ${grupo.views || 0}</span>

                <span>❤️ ${grupo.favorites || 0}</span>

            </div>

            <div class="groupActions">

                <button class="joinButton">
                    Entrar
                </button>

                <button class="favoriteButton">
                    ❤️
                </button>

            </div>

        </div>

    `;

    card.addEventListener("click",(e)=>{

        if(e.target.tagName==="BUTTON") return;

        abrirGrupo(grupo);

    });

    card.querySelector(".joinButton")
    .addEventListener("click",(e)=>{

        e.stopPropagation();

        window.open(
            grupo.link,
            "_blank"
        );

    });

    contenedor.appendChild(card);

}



// ===========================
// INICIAR APP
// ===========================

window.addEventListener(
"load",
()=>{

    cargarGrupos();

});

// ===========================
// ABRIR GRUPO
// ===========================

function abrirGrupo(grupo){

    grupoActual = grupo;

    document.getElementById("groupName").textContent =
    grupo.name || "Grupo";

    document.getElementById("groupCategory").textContent =
    grupo.category || "Otros";

    document.getElementById("groupDescription").textContent =
    grupo.description || "Sin descripción";

    document.getElementById("groupImage").src =
    grupo.image || "https://placehold.co/600x300";

    document.getElementById("groupViews").textContent =
    `👁 ${grupo.views || 0} vistas`;

    document.getElementById("groupFavorites").textContent =
    `❤️ ${grupo.favorites || 0} favoritos`;

    document.getElementById("creatorName").textContent =
    grupo.creator || "Bennett";

    document.getElementById("creatorInstagram").href =
    grupo.instagram || "#";

    document.getElementById("creatorTikTok").href =
    grupo.tiktok || "#";

    showPage("groupPage");

}



// ===========================
// BOTÓN ENTRAR
// ===========================

const joinGroupButton =
document.getElementById("joinGroupButton");

if(joinGroupButton){

    joinGroupButton.addEventListener("click",()=>{

        if(!grupoActual) return;

        window.open(
            grupoActual.link,
            "_blank"
        );

    });

}

// ===========================
// FAVORITOS
// ===========================

async function agregarFavorito(grupoId){

    if(!usuarioActual){

        alert("Inicia sesión para guardar favoritos.");

        return;

    }

    try{

        const favoritoRef = doc(
            db,
            "users",
            usuarioActual.uid,
            "favorites",
            grupoId
        );

        const favorito = await getDoc(favoritoRef);

        if(favorito.exists()){

            alert("Este grupo ya está en tus favoritos.");

            return;

        }

        await setDoc(favoritoRef,{

            groupId: grupoId,

            createdAt: serverTimestamp()

        });

        await updateDoc(

            doc(db,"groups",grupoId),

            {

                favorites: increment(1)

            }

        );

        await cargarDatosPerfil();

        alert("Grupo agregado a favoritos.");

    }catch(error){

        console.error(error);

    }

}



// ===========================
// BOTÓN FAVORITO EN TARJETAS
// ===========================

document.addEventListener("click",async(e)=>{

    if(!e.target.classList.contains("favoriteButton")) return;

    e.stopPropagation();

    const card = e.target.closest(".groupCard");

    if(!card) return;

    const nombre = card.querySelector("h3").textContent;

    const grupo = grupos.find(g=>g.name===nombre);

    if(!grupo) return;

    await agregarFavorito(grupo.id);

    e.target.textContent="💜";

});

// ===========================
// BOTÓN FAVORITO DEL GRUPO
// ===========================

const favoriteGroupButton =
document.getElementById("favoriteGroupButton");

if(favoriteGroupButton){

    favoriteGroupButton.addEventListener("click",async()=>{

        if(!grupoActual){

            return;

        }

        await agregarFavorito(
            grupoActual.id
        );

        favoriteGroupButton.textContent =
        "💜 Guardado";

    });

}
