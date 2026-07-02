import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* =========================
   NOCTRA - SCRIPT BASE
========================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       SPLASH SCREEN
    ========================= */

    const splash = document.getElementById("splash");

    setTimeout(() => {

        if (splash) {

            splash.style.opacity = "0";
            splash.style.transition = "0.5s";

            setTimeout(() => {
                splash.style.display = "none";
            }, 500);

        }

    }, 1800);

    /* =========================
       MODALES
    ========================= */

    const fabButton = document.getElementById("fabButton");
    const publishModal = document.getElementById("publishModal");
    const loginModal = document.getElementById("loginModal");

    // Abrir modal publicar
    if (fabButton && publishModal) {

        fabButton.addEventListener("click", () => {

            publishModal.style.display = "flex";

        });

    }

    // Cerrar modal al hacer click fuera
    window.addEventListener("click", (e) => {

        if (e.target === publishModal) {
            publishModal.style.display = "none";
        }

        if (e.target === loginModal) {
            loginModal.style.display = "none";
        }

    });

    /* =========================
       LOGIN ICON
    ========================= */

    const profileBtn = document.getElementById("profileBtn");

    if (profileBtn && loginModal) {

        profileBtn.addEventListener("click", () => {

            loginModal.style.display = "flex";

        });

    }

});

/* =========================
   SEARCH FUNCTION
========================= */

const searchInput = document.getElementById("searchInput");

const groupCards = document.querySelectorAll(".groupCard");

if (searchInput) {

    searchInput.addEventListener("input", (e) => {

        const value = e.target.value.toLowerCase();

        groupCards.forEach(card => {

            const text = card.innerText.toLowerCase();

            if (text.includes(value)) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }

        });

    });

}

/* =========================
   CATEGORY FILTER
========================= */

const categories = document.querySelectorAll(".category");

if (categories) {

    categories.forEach(cat => {

        cat.addEventListener("click", () => {

            const value = cat.innerText.toLowerCase();

            groupCards.forEach(card => {

                const text = card.innerText.toLowerCase();

                if (text.includes(value) || value === "todos") {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }

            });

        });

    });

}

/* =========================
   NAVIGATION ACTIVE STATE
========================= */

const navItems = document.querySelectorAll(".navItem");

navItems.forEach(item => {

    item.addEventListener("click", () => {

        navItems.forEach(i => i.classList.remove("active"));

        item.classList.add("active");

    });

});

/* =========================
   FAVORITOS (LOCAL STORAGE)
========================= */

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const joinButtons = document.querySelectorAll(".joinBtn");

joinButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        const card = btn.closest(".groupCard");

        const title = card.querySelector("h3").innerText;

        const exists = favorites.includes(title);

        if (!exists) {

            favorites.push(title);
            localStorage.setItem("favorites", JSON.stringify(favorites));

            btn.innerText = "✔ Agregado";

            setTimeout(() => {
                btn.innerText = "Unirse";
            }, 1500);

        } else {

            favorites = favorites.filter(f => f !== title);
            localStorage.setItem("favorites", JSON.stringify(favorites));

            btn.innerText = "Unirse";

        }

    });

});

/* =========================
   PUBLICAR GRUPO (FIREBASE)
========================= */

const publishForm = document.getElementById("publishForm");

if (publishForm) {

    publishForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("groupName").value.trim();
        const desc = document.getElementById("groupDescription").value.trim();
        const category = document.getElementById("groupCategory").value;
        const link = document.getElementById("groupLink").value.trim();

        if (!name || !desc || !category || !link) return;

        try {

            await addDoc(collection(db, "groups"), {

                name,
                description: desc,
                category,
                link,
                createdAt: new Date()

            });

            alert("Grupo publicado correctamente.");

            publishForm.reset();

            document.getElementById("publishModal").style.display = "none";

        } catch (error) {

            console.error(error);

            alert("Error al publicar el grupo.");

        }

    });

}

async function cargarGrupos() {

    const groupList = document.querySelector(".groupList");

    if (!groupList) return;

    const snapshot = await getDocs(collection(db, "groups"));

    snapshot.forEach((doc) => {

        const grupo = doc.data();

        const card = document.createElement("div");

        card.className = "groupCard";

        card.innerHTML = `
            <div class="groupImage">
                <img src="https://placehold.co/120x120/png" alt="Grupo">
            </div>
            <div class="groupInfo">
                <h3>${grupo.name}</h3>
                <p>${grupo.category}</p>
                <a href="${grupo.link}" target="_blank">
                    <button class="joinBtn">Unirse</button>
                </a>
            </div>
        `;

        groupList.prepend(card);

    });

}

cargarGrupos();
