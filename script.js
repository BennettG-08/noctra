// ===========================
// SCRIPT.JS - 𓆩⍣⃝ 𝙉𝙊𝘾𝙏𝙍𝘼⍣⃝ 𓆪
// PARTE 1
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

    query,
    where,
    orderBy,
    limit,

    serverTimestamp,
    increment,

    loginGoogle,
    logoutUser

} from "./firebase.js";

import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

    collection

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ===========================
// VARIABLES GLOBALES
// ===========================

let usuarioActual = null;

let grupos = [];

let grupoActual = null;

let favoritos = [];

let comentarios = [];

let notificaciones = [];


// ===========================
// ELEMENTOS
// ===========================

const pages = document.querySelectorAll(".page");

const navButtons = document.querySelectorAll(".navButton");

const splashScreen = document.getElementById("splashScreen");

const app = document.getElementById("app");


// ===========================
// MOSTRAR PÁGINAS
// ===========================

function showPage(pageId){

    pages.forEach(page=>{

        page.classList.remove("active");

    });

    const page = document.getElementById(pageId);

    if(page){

        page.classList.add("active");

    }

}


// ===========================
// NAVEGACIÓN INFERIOR
// ===========================

navButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        const page = button.dataset.page;

        showPage(page);

        navButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        button.classList.add("active");

    });

});


// ===========================
// SPLASH SCREEN
// ===========================

function ocultarSplash(){

    if(!splashScreen) return;

    setTimeout(()=>{

        splashScreen.style.opacity="0";

        splashScreen.style.pointerEvents="none";

        setTimeout(()=>{

            splashScreen.style.display="none";

        },500);

    },1200);

}


// ===========================
// BOTONES VOLVER
// ===========================

const backButtons = {

    backGroupButton:"homePage",

    backExploreButton:"homePage",

    backProfileButton:"homePage",

    backNotificationsButton:"homePage",

    backCommentsButton:"groupPage",

    backPublishButton:"homePage",

    backAdminButton:"homePage"

};

Object.entries(backButtons).forEach(([id,page])=>{

    const button=document.getElementById(id);

    if(button){

        button.addEventListener("click",()=>{

            showPage(page);

        });

    }

});


// ===========================
// INICIALIZAR APP
// ===========================

function iniciarAplicacion(){

    ocultarSplash();

    showPage("homePage");

    console.log("NOCTRA iniciada correctamente");

}

// ===========================
// AUTENTICACIÓN
// ===========================

async function crearUsuario(user){

    const referencia = doc(db,"users",user.uid);

    const documento = await getDoc(referencia);

    if(documento.exists()) return;

    await setDoc(referencia,{

        uid:user.uid,

        name:user.displayName || "Usuario",

        email:user.email || "",

        photo:user.photoURL || "",

        instagram:"",

        tiktok:"",

        bio:"",

        createdAt:serverTimestamp()

    });

}


// ===========================
// ESTADO DE SESIÓN
// ===========================

onAuthStateChanged(auth,async(user)=>{

    usuarioActual = user || null;

    const loginButton = document.getElementById("loginButton");
    const logoutButton = document.getElementById("logoutButton");

    if(user){

        await crearUsuario(user);

        if(loginButton) loginButton.style.display="none";
        if(logoutButton) logoutButton.style.display="block";

        console.log("Sesión iniciada:",user.email);

        if(typeof cargarDatosPerfil==="function"){
            cargarDatosPerfil();
        }

    }else{

        if(loginButton) loginButton.style.display="block";
        if(logoutButton) logoutButton.style.display="none";

        console.log("Usuario sin iniciar sesión");

    }

    iniciarAplicacion();

});


// ===========================
// LOGIN
// ===========================

const loginButton = document.getElementById("loginButton");

if(loginButton){

    loginButton.addEventListener("click",async()=>{

        await loginGoogle();

    });

}


// ===========================
// CERRAR SESIÓN
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

        snapshot.forEach((item)=>{

            grupos.push({

                id:item.id,

                ...item.data()

            });

        });

        console.log("Grupos encontrados:",grupos.length);

        mostrarGrupos(grupos);

        cargarDestacados();

        cargarNuevos();

        cargarTendencias();

    }catch(error){

        console.error("Error cargando grupos:",error);

    }

}


