// ===========================
// SCRIPT.JS - 𓆩⍣⃝ 𝙉𝙊𝘾𝙏𝙍𝘼⍣⃝ 𓆪
// ===========================

import {

db,
auth,

addDoc,
getDocs,
getDoc,
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

collection,
setDoc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ===========================
// VARIABLES GLOBALES
// ===========================

let grupos = [];

let grupoActual = null;

let usuarioActual = null;


// ===========================
// ELEMENTOS
// ===========================

const pages = document.querySelectorAll(".page");

const navButtons = document.querySelectorAll(".navButton");


// ===========================
// CAMBIAR PÁGINA
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
// NAVEGACIÓN
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
// CARGAR GRUPOS DESDE FIRESTORE
// ===========================

async function cargarGrupos(){

try{

const gruposRef = collection(db,"groups");

const snapshot = await getDocs(gruposRef);


grupos = [];


snapshot.forEach((documento)=>{


grupos.push({

id: documento.id,

...documento.data()

});


});


console.log("Grupos encontrados:", grupos.length);


mostrarGrupos(grupos);


}catch(error){


console.error("Error cargando grupos:",error);


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


const contenedor = document.getElementById(id);


if(!contenedor) return;


contenedor.innerHTML="";



lista.forEach(grupo=>{


const card = document.createElement("div");


card.className="groupCard";



card.innerHTML=`


<img src="${grupo.image || 'https://via.placeholder.com/400'}">


<div class="groupContent">


<h3>${grupo.name || "Grupo sin nombre"}</h3>


<p>${grupo.description || "Sin descripción"}</p>


<div class="groupMeta">


<span>${grupo.category || "Otros"}</span>


<span>
${grupo.views || 0} vistas
</span>


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



card.querySelector(".joinButton")
.addEventListener("click",()=>{


window.open(
grupo.link,
"_blank"
);


});



card.addEventListener("click",(e)=>{


if(e.target.tagName==="BUTTON") return;


abrirGrupo(grupo);


});



contenedor.appendChild(card);


});


});


}



// ===========================
// ABRIR DETALLE DEL GRUPO
// ===========================

function abrirGrupo(grupo){


grupoActual = grupo;


document.getElementById("groupName").textContent =
grupo.name || "";


document.getElementById("groupCategory").textContent =
grupo.category || "";


document.getElementById("groupDescription").textContent =
grupo.description || "";


document.getElementById("groupImage").src =
grupo.image || "";



document.getElementById("creatorName").textContent =
grupo.creator || "Bennett";


document.getElementById("creatorInstagram").href =
grupo.instagram || "https://www.instagram.com/bk.ls08";


document.getElementById("creatorTikTok").href =
grupo.tiktok || "https://www.tiktok.com/@bk.ls08";



showPage("groupPage");


}

// ===========================
// BÚSQUEDA DE GRUPOS
// ===========================

const searchInput = document.getElementById("searchInput");


if(searchInput){


searchInput.addEventListener("input",()=>{


const texto = searchInput.value.toLowerCase();



const resultados = grupos.filter(grupo=>{


return (

grupo.name?.toLowerCase().includes(texto)

||

grupo.category?.toLowerCase().includes(texto)

||

grupo.description?.toLowerCase().includes(texto)

);


});



mostrarGrupos(resultados);



});


}



// ===========================
// FILTRAR POR CATEGORÍA
// ===========================

const categoryButtons = document.querySelectorAll(".categoryButton");


categoryButtons.forEach(button=>{


button.addEventListener("click",()=>{


const categoria = button.dataset.category;



const filtrados = grupos.filter(grupo=>{


return grupo.category === categoria;


});



mostrarGrupos(filtrados);



showPage("explorePage");



});


});



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



Object.entries(backButtons).forEach(([boton,pagina])=>{


const element = document.getElementById(boton);



if(element){


element.addEventListener("click",()=>{


showPage(pagina);



});


}



});



// ===========================
// BOTÓN ENTRAR GRUPO
// ===========================

const joinButton =
document.getElementById("joinGroupButton");



if(joinButton){


joinButton.addEventListener("click",()=>{


if(grupoActual?.link){


window.open(
grupoActual.link,
"_blank"
);


}


});


}



// ===========================
// SESIÓN USUARIO
// ===========================

onAuthStateChanged(auth,(user)=>{


usuarioActual=user || null;



if(user){


console.log(
"Sesión iniciada:",
user.email
);


}



});



// ===========================
// INICIAR APP
// ===========================

document.addEventListener(
"DOMContentLoaded",
()=>{


cargarGrupos();


});

// ===========================
// FAVORITOS
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

createdAt: serverTimestamp()

}

);



await updateDoc(

doc(
db,
"groups",
grupoId
),

{

favorites: increment(1)

}

);



console.log("Favorito agregado correctamente");


}catch(error){


console.error(
"Error guardando favorito:",
error
);


}


}



// ===========================
// REPORTAR GRUPO
// ===========================

const reportButton =
document.getElementById("reportGroupButton");



if(reportButton){


reportButton.addEventListener("click",async()=>{


if(!grupoActual) return;



const motivo = prompt(
"¿Por qué quieres reportar este grupo?"
);



if(!motivo) return;



try{


await addDoc(

collection(db,"reports"),

{

groupId:grupoActual.id,

groupName:grupoActual.name,

reason:motivo,

createdAt:serverTimestamp()

}

);



alert("Reporte enviado correctamente");



}catch(error){


console.error(error);


}



});


}



// ===========================
// PUBLICAR GRUPO
// ===========================

const publishForm =
document.getElementById("publishForm");



if(publishForm){


publishForm.addEventListener("submit",async(e)=>{


e.preventDefault();



const nuevoGrupo={


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
usuarioActual?.displayName || "Bennett",


createdAt:
serverTimestamp(),


views:0,


favorites:0


};



try{


await addDoc(

collection(db,"groups"),

nuevoGrupo

);



alert(
"Grupo publicado correctamente"
);



publishForm.reset();



cargarGrupos();



}catch(error){


console.error(error);


}



});


}

// ===========================
// COMENTARIOS
// ===========================

const sendCommentButton =
document.getElementById("sendCommentButton");


if(sendCommentButton){


sendCommentButton.addEventListener("click",async()=>{


const input =
document.getElementById("commentInput");


const texto = input.value.trim();



if(!texto || !grupoActual){

return;

}



try{


await addDoc(

collection(db,"comments"),

{

groupId:grupoActual.id,

text:texto,

author:
usuarioActual?.displayName || "Usuario",

createdAt:
serverTimestamp()

}

);



input.value="";


cargarComentarios();



}catch(error){


console.error(error);


}



});


}



// ===========================
// CARGAR COMENTARIOS
// ===========================

async function cargarComentarios(){


if(!grupoActual) return;



const lista =
document.getElementById("commentsList");



if(!lista) return;



lista.innerHTML="";



const q = query(

collection(db,"comments"),

where(
"groupId",
"==",
grupoActual.id

)

);



const snapshot =
await getDocs(q);



snapshot.forEach((doc)=>{


const comentario =
doc.data();



const div =
document.createElement("div");



div.className="comment";



div.innerHTML=`

<strong>
${comentario.author}
</strong>

<p>
${comentario.text}
</p>

`;



lista.appendChild(div);



});


}



// ===========================
// CONTADOR DE VISTAS
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
// ACTUALIZAR PERFIL
// ===========================

const saveProfileButton =
document.getElementById("saveProfileButton");



if(saveProfileButton){


saveProfileButton.addEventListener("click",async()=>{


if(!usuarioActual)return;



const datos={


instagram:
document.getElementById("profileInstagram").value,


tiktok:
document.getElementById("profileTikTok").value,


bio:
document.getElementById("profileBio").value


};



await updateDoc(

doc(db,"users",usuarioActual.uid),

datos

);



alert("Perfil actualizado");


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


lista.innerHTML="";


const q = query(

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

);



const snapshot =
await getDocs(q);



snapshot.forEach((doc)=>{


const data = doc.data();



const item =
document.createElement("div");


item.className="notificationCard";



item.innerHTML=`

<h3>
${data.title || "Notificación"}
</h3>

<p>
${data.message || ""}
</p>

`;



lista.appendChild(item);



});


}



// ===========================
// PERFIL DE USUARIO
// ===========================

async function cargarDatosPerfil(){


if(!usuarioActual) return;



const nombre =
document.getElementById("profileName");


const email =
document.getElementById("profileEmail");


const foto =
document.getElementById("profilePhoto");



if(nombre){

nombre.textContent =
usuarioActual.displayName || "Bennett";

}



if(email){

email.textContent =
usuarioActual.email;

}



if(foto && usuarioActual.photoURL){

foto.src =
usuarioActual.photoURL;

}



// ===========================
// CONTADORES DEL PERFIL
// ===========================

try{


const gruposRef =
query(

collection(db,"groups"),

where(
"creator",
"==",
"Bennett"

)

);



const gruposSnapshot =
await getDocs(gruposRef);



let totalGrupos = 0;

let totalVistas = 0;



gruposSnapshot.forEach((item)=>{


const grupo =
item.data();



totalGrupos++;


totalVistas +=
grupo.views || 0;


});



const grupos =
document.getElementById("profileGroups");


const vistas =
document.getElementById("profileViews");



if(grupos){

grupos.textContent =
totalGrupos;

}



if(vistas){

vistas.textContent =
totalVistas;

}



// FAVORITOS

const favoritosRef =
collection(

db,

"users",

usuarioActual.uid,

"favorites"

);



const favoritosSnapshot =
await getDocs(favoritosRef);



const favoritos =
document.getElementById("profileFavorites");



if(favoritos){

favoritos.textContent =
favoritosSnapshot.size;

}



}catch(error){

console.error(
"Error cargando datos del perfil:",
error
);

}



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
// BOTÓN NOTIFICACIONES
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
// CERRAR SESIÓN
// ===========================

const logoutButton =
document.getElementById("logoutButton");



if(logoutButton){


logoutButton.addEventListener("click",async()=>{


await logoutUser();


location.reload();


});


}

// ===========================
// LOGIN GOOGLE
// ===========================

const loginButton =
document.getElementById("loginButton");



if(loginButton){


loginButton.addEventListener("click",async()=>{


const user =
await loginGoogle();



if(user){


alert(
"Bienvenido a NOCTRA"
);



}


});


}



// ===========================
// COMPARTIR GRUPO
// ===========================

const shareGroupButton =
document.getElementById("shareGroupButton");



if(shareGroupButton){


shareGroupButton.addEventListener("click",async()=>{


if(!grupoActual)return;



const texto =

`🔥 Mira este grupo en NOCTRA:

${grupoActual.name}

${grupoActual.link}

𓆩⍣⃝ 𝙉𝙊𝘾𝙏𝙍𝘼⍣⃝ 𓆪`;



if(navigator.share){


await navigator.share({

title:"NOCTRA",

text:texto

});


}else{


navigator.clipboard.writeText(texto);


alert(
"Enlace copiado"
);


}



});


}



// ===========================
// COPIAR ENLACE
// ===========================

const copyGroupButton =
document.getElementById("copyGroupButton");



if(copyGroupButton){


copyGroupButton.addEventListener("click",()=>{


if(!grupoActual)return;



navigator.clipboard.writeText(

grupoActual.link

);



alert(
"Enlace copiado"
);



});


}



// ===========================
// ELIMINACIÓN AUTOMÁTICA 48 HORAS
// ===========================

async function limpiarGruposExpirados(){


const ahora =
Date.now();



const snapshot =
await getDocs(

collection(db,"groups")

);



snapshot.forEach(async(item)=>{


const grupo =
item.data();



if(grupo.createdAt){



const fecha =
grupo.createdAt.toDate().getTime();



const diferencia =
ahora - fecha;



const horas =
diferencia /
(1000 * 60 * 60);



if(horas >= 48){


await deleteDoc(

doc(db,"groups",item.id)

);



}


}



});


}


// Ejecutar limpieza

limpiarGruposExpirados();

// ===========================
// BOTÓN PUBLICAR
// ===========================

const publishButton =
document.getElementById("fabButton");



if(publishButton){


publishButton.addEventListener("click",()=>{


showPage("publishPage");


});


}



// ===========================
// CARGAR GRUPOS DESTACADOS
// ===========================

async function cargarDestacados(){


const contenedor =
document.getElementById("featuredGroups");


if(!contenedor)return;



const q = query(

collection(db,"groups"),

orderBy(
"views",
"desc"

),

limit(5)

);



const snapshot =
await getDocs(q);



contenedor.innerHTML="";



snapshot.forEach((item)=>{


const grupo =
item.data();



crearTarjetaGrupo(

grupo,

item.id,

contenedor

);



});


}



// ===========================
// CREAR TARJETA
// ===========================

function crearTarjetaGrupo(
grupo,
id,
contenedor
){


const card =
document.createElement("div");



card.className =
"groupCard";



card.innerHTML = `

<img src="${
grupo.image ||
'https://via.placeholder.com/400'
}">


<div class="groupContent">


<h3>
${grupo.name || "Grupo"}
</h3>


<p>
${grupo.category || "Otros"}
</p>


<div class="groupMeta">


<span>
👁 ${
grupo.views || 0
}
</span>


<span>
❤️ ${
grupo.favorites || 0
}
</span>


</div>


</div>

`;



card.addEventListener(
"click",
()=>{


abrirGrupo({

id:id,

...grupo

});



sumarVista(id);


}

);



contenedor.appendChild(card);


}



// ===========================
// INICIAR DATOS
// ===========================

window.addEventListener(
"load",
()=>{


cargarDestacados();


});

// ===========================
// FAVORITOS EN TARJETAS
// ===========================

document.addEventListener(
"click",
async(e)=>{


if(
e.target.classList.contains(
"favoriteButton"
)

){


e.stopPropagation();



const card =
e.target.closest(
".groupCard"
);



if(!card)return;



const nombre =
card.querySelector("h3")
.textContent;



const grupo =
grupos.find(
(g)=>g.name===nombre
);



if(grupo){


await agregarFavorito(
grupo.id
);



e.target.textContent="💜";


}



}


});



// ===========================
// REGISTRAR USUARIO
// ===========================

async function crearUsuario(user){


const referencia =
doc(
db,
"users",
user.uid
);



const usuario =
await getDoc(referencia);



if(!usuario.exists()){


await setDoc(

referencia,

{

uid:user.uid,

name:
user.displayName || "Usuario",


email:
user.email,


photo:
user.photoURL || "",


instagram:"",

tiktok:"",

bio:"",


createdAt:
serverTimestamp()

}

);



}


}



// ===========================
// ESCUCHAR CAMBIOS DE SESIÓN
// ===========================

onAuthStateChanged(
auth,
async(user)=>{

usuarioActual = user || null;

const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");

if(user){

if(loginButton)
loginButton.style.display="none";

if(logoutButton)
logoutButton.style.display="block";

await crearUsuario(user);

cargarDatosPerfil();

}else{

if(loginButton)
loginButton.style.display="block";

if(logoutButton)
logoutButton.style.display="none";

}

});

// ===========================
// BOTONES VER TODO
// ===========================

const seeAllTrending =
document.getElementById("seeAllTrending");


if(seeAllTrending){


seeAllTrending.addEventListener(
"click",
()=>{


mostrarGrupos(grupos);


showPage(
"explorePage"
);


});


}



const seeAllFeatured =
document.getElementById("seeAllFeatured");


if(seeAllFeatured){


seeAllFeatured.addEventListener(
"click",
()=>{


mostrarGrupos(grupos);


showPage(
"explorePage"
);


});


}



// ===========================
// AUMENTAR FAVORITOS
// ===========================

async function aumentarFavoritos(id){


try{


await updateDoc(

doc(db,"groups",id),

{

favorites:
increment(1)

}

);



}catch(error){


console.error(
"Error favoritos:",
error
);


}


}



// ===========================
// REPORTES DESDE TARJETA
// ===========================

document.addEventListener(
"click",
(e)=>{


if(
e.target.classList.contains(
"reportButton"
)

){


e.stopPropagation();



alert(
"Puedes reportar este grupo desde la página del grupo"
);



}



});



// ===========================
// DATOS DEL CREADOR
// ===========================

function mostrarCreador(grupo){


const nombre =
document.getElementById(
"creatorName"
);



const instagram =
document.getElementById(
"creatorInstagram"
);



const tiktok =
document.getElementById(
"creatorTikTok"
);



if(nombre){

nombre.textContent =
grupo.creator ||
"Bennett";

}



if(instagram){

instagram.href =
grupo.instagram ||
"https://www.instagram.com/bk.ls08";

}



if(tiktok){

tiktok.href =
grupo.tiktok ||
"https://www.tiktok.com/@bk.ls08";

}



}

// ===========================
// ACTUALIZAR DETALLE DEL GRUPO
// ===========================

function actualizarGrupoDetalle(grupo){


grupoActual = grupo;



const elementos = {


groupName: grupo.name || "Sin nombre",

groupCategory: grupo.category || "Otros",

groupDescription: grupo.description || "Sin descripción",


groupViews:
`👁 ${grupo.views || 0} vistas`,


groupFavorites:
`❤️ ${grupo.favorites || 0} favoritos`


};



Object.entries(elementos).forEach(
([id,texto])=>{


const elemento =
document.getElementById(id);



if(elemento){

elemento.textContent = texto;

}



});



const imagen =
document.getElementById(
"groupImage"
);



if(imagen){

imagen.src =
grupo.image ||
"https://via.placeholder.com/400";

}



mostrarCreador(grupo);



}



// ===========================
// ABRIR COMENTARIOS
// ===========================

const commentsButton =
document.getElementById(
"groupComments"
);



if(commentsButton){


commentsButton.addEventListener(
"click",
()=>{


showPage(
"commentsPage"
);


cargarComentarios();


});


}



// ===========================
// CREAR NOTIFICACIÓN
// ===========================

async function crearNotificacion(
userId,
titulo,
mensaje
){


try{


await addDoc(

collection(
db,
"notifications"

),

{

userId:userId,

title:titulo,

message:mensaje,

createdAt:
serverTimestamp()

}

);



}catch(error){


console.error(error);


}



}



// ===========================
// MENSAJE DE INICIO
// ===========================

console.log(
"𓆩⍣⃝ 𝙉𝙊𝘾𝙏𝙍𝘼⍣⃝ 𓆪 iniciado correctamente"
);

// ===========================
// SPLASH SCREEN
// ===========================

window.addEventListener(
"load",
()=>{


const splash =
document.getElementById(
"splashScreen"
);



if(splash){


setTimeout(()=>{


splash.style.opacity="0";


setTimeout(()=>{


splash.style.display="none";


},500);



},1500);



}


});



// ===========================
// BOTÓN VOLVER DESDE GRUPO
// ===========================

const backGroupButton =
document.getElementById(
"backGroupButton"
);



if(backGroupButton){


backGroupButton.addEventListener(
"click",
()=>{


showPage(
"homePage"
);


});


}



// ===========================
// CARGAR PERFIL SOCIAL
// ===========================

function cargarRedesPerfil(){


const instagram =
document.getElementById(
"profileInstagram"
);



const tiktok =
document.getElementById(
"profileTikTok"
);



if(instagram){

instagram.value =
usuarioActual?.instagram || "";

}



if(tiktok){

tiktok.value =
usuarioActual?.tiktok || "";

}



}



// ===========================
// GUARDAR FAVORITO LOCAL
// ===========================

function guardarFavoritoLocal(id){


let favoritos =
JSON.parse(
localStorage.getItem(
"favorites"
)
) || [];



if(!favoritos.includes(id)){


favoritos.push(id);



localStorage.setItem(
"favorites",
JSON.stringify(favoritos)
);


}


}



// ===========================
// CARGAR FAVORITOS
// ===========================

function obtenerFavoritos(){


return JSON.parse(

localStorage.getItem(
"favorites"
)

) || [];


}



// ===========================
// LIMPIAR BUSQUEDA
// ===========================

function limpiarBusqueda(){


if(searchInput){

searchInput.value="";


mostrarGrupos(grupos);


}


}

// ===========================
// FINAL SCRIPT.JS - 𓆩⍣⃝ 𝙉𝙊𝘾𝙏𝙍𝘼⍣⃝ 𓆪
// ===========================


// BOTÓN HOME AL CARGAR

showPage("homePage");



// ===========================
// MANEJO DE ERRORES GLOBAL
// ===========================

window.addEventListener(
"error",
(error)=>{


console.error(
"Error NOCTRA:",
error.message
);


});



// ===========================
// PROTECCIÓN DE DATOS
// ===========================

function escaparTexto(texto){


if(!texto) return "";


return texto
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");


}



// ===========================
// FECHA DE PUBLICACIÓN
// ===========================

function tiempoTranscurrido(fecha){


if(!fecha)return "";



const ahora =
new Date();



const tiempo =
ahora - fecha;



const horas =
Math.floor(
tiempo /
(1000*60*60)
);



if(horas < 24){

return `Hace ${horas} horas`;

}



const dias =
Math.floor(
horas/24
);



return `Hace ${dias} días`;



}



// ===========================
// AUTO ACTUALIZACIÓN
// ===========================

setInterval(()=>{


cargarGrupos();


},300000);



// ===========================
// NOCTRA READY
// ===========================

console.log(
"✅ 𓆩⍣⃝ 𝙉𝙊𝘾𝙏𝙍𝘼⍣⃝ 𓆪 listo para funcionar"
);
