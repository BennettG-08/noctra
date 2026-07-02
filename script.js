/* ==========================================================
   NOCTRA
   Archivo: script.js
   Versión: 1.0
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Splash Screen
    const splash = document.getElementById("splashScreen");

    setTimeout(() => {

        if (splash) {

            splash.style.opacity = "0";

            splash.style.transition = "0.6s";

            setTimeout(() => {

                splash.style.display = "none";

            }, 600);

        }

    }, 1800);

    // Botón flotante
    const fabButton = document.getElementById("fabButton");
    const publishModal = document.getElementById("publishModal");

    if (fabButton && publishModal) {

        fabButton.addEventListener("click", () => {

            publishModal.style.display = "flex";

        });

    }

    // Abrir login
    const loginModal = document.getElementById("loginModal");
    const userIcon = document.querySelector(".fa-user");

    if (userIcon && loginModal) {

        userIcon.addEventListener("click", () => {

            loginModal.style.display = "flex";

        });

    }

    // Cerrar modales al tocar fuera
    window.addEventListener("click", (e) => {

        if (e.target === publishModal) {

            publishModal.style.display = "none";

        }

        if (e.target === loginModal) {

            loginModal.style.display = "none";

        }

    });

});
