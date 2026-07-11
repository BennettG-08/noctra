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


