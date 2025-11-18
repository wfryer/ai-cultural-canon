// admin.js
// Admin CRUD logic for AI Cultural Canon
// Handles Authentication, Categories, People, Firestore writes

import {
    collection,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/**
 * Initializes the admin page logic.
 * @param {object} dependencies - Object containing required dependencies.
 * @param {Firestore} dependencies.db - The initialized Firestore instance.
 * @param {Auth} dependencies.auth - The initialized Auth instance.
 */
export function initializeAdminPage({ db, auth }) {

    // DOM elements (using required IDs)
    const loginSection = document.getElementById("loginSection"); // REQUIRED ID
    const adminSection = document.getElementById("adminSection"); // REQUIRED ID

    const emailInput = document.getElementById("emailInput"); // REQUIRED ID
    const passwordInput = document.getElementById("passwordInput"); // REQUIRED ID
    const loginBtn = document.getElementById("loginBtn"); // REQUIRED ID
    const logoutBtn = document.getElementById("logoutBtn"); // REQUIRED ID (Added)
    const loginError = document.getElementById("loginError");

    // Category fields
    const categoryNameInput = document.getElementById("categoryNameInput");
    const categoryDescInput = document.getElementById("categoryDescInput");
    const categoryEditID = document.getElementById("categoryEditID");
    const saveCategoryBtn = document.getElementById("saveCategoryBtn");
    const cancelCategoryEditBtn = document.getElementById("cancelCategoryEditBtn");
    const categoriesTableBody = document.querySelector("#categoriesTable tbody");

    // People fields (using required IDs)
    const personNameInput = document.getElementById("personNameInput");
    const personDOBInput = document.getElementById("personDOBInput");
    const personDODInput = document.getElementById("personDODInput");
    const personWikipediaInput = document.getElementById("personWikipediaInput");
    const personImageInput = document.getElementById("personImageInput");
    const personYouTubeInput = document.getElementById("personYouTubeInput");
    const personCategorySelect = document.getElementById("personCategorySelect");
    const personTagsInput = document.getElementById("personTagsInput");
    const personBioInput = document.getElementById("personBioInput");
    const personEditID = document.getElementById("personEditID");
    const savePersonBtn = document.getElementById("savePersonBtn");
    const cancelPersonEditBtn = document.getElementById("cancelPersonEditBtn");
    const peopleTableBody = document.querySelector("#peopleTable tbody");

    // Data caches
    let categories = [];
    let people = [];

    // ---------------------------------------------------------
    // LOGIN/LOGOUT SYSTEM
    // ---------------------------------------------------------
    loginBtn.addEventListener("click", async () => {
        loginError.textContent = "";
        try {
            // Note: Use your actual Firebase Auth user credentials here
            await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        } catch (err) {
            loginError.textContent = err.message;
        }
    });

    // Logout function (Bound to #logoutBtn in admin.html)
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error("Logout failed:", err);
        }
    });

    // Authentication state listener
    onAuthStateChanged(auth, user => {
        if (user) {
            loginSection.style.display = "none";
            adminSection.style.display = "block";
            initAdminData();
        } else {
            adminSection.style.display = "none";
            loginSection.style.display = "block";
        }
    });

    // ---------------------------------------------------------
    // INITIAL LOAD
    // ---------------------------------------------------------
    function initAdminData() {
        // Loads data in real-time and populates tables/dropdowns
        loadCategoriesRealtime();
        loadPeopleRealtime();
    }

    // ---------------------------------------------------------
    // CATEGORY CRUD
    // ---------------------------------------------------------

    function loadCategoriesRealtime() {
        const colRef = collection(db, "categories");
        onSnapshot(colRef, snap => {
            categories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            categories.sort((a, b) => a.name.localeCompare(b.name));
            populateCategoryTable();
            populateCategoryDropdown();
        });
    }

    function populateCategoryTable() {
        categoriesTableBody.innerHTML = "";
        categories.forEach(cat => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${cat.name}</td>
                <td>${cat.description || ""}</td>
                <td>${cat.updatedAt?.toDate?.().toLocaleString?.() || ""}</td>
                <td>
                    <button class="small-btn" data-edit-cat="${cat.id}">Edit</button>
                    <button class="small-btn delete-btn" data-delete-cat="${cat.id}">Delete</button>
                </td>
            `;

            categoriesTableBody.appendChild(tr);
        });

        categoriesTableBody.querySelectorAll("[data-edit-cat]").forEach(btn => {
            btn.onclick = () => editCategory(btn.dataset.editCat);
        });

        categoriesTableBody.querySelectorAll("[data-delete-cat]").forEach(btn => {
            btn.onclick = () => deleteCategory(btn.dataset.deleteCat);
        });
    }

    function populateCategoryDropdown() {
        personCategorySelect.innerHTML = "";
        categories.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.id;
            opt.textContent = cat.name;
            personCategorySelect.appendChild(opt);
        });
    }

    async function editCategory(id) {
        const data = categories.find(c => c.id === id);
        if (!data) return;

        categoryNameInput.value = data.name;
        categoryDescInput.value = data.description || "";
        categoryEditID.value = id;
    }

    async function deleteCategory(id) {
        if (!confirm("Delete this category? This is permanent and may break associated people records.")) return;
        await deleteDoc(doc(db, "categories", id));
    }

    saveCategoryBtn.addEventListener("click", async () => {
        const name = categoryNameInput.value.trim();
        const desc = categoryDescInput.value.trim();

        if (!name) {
            alert("Category name required.");
            return;
        }

        const data = {
            name,
            description: desc,
            updatedAt: serverTimestamp()
        };

        const editID = categoryEditID.value;

        try {
            if (editID) {
                await updateDoc(doc(db, "categories", editID), data);
            } else {
                data.createdAt = serverTimestamp();
                await addDoc(collection(db, "categories"), data);
            }
            // Clear form on success
            categoryNameInput.value = "";
            categoryDescInput.value = "";
            categoryEditID.value = "";
        } catch (err) {
            alert("Error saving category: " + err.message);
        }
    });

    cancelCategoryEditBtn.addEventListener("click", () => {
        categoryNameInput.value = "";
        categoryDescInput.value = "";
        categoryEditID.value = "";
    });

    // ---------------------------------------------------------
    // PEOPLE CRUD
    // ---------------------------------------------------------

    function loadPeopleRealtime() {
        const colRef = collection(db, "people");

        onSnapshot(colRef, snap => {
            people = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            people.sort((a, b) => {
                const lastA = a.name.split(" ").slice(-1)[0];
                const lastB = b.name.split(" ").slice(-1)[0];
                return lastA.localeCompare(lastB);
            });
            populatePeopleTable();
        });
    }

    function populatePeopleTable() {
        peopleTableBody.innerHTML = "";
        people.forEach(p => {
            const cat = categories.find(c => c.id === p.categoryID);
            const catName = cat ? cat.name : "";

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${p.name}</td>
                <td>${catName}</td>
                <td>${p.updatedAt?.toDate?.().toLocaleString?.() || ""}</td>
                <td>
                    <button class="small-btn" data-edit-person="${p.id}">Edit</button>
                    <button class="small-btn delete-btn" data-delete-person="${p.id}">Delete</button>
                </td>
            `;

            peopleTableBody.appendChild(tr);
        });

        peopleTableBody.querySelectorAll("[data-edit-person]").forEach(btn => {
            btn.onclick = () => editPerson(btn.dataset.editPerson);
        });

        peopleTableBody.querySelectorAll("[data-delete-person]").forEach(btn => {
            btn.onclick = () => deletePerson(btn.dataset.deletePerson);
        });
    }

    async function editPerson(id) {
        const p = people.find(x => x.id === id);
        if (!p) return;

        personNameInput.value = p.name;
        personDOBInput.value = p.dob || "";
        personDODInput.value = p.dod || "";
        personWikipediaInput.value = p.wikipediaURL || "";
        personImageInput.value = p.imageURL || "";
        personYouTubeInput.value = p.youtubeURL || "";
        personCategorySelect.value = p.categoryID || "";
        personTagsInput.value = (p.tags || []).join(", ");
        personBioInput.value = p.bioMarkdown || "";

        personEditID.value = id;
    }

    async function deletePerson(id) {
        if (!confirm("Delete this person?")) return;
        await deleteDoc(doc(db, "people", id));
    }

    savePersonBtn.addEventListener("click", async () => {
        const name = personNameInput.value.trim();
        const wikipediaURL = personWikipediaInput.value.trim();
        const dob = personDOBInput.value.trim();
        const dod = personDODInput.value.trim();
        const imageURL = personImageInput.value.trim();
        const youtubeURL = personYouTubeInput.value.trim();
        const categoryID = personCategorySelect.value;
        const tags = personTagsInput.value.split(",").map(t => t.trim()).filter(t => t !== "");
        const bioMarkdown = personBioInput.value;

        if (!name) {
            alert("Name is required.");
            return;
        }
        if (!wikipediaURL) {
            alert("Wikipedia link required.");
            return;
        }

        const data = {
            name,
            dob: dob || "",
            dod: dod || "",
            wikipediaURL,
            imageURL: imageURL || "",
            youtubeURL: youtubeURL || "",
            categoryID,
            tags,
            bioMarkdown,
            updatedAt: serverTimestamp()
        };

        const editID = personEditID.value;

        try {
            if (editID) {
                await updateDoc(doc(db, "people", editID), data);
            } else {
                data.createdAt = serverTimestamp();
                await addDoc(collection(db, "people"), data);
            }

            // Clear form
            personNameInput.value = "";
            personDOBInput.value = "";
            personDODInput.value = "";
            personWikipediaInput.value = "";
            personImageInput.value = "";
            personYouTubeInput.value = "";
            personCategorySelect.value = "";
            personTagsInput.value = "";
            personBioInput.value = "";
            personEditID.value = "";
        } catch (err) {
            alert("Error saving person: " + err.message);
        }
    });

    cancelPersonEditBtn.addEventListener("click", () => {
        personNameInput.value = "";
        personDOBInput.value = "";
        personDODInput.value = "";
        personWikipediaInput.value = "";
        personImageInput.value = "";
        personYouTubeInput.value = "";
        personCategorySelect.value = "";
        personTagsInput.value = "";
        personBioInput.value = "";
        personEditID.value = "";
    });

}