// ===========================
// MOSTRAR GRUPOS
// ===========================

function mostrarGrupos(lista){

    const contenedores=[

        "exploreGroups",
        "featuredGroups",
        "latestGroups",
        "trendingGroups"

    ];

    contenedores.forEach(id=>{

        const contenedor=document.getElementById(id);

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

    const card=document.createElement("div");

    card.className="groupCard";

    card.innerHTML=`

        <img src="${grupo.image || "https://placehold.co/600x400"}">

        <div class="groupContent">

            <h3>${grupo.name || "Grupo"}</h3>

            <p>${grupo.description || ""}</p>

            <div class="groupMeta">

                <span>${grupo.category || "Otros"}</span>

                <span>👁 ${grupo.views || 0}</span>

            </div>

            <div class="groupActions">

                <button class="joinButton">

                    Entrar

                </button>

                <button class="favoriteButton">

                    ❤️

                </button>

                <button class="reportButton">

                    🚩

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

    card.querySelector(".favoriteButton")
    .addEventListener("click",async(e)=>{

        e.stopPropagation();

        await agregarFavorito(grupo.id);

    });

    card.querySelector(".reportButton")
    .addEventListener("click",(e)=>{

        e.stopPropagation();

        abrirGrupo(grupo);

        showPage("groupPage");

    });

    contenedor.appendChild(card);

}


// ===========================
// DESTACADOS
// ===========================

function cargarDestacados(){

    const lista=[...grupos]
    .sort((a,b)=>

        (b.views||0)-(a.views||0)

    );

    const contenedor=
    document.getElementById("featuredGroups");

    if(!contenedor) return;

    contenedor.innerHTML="";

    lista.slice(0,5).forEach(grupo=>{

        crearTarjetaGrupo(

            grupo,
            contenedor

        );

    });

}


// ===========================
// NUEVOS
// ===========================

function cargarNuevos(){

    const lista=[...grupos].reverse();

    const contenedor=
    document.getElementById("latestGroups");

    if(!contenedor) return;

    contenedor.innerHTML="";

    lista.slice(0,5).forEach(grupo=>{

        crearTarjetaGrupo(

            grupo,
            contenedor

        );

    });

}


// ===========================
// TENDENCIAS
// ===========================

function cargarTendencias(){

    const lista=[...grupos]
    .sort((a,b)=>

        (b.favorites||0)-(a.favorites||0)

    );

    const contenedor=
    document.getElementById("trendingGroups");

    if(!contenedor) return;

    contenedor.innerHTML="";

    lista.slice(0,5).forEach(grupo=>{

        crearTarjetaGrupo(

            grupo,
            contenedor

        );

    });

}

// ===========================
// DETALLE DEL GRUPO
// ===========================

function abrirGrupo(grupo){

    grupoActual = grupo;

    const nombre = document.getElementById("groupName");
    const categoria = document.getElementById("groupCategory");
    const descripcion = document.getElementById("groupDescription");
    const imagen = document.getElementById("groupImage");

    const creador = document.getElementById("creatorName");
    const bio = document.getElementById("creatorBio");
    const instagram = document.getElementById("creatorInstagram");
    const tiktok = document.getElementById("creatorTikTok");

    const vistas = document.getElementById("groupViews");
    const favoritos = document.getElementById("groupFavorites");

    if(nombre) nombre.textContent = grupo.name || "Grupo";
    if(categoria) categoria.textContent = grupo.category || "Otros";
    if(descripcion) descripcion.textContent = grupo.description || "";

    if(imagen){
        imagen.src = grupo.image || "https://placehold.co/600x400";
    }

    if(creador){
        creador.textContent = grupo.creator || "Bennett";
    }

    if(bio){
        bio.textContent = grupo.creatorBio || "";
    }

    if(instagram){
        instagram.href = grupo.instagram || "#";
    }

    if(tiktok){
        tiktok.href = grupo.tiktok || "#";
    }

    if(vistas){
        vistas.textContent = `${grupo.views || 0} vistas`;
    }

    if(favoritos){
        favoritos.textContent = `${grupo.favorites || 0} favoritos`;
    }

    showPage("groupPage");

    sumarVista(grupo.id);

}


// ===========================
// SUMAR VISTA
// ===========================

async function sumarVista(grupoId){

    try{

        await updateDoc(

            doc(db,"groups",grupoId),

            {

                views:increment(1)

            }

        );

    }catch(error){

        console.error(error);

    }

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
// COMPARTIR
// ===========================

const shareGroupButton =
document.getElementById("shareGroupButton");

if(shareGroupButton){

    shareGroupButton.addEventListener("click",async()=>{

        if(!grupoActual) return;

        const texto =

`🔥 ${grupoActual.name}

${grupoActual.link}

𓆩⍣⃝ 𝙉𝙊𝘾𝙏𝙍𝘼⍣⃝ 𓆪`;

        if(navigator.share){

            await navigator.share({

                title:"NOCTRA",

                text:texto

            });

        }else{

            await navigator.clipboard.writeText(texto);

            alert("Enlace copiado");

        }

    });

}


// ===========================
// COPIAR ENLACE
// ===========================

const copyGroupButton =
document.getElementById("copyGroupButton");

if(copyGroupButton){

    copyGroupButton.addEventListener("click",async()=>{

        if(!grupoActual) return;

        await navigator.clipboard.writeText(

            grupoActual.link

        );

        alert("Enlace copiado");

    });

}

// ===========================
// PERFIL DE USUARIO
// ===========================

async function cargarDatosPerfil(){

    if(!usuarioActual) return;

    try{

        const referencia = doc(db,"users",usuarioActual.uid);

        const documento = await getDoc(referencia);

        if(!documento.exists()) return;

        const datos = documento.data();

        const foto = document.getElementById("profilePhoto");
        const nombre = document.getElementById("profileName");
        const correo = document.getElementById("profileEmail");
        const instagram = document.getElementById("profileInstagram");
        const tiktok = document.getElementById("profileTikTok");
        const bio = document.getElementById("profileBio");

        if(foto){
            foto.src = datos.photo || usuarioActual.photoURL || "";
        }

        if(nombre){
            nombre.textContent = datos.name || usuarioActual.displayName;
        }

        if(correo){
            correo.textContent = datos.email || usuarioActual.email;
        }

        if(instagram){
            instagram.value = datos.instagram || "";
        }

        if(tiktok){
            tiktok.value = datos.tiktok || "";
        }

        if(bio){
            bio.value = datos.bio || "";
        }

        // ===========================
        // ESTADÍSTICAS DEL PERFIL
        // ===========================

        const misGrupos = grupos.filter(grupo =>
            grupo.creatorUid === usuarioActual.uid
        );

        const totalGrupos = misGrupos.length;

        const totalVistas = misGrupos.reduce(
            (total, grupo) => total + (grupo.views || 0),
            0
        );

        const totalFavoritos = misGrupos.reduce(
            (total, grupo) => total + (grupo.favorites || 0),
            0
        );

        document.getElementById("profileGroups").textContent = totalGrupos;
        document.getElementById("profileViews").textContent = totalVistas;
        document.getElementById("profileFavorites").textContent = totalFavoritos;

    }catch(error){

        console.error(error);

    }

}


// ===========================
// GUARDAR PERFIL
// ===========================

const saveProfileButton =
document.getElementById("saveProfileButton");

if(saveProfileButton){

    saveProfileButton.addEventListener("click",async()=>{

        if(!usuarioActual){

            alert("Debes iniciar sesión.");

            return;

        }

        try{

            await updateDoc(

                doc(db,"users",usuarioActual.uid),

                {

                    instagram:document.getElementById("profileInstagram").value,

                    tiktok:document.getElementById("profileTikTok").value,

                    bio:document.getElementById("profileBio").value

                }

            );

            alert("Perfil actualizado.");

        }catch(error){

            console.error(error);

            alert("No se pudo guardar.");

        }

    });

}

// ===========================
// FAVORITOS
// ===========================

async function agregarFavorito(grupoId){

    if(!usuarioActual){

        alert("Debes iniciar sesión.");

        return;

    }

    try{

        const grupoRef = doc(db,"groups",grupoId);

        await updateDoc(grupoRef,{

            favorites:increment(1)

        });

        alert("Grupo agregado a favoritos.");

        cargarGrupos();

    }catch(error){

        console.error(error);

    }

}


// ===========================
// PUBLICAR GRUPO
// ===========================

const publishForm = document.getElementById("publishForm");

if(publishForm){

    publishForm.addEventListener("submit",async(e)=>{

        e.preventDefault();

        if(!usuarioActual){

            alert("Debes iniciar sesión.");

            return;

        }

        try{

            await addDoc(collection(db,"groups"),{

                name:document.getElementById("publishName").value,

                description:document.getElementById("publishDescription").value,

                category:document.getElementById("publishCategory").value,

                link:document.getElementById("publishLink").value,

                image:document.getElementById("publishImage").value ||

                "https://placehold.co/600x400",

                creator:usuarioActual.displayName,

                creatorUid:usuarioActual.uid,

                creatorPhoto:usuarioActual.photoURL,

                views:0,

                favorites:0,

                comments:0,

                createdAt:serverTimestamp()

            });

            alert("Grupo publicado correctamente.");

            publishForm.reset();

            cargarGrupos();

            showPage("homePage");

        }catch(error){

            console.error(error);

            alert("No se pudo publicar.");

        }

    });

}

// ===========================
// COMENTARIOS
// ===========================

async function cargarComentarios(){

    if(!grupoActual) return;

    const lista = document.getElementById("commentsList");

    if(!lista) return;

    lista.innerHTML = "";

    try{

        const q = query(

            collection(db,"comments"),

            where("groupId","==",grupoActual.id),

            orderBy("createdAt","asc")

        );

        const snapshot = await getDocs(q);

        snapshot.forEach((item)=>{

            const comentario = item.data();

            const div = document.createElement("div");

            div.className = "comment";

            div.innerHTML = `

                <strong>${comentario.author || "Usuario"}</strong>

                <p>${comentario.text}</p>

            `;

            lista.appendChild(div);

        });

        const total = document.getElementById("groupComments");

        if(total){

            total.textContent = `${snapshot.size} comentarios`;

        }

    }catch(error){

        console.error(error);

    }

}


// ===========================
// ENVIAR COMENTARIO
// ===========================

const sendCommentButton =
document.getElementById("sendCommentButton");

if(sendCommentButton){

    sendCommentButton.addEventListener("click",async()=>{

        if(!usuarioActual){

            alert("Debes iniciar sesión.");

            return;

        }

        if(!grupoActual) return;

        const input = document.getElementById("commentInput");

        const texto = input.value.trim();

        if(texto==="") return;

        try{

            await addDoc(

                collection(db,"comments"),

                {

                    groupId:grupoActual.id,

                    author:usuarioActual.displayName,

                    authorUid:usuarioActual.uid,

                    text:texto,

                    createdAt:serverTimestamp()

                }

            );

            input.value = "";

            cargarComentarios();

        }catch(error){

            console.error(error);

        }

    });

}


// ===========================
// REPORTAR GRUPO
// ===========================

const reportGroupButton =
document.getElementById("reportGroupButton");

if(reportGroupButton){

    reportGroupButton.addEventListener("click",async()=>{

        if(!usuarioActual){

            alert("Debes iniciar sesión.");

            return;

        }

        if(!grupoActual) return;

        const motivo = prompt(

            "¿Por qué deseas reportar este grupo?"

        );

        if(!motivo) return;

        try{

            await addDoc(

                collection(db,"reports"),

                {

                    groupId:grupoActual.id,

                    groupName:grupoActual.name,

                    reportedBy:usuarioActual.uid,

                    reason:motivo,

                    createdAt:serverTimestamp()

                }

            );

            alert("Reporte enviado correctamente.");

        }catch(error){

            console.error(error);

        }

    });

}

// ===========================
// NOTIFICACIONES
// ===========================

async function cargarNotificaciones(){

    if(!usuarioActual) return;

    const lista =
    document.getElementById("notificationsList");

    if(!lista) return;

    lista.innerHTML = "";

    try{

        const q = query(

            collection(db,"notifications"),

            where("userId","==",usuarioActual.uid),

            orderBy("createdAt","desc"),

            limit(20)

        );

        const snapshot = await getDocs(q);

        if(snapshot.empty){

            lista.innerHTML = `

                <div class="notificationCard">

                    <h3>No hay notificaciones</h3>

                    <p>Todavía no tienes ninguna.</p>

                </div>

            `;

            return;

        }

        snapshot.forEach((item)=>{

            const data = item.data();

            const card = document.createElement("div");

            card.className = "notificationCard";

            card.innerHTML = `

                <h3>${data.title || "Notificación"}</h3>

                <p>${data.message || ""}</p>

            `;

            lista.appendChild(card);

        });

    }catch(error){

        console.error(error);

    }

}


// ===========================
// ABRIR NOTIFICACIONES
// ===========================

const notificationsButton =
document.getElementById("notificationsButton");

if(notificationsButton){

    notificationsButton.addEventListener("click",()=>{

        showPage("notificationsPage");

        cargarNotificaciones();

    });

}


// ===========================
// ENVIAR NOTIFICACIÓN
// ===========================

async function crearNotificacion(

    userId,
    titulo,
    mensaje

){

    try{

        await addDoc(

            collection(db,"notifications"),

            {

                userId:userId,

                title:titulo,

                message:mensaje,

                createdAt:serverTimestamp()

            }

        );

    }catch(error){

        console.error(error);

    }

}

// ===========================
// BÚSQUEDA DE GRUPOS
// ===========================

const searchInput = document.getElementById("searchInput");

if(searchInput){

    searchInput.addEventListener("input",()=>{

        const texto = searchInput.value
        .trim()
        .toLowerCase();

        if(texto===""){

            mostrarGrupos(grupos);

            return;

        }

        const resultados = grupos.filter(grupo=>{

            return(

                grupo.name?.toLowerCase().includes(texto)

                ||

                grupo.description?.toLowerCase().includes(texto)

                ||

                grupo.category?.toLowerCase().includes(texto)

            );

        });

        mostrarGrupos(resultados);

    });

}


// ===========================
// FILTRAR CATEGORÍAS
// ===========================

const categoryButtons =
document.querySelectorAll(".categoryButton");

categoryButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        const categoria =
        button.dataset.category;

        const lista = grupos.filter(grupo=>{

            return grupo.category===categoria;

        });

        mostrarGrupos(lista);

        showPage("explorePage");

    });

});


// ===========================
// VER TODO
// ===========================

const seeAllTrending =
document.getElementById("seeAllTrending");

if(seeAllTrending){

    seeAllTrending.addEventListener("click",()=>{

        mostrarGrupos(grupos);

        showPage("explorePage");

    });

}

const seeAllFeatured =
document.getElementById("seeAllFeatured");

if(seeAllFeatured){

    seeAllFeatured.addEventListener("click",()=>{

        mostrarGrupos(grupos);

        showPage("explorePage");

    });

}


// ===========================
// BOTÓN PERFIL
// ===========================

const profileButton =
document.getElementById("profileButton");

if(profileButton){

    profileButton.addEventListener("click",()=>{

        showPage("profilePage");

        cargarDatosPerfil();

    });

}


// ===========================
// BOTÓN PUBLICAR
// ===========================

const publishFab =
document.getElementById("fabButton");

if(publishFab){

    publishFab.addEventListener("click",()=>{

        showPage("publishPage");

    });

}

// ===========================
// PANEL DE ADMINISTRACIÓN
// ===========================

async function cargarPanelAdmin(){

    try{

        // Total usuarios
        const usuariosSnapshot = await getDocs(
            collection(db,"users")
        );

        // Total grupos
        const gruposSnapshot = await getDocs(
            collection(db,"groups")
        );

        // Total reportes
        const reportesSnapshot = await getDocs(
            collection(db,"reports")
        );

        const totalUsers =
        document.getElementById("totalUsers");

        const totalGroups =
        document.getElementById("totalGroups");

        const totalReports =
        document.getElementById("totalReports");

        if(totalUsers){

            totalUsers.textContent =
            usuariosSnapshot.size;

        }

        if(totalGroups){

            totalGroups.textContent =
            gruposSnapshot.size;

        }

        if(totalReports){

            totalReports.textContent =
            reportesSnapshot.size;

        }

    }catch(error){

        console.error(
            "Error cargando panel:",
            error
        );

    }

}


// ===========================
// ABRIR PANEL ADMIN
// ===========================

const manageGroupsButton =
document.getElementById("manageGroupsButton");

const manageReportsButton =
document.getElementById("manageReportsButton");

const sendAnnouncementButton =
document.getElementById("sendAnnouncementButton");

if(manageGroupsButton){

    manageGroupsButton.addEventListener("click",()=>{

        alert(
            "Próximamente podrás administrar los grupos."
        );

    });

}

if(manageReportsButton){

    manageReportsButton.addEventListener("click",()=>{

        alert(
            "Próximamente podrás revisar los reportes."
        );

    });

}

if(sendAnnouncementButton){

    sendAnnouncementButton.addEventListener("click",()=>{

        alert(
            "Próximamente podrás enviar avisos."
        );

    });

}


// ===========================
// ABRIR ADMINISTRACIÓN
// ===========================

function abrirPanelAdmin(){

    showPage("adminPage");

    cargarPanelAdmin();

}

// ===========================
// ELIMINACIÓN AUTOMÁTICA
// 48 HORAS
// ===========================

async function limpiarGruposExpirados(){

    try{

        const snapshot = await getDocs(
            collection(db,"groups")
        );

        const ahora = Date.now();

        for(const item of snapshot.docs){

            const grupo = item.data();

            if(!grupo.createdAt) continue;

            const fecha =
            grupo.createdAt.toDate().getTime();

            const horas =
            (ahora - fecha) /
            (1000 * 60 * 60);

            if(horas >= 48){

                await deleteDoc(

                    doc(db,"groups",item.id)

                );

                console.log(
                    "Grupo eliminado:",
                    grupo.name
                );

            }

        }

    }catch(error){

        console.error(
            "Error eliminando grupos:",
            error
        );

    }

}


// ===========================
// INICIAR APP
// ===========================

window.addEventListener("load",async()=>{

    try{

        ocultarSplash();

        await limpiarGruposExpirados();

        await cargarGrupos();

        console.log(
            "NOCTRA iniciada correctamente."
        );

    }catch(error){

        console.error(error);

    }

});


// ===========================
// RECARGAR DATOS
// ===========================

async function actualizarAplicacion(){

    await cargarGrupos();

    if(usuarioActual){

        await cargarDatosPerfil();

        await cargarNotificaciones();

    }

}


// ===========================
// BOTÓN RECARGAR
// ===========================

window.actualizarAplicacion =
actualizarAplicacion;

// ===========================
// PARTE 12
// INICIALIZACIÓN FINAL
// ===========================

// Abrir comentarios
const groupComments =
document.getElementById("groupComments");

if(groupComments){

    groupComments.addEventListener("click",()=>{

        if(!grupoActual) return;

        showPage("commentsPage");

        cargarComentarios();

    });

}


// Abrir perfil desde navegación
const profileNav =
document.querySelector(
'.navButton[data-page="profilePage"]'
);

if(profileNav){

    profileNav.addEventListener("click",()=>{

        if(usuarioActual){

            cargarDatosPerfil();

        }

    });

}


// Abrir explorar
const exploreNav =
document.querySelector(
'.navButton[data-page="explorePage"]'
);

if(exploreNav){

    exploreNav.addEventListener("click",()=>{

        mostrarGrupos(grupos);

    });

}


// Botón volver al inicio
const homeNav =
document.querySelector(
'.navButton[data-page="homePage"]'
);

if(homeNav){

    homeNav.addEventListener("click",()=>{

        cargarGrupos();

    });

}


// Refrescar datos cada minuto
setInterval(async()=>{

    try{

        await cargarGrupos();

    }catch(error){

        console.error(error);

    }

},60000);


// ===========================
// ARRANQUE FINAL
// ===========================

document.addEventListener("DOMContentLoaded",async()=>{

    try{

        ocultarSplash();

        await limpiarGruposExpirados();

        await cargarGrupos();

        if(usuarioActual){

            await cargarDatosPerfil();

            await cargarNotificaciones();

        }

        console.log("𓆩⍣⃝ 𝙉𝙊𝘾𝙏𝙍𝘼⍣⃝ 𓆪 lista.");

    }catch(error){

        console.error(

            "Error iniciando NOCTRA:",

            error

        );

    }

});


// ===========================
// FIN SCRIPT.JS
// 𓆩⍣⃝ 𝙉𝙊𝘾𝙏𝙍𝘼⍣⃝ 𓆪
// ===========================
