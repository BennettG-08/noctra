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
    updateDoc,
    deleteDoc,
    doc,
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

let usuarioActual = null;
let grupos = [];
let grupoActual = null;

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".navButton");

function showPage(id){

    pages.forEach(page=>{

        page.classList.remove("active");

    });

    const page = document.getElementById(id);

    if(page){

        page.classList.add("active");

    }

}

navButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        showPage(button.dataset.page);

        navButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        button.classList.add("active");

    });

});

// ===========================
// PARTE 2
// SESIÓN Y USUARIOS
// ===========================

async function crearUsuario(user){

    const referencia = doc(
        db,
        "users",
        user.uid
    );

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



async function cargarDatosPerfil(){

    if(!usuarioActual) return;

    const documento = await getDoc(

        doc(
            db,
            "users",
            usuarioActual.uid
        )

    );

    if(!documento.exists()) return;

    const datos = documento.data();

    document.getElementById("profileName").textContent =
    datos.name || "Usuario";

    document.getElementById("profileEmail").textContent =
    datos.email || "";

    document.getElementById("profilePhoto").src =
    datos.photo || "";

    document.getElementById("profileInstagram").value =
    datos.instagram || "";

    document.getElementById("profileTikTok").value =
    datos.tiktok || "";

    document.getElementById("profileBio").value =
    datos.bio || "";

}



onAuthStateChanged(auth,async(user)=>{

    usuarioActual = user;

    const login =
    document.getElementById("loginButton");

    const logout =
    document.getElementById("logoutButton");

    if(user){

        await crearUsuario(user);

        await cargarDatosPerfil();

        if(login)
        login.style.display="none";

        if(logout)
        logout.style.display="block";

    }else{

        if(login)
        login.style.display="block";

        if(logout)
        logout.style.display="none";

    }

});



const loginButton =
document.getElementById("loginButton");

if(loginButton){

    loginButton.addEventListener("click",async()=>{

        await loginGoogle();

    });

}



const logoutButton =
document.getElementById("logoutButton");

if(logoutButton){

    logoutButton.addEventListener("click",async()=>{

        await logoutUser();

        location.reload();

    });

}

// ===========================
// PARTE 3
// GRUPOS
// ===========================

async function cargarGrupos(){

    const snapshot =
    await getDocs(
        collection(db,"groups")
    );

    grupos = [];

    snapshot.forEach((item)=>{

        grupos.push({

            id:item.id,

            ...item.data()

        });

    });

    mostrarGrupos(grupos);

}



function mostrarGrupos(lista){

    const contenedores=[

        "trendingGroups",

        "featuredGroups",

        "latestGroups",

        "exploreGroups"

    ];

    contenedores.forEach(id=>{

        const contenedor=
        document.getElementById(id);

        if(!contenedor) return;

        contenedor.innerHTML="";

        lista.forEach(grupo=>{

            const card=document.createElement("div");

            card.className="groupCard";

            card.innerHTML=`

            <img src="${grupo.image || "https://placehold.co/400x400"}">

            <div class="groupContent">

            <h3>${grupo.name}</h3>

            <p>${grupo.description}</p>

            <div class="groupMeta">

            <span>${grupo.category}</span>

            <span>👁 ${grupo.views || 0}</span>

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

            card.querySelector(".joinButton")
            .addEventListener("click",(e)=>{

                e.stopPropagation();

                window.open(
                    grupo.link,
                    "_blank"
                );

            });

            card.addEventListener("click",()=>{

                abrirGrupo(grupo);

            });

            contenedor.appendChild(card);

        });

    });

}



function abrirGrupo(grupo){

    grupoActual=grupo;

    document.getElementById("groupName").textContent=
    grupo.name;

    document.getElementById("groupCategory").textContent=
    grupo.category;

    document.getElementById("groupDescription").textContent=
    grupo.description;

    document.getElementById("groupImage").src=
    grupo.image || "";

    document.getElementById("groupViews").textContent=
    "👁 "+(grupo.views || 0);

    document.getElementById("groupFavorites").textContent=
    "❤️ "+(grupo.favorites || 0);

    showPage("groupPage");

    }

// ===========================
// PARTE 4
// FAVORITOS - VISTAS - BÚSQUEDA
// ===========================

async function agregarFavorito(grupoId){

    if(!usuarioActual){

        alert("Inicia sesión para guardar favoritos");

        return;

    }

    try{

        await setDoc(

            doc(
                db,
                "users",
                usuarioActual.uid,
                "favorites",
                grupoId
            ),

            {
                createdAt:serverTimestamp()
            }

        );

        await updateDoc(

            doc(db,"groups",grupoId),

            {
                favorites:increment(1)
            }

        );

        cargarGrupos();

    }catch(error){

        console.error(error);

    }

}



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



document.addEventListener("click",async(e)=>{

    if(e.target.classList.contains("favoriteButton")){

        e.stopPropagation();

        const card=e.target.closest(".groupCard");

        if(!card)return;

        const nombre=
        card.querySelector("h3").textContent;

        const grupo=
        grupos.find(g=>g.name===nombre);

        if(!grupo)return;

        await agregarFavorito(grupo.id);

        e.target.textContent="💜";

    }

});



const joinGroupButton=
document.getElementById("joinGroupButton");

if(joinGroupButton){

    joinGroupButton.addEventListener("click",()=>{

        if(grupoActual?.link){

            window.open(
                grupoActual.link,
                "_blank"
            );

            sumarVista(grupoActual.id);

        }

    });

}



const searchInput=
document.getElementById("searchInput");

if(searchInput){

    searchInput.addEventListener("input",()=>{

        const texto=
        searchInput.value.toLowerCase();

        const resultado=
        grupos.filter(grupo=>

            grupo.name?.toLowerCase().includes(texto)

            ||

            grupo.description?.toLowerCase().includes(texto)

            ||

            grupo.category?.toLowerCase().includes(texto)

        );

        mostrarGrupos(resultado);

    });

}

// ===========================
// PARTE 5
// PERFIL - PUBLICAR - COMENTARIOS
// ===========================

const saveProfileButton =
document.getElementById("saveProfileButton");

if(saveProfileButton){

    saveProfileButton.addEventListener("click",async()=>{

        if(!usuarioActual)return;

        await updateDoc(

            doc(db,"users",usuarioActual.uid),

            {

                instagram:
                document.getElementById("profileInstagram").value,

                tiktok:
                document.getElementById("profileTikTok").value,

                bio:
                document.getElementById("profileBio").value

            }

        );

        alert("Perfil actualizado");

    });

}



const publishForm =
document.getElementById("publishForm");

if(publishForm){

    publishForm.addEventListener("submit",async(e)=>{

        e.preventDefault();

        await addDoc(

            collection(db,"groups"),

            {

                name:
                document.getElementById("publishName").value,

                description:
                document.getElementById("publishDescription").value,

                category:
                document.getElementById("publishCategory").value,

                link:
                document.getElementById("publishLink").value,

                image:
                document.getElementById("publishImage").value,

                creator:
                usuarioActual?.displayName || "Usuario",

                instagram:
                document.getElementById("profileInstagram").value,

                tiktok:
                document.getElementById("profileTikTok").value,

                createdAt:
                serverTimestamp(),

                views:0,

                favorites:0

            }

        );

        alert("Grupo publicado");

        publishForm.reset();

        cargarGrupos();

    });

}



async function cargarComentarios(){

    if(!grupoActual)return;

    const lista=
    document.getElementById("commentsList");

    lista.innerHTML="";

    const snapshot=
    await getDocs(

        query(

            collection(db,"comments"),

            where(
                "groupId",
                "==",
                grupoActual.id
            )

        )

    );

    snapshot.forEach((item)=>{

        const comentario=
        item.data();

        lista.innerHTML+=`

        <div class="comment">

        <strong>

        ${comentario.author}

        </strong>

        <p>

        ${comentario.text}

        </p>

        </div>

        `;

    });

}



const sendCommentButton=
document.getElementById("sendCommentButton");

if(sendCommentButton){

    sendCommentButton.addEventListener("click",async()=>{

        if(!grupoActual)return;

        const texto=
        document.getElementById("commentInput").value.trim();

        if(!texto)return;

        await addDoc(

            collection(db,"comments"),

            {

                groupId:
                grupoActual.id,

                author:
                usuarioActual?.displayName || "Usuario",

                text:texto,

                createdAt:
                serverTimestamp()

            }

        );

        document.getElementById("commentInput").value="";

        cargarComentarios();

    });

}

// ===========================
// PARTE 6
// COMPARTIR - REPORTAR
// ===========================

const shareGroupButton =
document.getElementById("shareGroupButton");

if(shareGroupButton){

    shareGroupButton.addEventListener("click",async()=>{

        if(!grupoActual)return;

        const texto=`🔥 ${grupoActual.name}

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



const copyGroupButton =
document.getElementById("copyGroupButton");

if(copyGroupButton){

    copyGroupButton.addEventListener("click",async()=>{

        if(!grupoActual)return;

        await navigator.clipboard.writeText(grupoActual.link);

        alert("Enlace copiado");

    });

}



const reportGroupButton =
document.getElementById("reportGroupButton");

if(reportGroupButton){

    reportGroupButton.addEventListener("click",async()=>{

        if(!grupoActual)return;

        const motivo=prompt("¿Cuál es el motivo del reporte?");

        if(!motivo)return;

        await addDoc(

            collection(db,"reports"),

            {

                groupId:grupoActual.id,

                groupName:grupoActual.name,

                reason:motivo,

                author:usuarioActual?.uid || "",

                createdAt:serverTimestamp()

            }

        );

        alert("Reporte enviado");

    });

}



const groupComments =
document.getElementById("groupComments");

if(groupComments){

    groupComments.addEventListener("click",()=>{

        showPage("commentsPage");

        cargarComentarios();

    });

}

// ===========================
// PARTE 7
// NOTIFICACIONES - LIMPIEZA - PERFIL
// ===========================

async function cargarNotificaciones(){

    if(!usuarioActual)return;

    const lista=
    document.getElementById("notificationsList");

    if(!lista)return;

    lista.innerHTML="";

    const snapshot=
    await getDocs(

        query(

            collection(db,"notifications"),

            where(
                "userId",
                "==",
                usuarioActual.uid
            ),

            orderBy(
                "createdAt",
                "desc"
            ),

            limit(20)

        )

    );

    snapshot.forEach((item)=>{

        const data=item.data();

        const div=document.createElement("div");

        div.className="notificationCard";

        div.innerHTML=`

        <h3>${data.title || "Notificación"}</h3>

        <p>${data.message || ""}</p>

        `;

        lista.appendChild(div);

    });

}



const notificationsButton=
document.getElementById("notificationsButton");

if(notificationsButton){

    notificationsButton.addEventListener("click",()=>{

        showPage("notificationsPage");

        cargarNotificaciones();

    });

}



const profileButton=
document.getElementById("profileButton");

if(profileButton){

    profileButton.addEventListener("click",async()=>{

        showPage("profilePage");

        await cargarDatosPerfil();

    });

}



async function limpiarGruposExpirados(){

    const snapshot=
    await getDocs(
        collection(db,"groups")
    );

    const ahora=Date.now();

    for(const item of snapshot.docs){

        const grupo=item.data();

        if(!grupo.createdAt) continue;

        const horas=

        (ahora-grupo.createdAt.toDate().getTime())

        /(1000*60*60);

        if(horas>=48){

            await deleteDoc(

                doc(db,"groups",item.id)

            );

        }

    }

}

// ===========================
// PARTE 8
// INICIALIZACIÓN
// ===========================

// Botones volver

const backButtons={

    backGroupButton:"homePage",

    backExploreButton:"homePage",

    backCommentsButton:"groupPage",

    backPublishButton:"homePage",

    backProfileButton:"homePage",

    backNotificationsButton:"homePage",

    backAdminButton:"homePage"

};

Object.entries(backButtons).forEach(([id,pagina])=>{

    const boton=document.getElementById(id);

    if(!boton)return;

    boton.addEventListener("click",()=>{

        showPage(pagina);

    });

});



// Categorías

document.querySelectorAll(".categoryButton").forEach(btn=>{

    btn.addEventListener("click",()=>{

        const categoria=btn.dataset.category;

        const resultado=grupos.filter(g=>

            g.category===categoria

        );

        mostrarGrupos(resultado);

        showPage("explorePage");

    });

});



// Ver todo

const seeAllTrending=document.getElementById("seeAllTrending");

if(seeAllTrending){

    seeAllTrending.addEventListener("click",()=>{

        mostrarGrupos(grupos);

        showPage("explorePage");

    });

}



const seeAllFeatured=document.getElementById("seeAllFeatured");

if(seeAllFeatured){

    seeAllFeatured.addEventListener("click",()=>{

        mostrarGrupos(grupos);

        showPage("explorePage");

    });

}



// Botón flotante publicar

const fab=document.getElementById("fabButton");

if(fab){

    fab.addEventListener("click",()=>{

        showPage("publishPage");

    });

}



// Inicio

window.addEventListener("load",async()=>{

    try{

        await limpiarGruposExpirados();

        await cargarGrupos();

    }catch(error){

        console.error(error);

    }

});
