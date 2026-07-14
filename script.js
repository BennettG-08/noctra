// ==========================
// 𓆩⍣⃝ 𝙉𝙊𝘾𝙏𝙍𝘼⍣⃝ 𓆪 v2
// SCRIPT PRINCIPAL
// ==========================


import { db, auth } from "./firebase.js";


// FIRESTORE

import {

    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    orderBy,
    updateDoc,
    increment,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



// AUTH

import {

    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";





// ==========================
// VARIABLES
// ==========================


const provider = new GoogleAuthProvider();


let currentUser = null;


let allGroups = [];


let currentGroup = null;


let favorites = JSON.parse(

    localStorage.getItem("noctraFavorites")

) || [];





// ==========================
// ELEMENTOS
// ==========================


const splash = document.getElementById("splash");


const searchInput = document.getElementById("searchInput");


const featuredGroups = document.getElementById("featuredGroups");


const latestGroups = document.getElementById("latestGroups");


const exploreGroups = document.getElementById("exploreGroups");


const favoritesGroups = document.getElementById("favoritesGroups");


const publishModal = document.getElementById("publishModal");


const addGroupBtn = document.getElementById("addGroupBtn");


const closeModalBtn = document.getElementById("closeModalBtn");


const publishForm = document.getElementById("publishForm");


const loginBtn = document.getElementById("loginBtn");


const logoutBtn = document.getElementById("logoutBtn");



const userPhoto = document.getElementById("userPhoto");


const userName = document.getElementById("userName");


const userEmail = document.getElementById("userEmail");


const followersCount = document.getElementById("followersCount");

// ==========================
// SPLASH
// ==========================


window.addEventListener(
"load",
()=>{

    setTimeout(()=>{

        splash.style.display="none";

    },1500);


});





// ==========================
// CARGAR GRUPOS
// ==========================


async function loadGroups(){


    try{


        const groupsRef = collection(
            db,
            "groups"
        );


        const snapshot = await getDocs(
            query(
                groupsRef,
                orderBy(
                    "createdAt",
                    "desc"
                )
            )
        );



        allGroups=[];



        snapshot.forEach((item)=>{


            allGroups.push({

                id:item.id,

                ...item.data()

            });


        });



        renderGroups();



    }catch(error){


        console.error(
            "Error cargando grupos:",
            error
        );


    }


}






// ==========================
// MOSTRAR GRUPOS
// ==========================


function createGroupCard(group){



    return `


<div class="group-card">


<img
src="${group.image || "https://placehold.co/600x300"}"
>



<h3>
${group.name}
</h3>



<p>
${group.description || "Sin descripción"}
</p>



<div class="group-info">


<span class="group-category">

${group.category || "Otros"}

</span>



<div class="group-actions">


<button onclick="openGroup('${group.id}')">

Ver

</button>



<button onclick="addFavorite('${group.id}')">

❤️

</button>


</div>


</div>


</div>


`;



}






function renderGroups(){


    const html = allGroups
    .map(group=>createGroupCard(group))
    .join("");



    if(featuredGroups){

        featuredGroups.innerHTML=html;

    }



    if(latestGroups){

        latestGroups.innerHTML=html;

    }



    if(exploreGroups){

        exploreGroups.innerHTML=html;

    }



}






// iniciar

loadGroups();

// ==========================
// BUSCADOR
// ==========================


searchInput.addEventListener(
"input",
()=>{


    const text = searchInput.value
    .toLowerCase()
    .trim();



    const filtered = allGroups.filter(
    (group)=>{


        return (

            group.name
            .toLowerCase()
            .includes(text)

            ||

            group.category
            ?.toLowerCase()
            .includes(text)

        );


    });



    const html = filtered
    .map(group=>createGroupCard(group))
    .join("");



    exploreGroups.innerHTML = html;



});







// ==========================
// CATEGORÍAS
// ==========================


document
.querySelectorAll(".category-btn")
.forEach(
(button)=>{


button.addEventListener(
"click",
()=>{


    const category =
    button.dataset.category;



    const filtered =
    allGroups.filter(
    group=>

        group.category === category

    );



    exploreGroups.innerHTML = filtered
    .map(group=>createGroupCard(group))
    .join("");



    showPage(
        "explorePage"
    );


});


});








// ==========================
// NAVEGACIÓN
// ==========================


const pages = [

"homePage",
"explorePage",
"favoritesPage",
"profilePage"

];




function showPage(page){



    pages.forEach(
    item=>{


        const element =
        document.getElementById(item);



        if(element){

            element.style.display =
            item === page
            ? "block"
            : "none";

        }


    });



}






document
.querySelectorAll(".nav-btn")
.forEach(
button=>{


button.addEventListener(
"click",
()=>{


    const page =
    button.dataset.page;



    showPage(page);



    document
    .querySelectorAll(".nav-btn")
    .forEach(btn=>

        btn.classList.remove(
            "active"
        )

    );



    button.classList.add(
        "active"
    );


});


});

// ==========================
// PUBLICAR GRUPO
// ==========================


addGroupBtn.addEventListener(
"click",
()=>{

    publishModal.style.display="flex";

});





closeModalBtn.addEventListener(
"click",
()=>{

    publishModal.style.display="none";

});







publishForm.addEventListener(
"submit",
async(e)=>{


e.preventDefault();



if(!currentUser){

    alert(
    "Debes iniciar sesión para publicar"
    );

    return;

}




const groupData = {


    name:
    document.getElementById(
        "groupName"
    ).value,



    image:
    document.getElementById(
        "groupImage"
    ).value
    ||
    "https://placehold.co/600x300",




    category:
    document.getElementById(
        "groupCategory"
    ).value,




    description:
    document.getElementById(
        "groupDescription"
    ).value,




    link:
    document.getElementById(
        "groupLink"
    ).value,




    creator:
    currentUser.uid,



    creatorName:
    currentUser.displayName,



    views:0,



    createdAt:
    Date.now()


};




try{


await addDoc(

    collection(
        db,
        "groups"
    ),

    groupData

);




alert(
"Grupo publicado correctamente"
);



publishForm.reset();



publishModal.style.display="none";



loadGroups();



}catch(error){


console.error(
error
);



alert(
"No se pudo publicar"
);


}



});

// ==========================
// LOGIN GOOGLE
// ==========================


loginBtn.addEventListener(
"click",
async()=>{


try{


const result =
await signInWithPopup(
    auth,
    provider
);



currentUser =
result.user;



saveUser(
    currentUser
);



}catch(error){


console.error(
error
);


}



});






// ==========================
// ESTADO DEL USUARIO
// ==========================


onAuthStateChanged(
auth,
(user)=>{


if(user){


currentUser=user;



userPhoto.src =
user.photoURL
||
"https://placehold.co/150x150";



userName.textContent =
user.displayName
||
"Usuario";



userEmail.textContent =
user.email;



loginBtn.classList.add(
"hidden"
);



logoutBtn.classList.remove(
"hidden"
);



loadUserData();



}else{


currentUser=null;



userPhoto.src =
"https://placehold.co/150x150";



userName.textContent =
"Usuario";



userEmail.textContent =
"Inicia sesión para continuar";



loginBtn.classList.remove(
"hidden"
);



logoutBtn.classList.add(
"hidden"
);



}



});







// ==========================
// GUARDAR USUARIO
// ==========================


async function saveUser(user){


const userRef =
doc(
db,
"users",
user.uid
);



await updateDoc(
userRef,
{

    name:
    user.displayName,

    email:
    user.email,

    photo:
    user.photoURL

}

).catch(
async()=>{


await addDoc(
collection(
db,
"users"
),
{

    uid:user.uid,

    name:
    user.displayName,

    email:
    user.email,

    photo:
    user.photoURL,

    followers:0

}

);


});



}






// ==========================
// CARGAR PERFIL
// ==========================


async function loadUserData(){


const userRef =
doc(
db,
"users",
currentUser.uid
);



const snap =
await getDoc(
userRef
);



if(snap.exists()){


followersCount.textContent =

snap.data().followers || 0;


}



}




// ==========================
// CERRAR SESIÓN
// ==========================


logoutBtn.addEventListener(
"click",
()=>{


signOut(auth);


});

// ==========================
// FAVORITOS
// ==========================


window.addFavorite = function(id){


    if(
        favorites.includes(id)
    ){


        favorites =
        favorites.filter(
        item=>item!==id
        );


    }else{


        favorites.push(id);


    }



    localStorage.setItem(
        "noctraFavorites",
        JSON.stringify(favorites)
    );



    loadFavorites();


};






async function loadFavorites(){


if(!favoritesGroups)
return;



const favoriteGroups =
allGroups.filter(
group=>

favorites.includes(
group.id
)

);



favoritesGroups.innerHTML =

favoriteGroups
.map(
group=>

createGroupCard(group)

)
.join("")
||
"<p>No tienes favoritos todavía</p>";



}







// ==========================
// ABRIR DETALLE DEL GRUPO
// ==========================


window.openGroup = async function(id){



const group =
allGroups.find(
item=>

item.id === id

);



if(!group)
return;




currentGroup =
group;



document.getElementById(
"detailImage"
).src =

group.image
||
"https://placehold.co/600x300";



document.getElementById(
"detailName"
).textContent =

group.name;



document.getElementById(
"detailCategory"
).textContent =

group.category;



document.getElementById(
"detailDescription"
).textContent =

group.description;



document.getElementById(
"detailViews"
).textContent =

group.views || 0;



showPage(
"groupDetailsPage"
);



increaseViews(
id
);



};






// ==========================
// AUMENTAR VISTAS
// ==========================


async function increaseViews(id){


const ref =
doc(
db,
"groups",
id
);



await updateDoc(
ref,
{

views:
increment(1)

}

);



}




// ==========================
// VOLVER
// ==========================


document
.getElementById(
"backBtn"
)
.addEventListener(
"click",
()=>{


showPage(
"homePage"
);



});

// ==========================
// UNIRSE AL GRUPO
// ==========================


document
.getElementById("joinGroupBtn")
.addEventListener(
"click",
()=>{


if(currentGroup?.link){


window.open(
currentGroup.link,
"_blank"
);


}


});






// ==========================
// FAVORITO DESDE DETALLE
// ==========================


document
.getElementById("favoriteBtn")
.addEventListener(
"click",
()=>{


if(currentGroup){


addFavorite(
currentGroup.id
);


}



});






// ==========================
// COMENTARIOS
// ==========================


const commentInput =
document.getElementById(
"commentInput"
);


const sendCommentBtn =
document.getElementById(
"sendCommentBtn"
);



sendCommentBtn.addEventListener(
"click",
async()=>{


if(!currentUser){


alert(
"Debes iniciar sesión"
);


return;


}



if(
!commentInput.value.trim()
)

return;





await addDoc(
collection(
db,
"comments"
),
{


groupId:
currentGroup.id,


user:
currentUser.displayName,


photo:
currentUser.photoURL,


text:
commentInput.value,


createdAt:
serverTimestamp()


}

);



commentInput.value="";



alert(
"Comentario enviado"
);



});







// ==========================
// CARGA INICIAL
// ==========================


loadFavorites();

showPage(
"homePage"
);
