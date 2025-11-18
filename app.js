// app.js
// Public-facing logic for AI Cultural Canon
// Requires: Firestore + renderMarkdown() from markdownParser.js

import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/**
 * Initializes the public page logic.
 * @param {object} dependencies - Object containing required dependencies.
 *   - db: Firestore database instance
 *   - renderMarkdown: function to convert Markdown to HTML
 */
export function initializePublicPage({ db, renderMarkdown }) {
    // -------------------------------------------------------------
    // DOM references
    // -------------------------------------------------------------
    const categorySelect = document.getElementById("categorySelect");
    const personSelect = document.getElementById("personSelect");
    const showAllBtn = document.getElementById("showAllBtn");

    const cardsContainer = document.getElementById("cardsContainer");
    const emptyState = document.getElementById("emptyState");
    const cardsHeaderSub = document.getElementById("cardsHeaderSub");

    const heroYouTubeWrapper = document.getElementById("heroYouTubeWrapper");
    const heroYouTubeIframe = document.getElementById("heroYouTubeIframe");

    if (!categorySelect || !personSelect || !showAllBtn || !cardsContainer || !cardsHeaderSub) {
        console.error("Required DOM elements are missing from index.html.");
        return;
    }

    // -------------------------------------------------------------
    // Local state
    // -------------------------------------------------------------
    let categories = [];
    let people = [];

    // -------------------------------------------------------------
    // Initial load
    // -------------------------------------------------------------
    async function loadData() {
        try {
            const categoriesRef = collection(db, "categories");
            const peopleRef = collection(db, "people");

            const [catSnap, peopleSnap] = await Promise.all([
                getDocs(query(categoriesRef, orderBy("name"))),
                getDocs(peopleRef)
            ]);

            categories = catSnap.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }));

            people = peopleSnap.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }));

            // Sort people by last name (fallback to first name if needed)
            people.sort((a, b) => {
                const nameA = (a.name || "").trim();
                const nameB = (b.name || "").trim();

                const lastA = nameA.split(" ").slice(-1)[0].toLowerCase();
                const lastB = nameB.split(" ").slice(-1)[0].toLowerCase();

                if (lastA === lastB) {
                    return nameA.localeCompare(nameB);
                }
                return lastA.localeCompare(lastB);
            });

            populateCategorySelect();
            updateCardsHeaderSubForNoSelection();
            showEmptyState();
        } catch (err) {
            console.error("Error loading data:", err);
            cardsHeaderSub.textContent = "Error loading data. Please try again later.";
            showEmptyState();
            throw err;
        }
    }

    loadData().catch(err => {
        // Ensure we don't break the page if an error is thrown
        console.error("Unhandled error in loadData:", err);
    });

    // -------------------------------------------------------------
    // Select population
    // -------------------------------------------------------------
    function populateCategorySelect() {
        categorySelect.innerHTML = `<option value="">Select a category…</option>`;
        categories.forEach(cat =>
            categorySelect.insertAdjacentHTML(
                "beforeend",
                `<option value="${cat.id}">${escapeHTML(cat.name || "[No name]")}</option>`
            )
        );
    }

    function populatePersonSelect(list) {
        personSelect.innerHTML = `<option value="">Select a person…</option>`;
        list.forEach(person => {
            personSelect.insertAdjacentHTML(
                "beforeend",
                `<option value="${person.id}">${escapeHTML(person.name || "[No name]")}</option>`
            );
        });
        personSelect.disabled = list.length === 0;
    }

    // -------------------------------------------------------------
    // Event handlers
    // -------------------------------------------------------------
    categorySelect.addEventListener("change", () => {
        const categoryID = categorySelect.value;

        if (!categoryID) {
            personSelect.disabled = true;
            personSelect.innerHTML = `<option value="">Select a person…</option>`;
            updateCardsHeaderSubForNoSelection();
            showEmptyState();
            return;
        }

        const filtered = people.filter(p => p.categoryID === categoryID);
        populatePersonSelect(filtered);

        if (filtered.length === 0) {
            cardsHeaderSub.textContent = "No people found in this category yet.";
            showEmptyState();
        } else {
            cardsHeaderSub.textContent = `${filtered.length} profiles in this category. Choose one or show all.`;
            showEmptyState();
        }
    });

    personSelect.addEventListener("change", () => {
        const personID = personSelect.value;
        const categoryID = categorySelect.value;

        if (!categoryID) {
            showEmptyState();
            return;
        }

        const filtered = people.filter(p => p.categoryID === categoryID);

        if (!personID) {
            // Nothing selected: just clear cards (user can press "Show All")
            cardsHeaderSub.textContent = `${filtered.length} profiles in this category. Choose one or show all.`;
            showEmptyState();
            return;
        }

        const person = filtered.find(p => p.id === personID);
        if (!person) {
            cardsHeaderSub.textContent = "Could not find that person in this category.";
            showEmptyState();
            return;
        }

        cardsHeaderSub.textContent = `Showing ${person.name}.`;
        renderSingleCard(person);
        updateHeroYouTube(person);
    });

    showAllBtn.addEventListener("click", () => {
        const categoryID = categorySelect.value;
        if (!categoryID) {
            alert("Please select a category first.");
            return;
        }

        const filtered = people.filter(p => p.categoryID === categoryID);
        populatePersonSelect(filtered);

        if (filtered.length === 0) {
            cardsHeaderSub.textContent = "No people found in this category yet.";
            showEmptyState();
            return;
        }

        cardsHeaderSub.textContent = `Showing all ${filtered.length} profiles in this category.`;
        renderAllCards(filtered);
        updateHeroYouTube(filtered[0]);
    });

    // -------------------------------------------------------------
    // Rendering helpers
    // -------------------------------------------------------------
    function updateCardsHeaderSubForNoSelection() {
        cardsHeaderSub.textContent = "Select a category to see profiles.";
    }

    function showEmptyState() {
        cardsContainer.innerHTML = "";
        if (emptyState) {
            emptyState.classList.remove("hidden");
            cardsContainer.appendChild(emptyState);
        }
        if (heroYouTubeWrapper && heroYouTubeIframe) {
            heroYouTubeWrapper.classList.add("hidden");
            heroYouTubeIframe.src = "";
        }
    }

    function renderSingleCard(person) {
        cardsContainer.innerHTML = "";
        if (emptyState) emptyState.classList.add("hidden");
        const card = createCardElement(person);
        cardsContainer.appendChild(card);
    }

    function renderAllCards(list) {
        cardsContainer.innerHTML = "";
        if (emptyState) emptyState.classList.add("hidden");

        list.forEach(p => {
            const card = createCardElement(p);
            cardsContainer.appendChild(card);
        });
    }

    function updateHeroYouTube(person) {
        // We now embed videos directly inside each card instead of using a separate hero.
        // Keep this function as a no-op that hides the hero wrapper to avoid duplicate videos.
        if (heroYouTubeWrapper && heroYouTubeIframe) {
            heroYouTubeWrapper.classList.add("hidden");
            heroYouTubeIframe.src = "";
        }
    }

    // -------------------------------------------------------------
    // Card creation
    // -------------------------------------------------------------
    function createCardElement(person) {
        const card = document.createElement("article");
        card.className = "person-card card";
        card.innerHTML = "";
        card.setAttribute("data-person-id", person.id || "");

        // Name header (linked to Wikipedia when available)
        const nameHTML = person.wikipediaURL
            ? `<a href="${escapeHTML(person.wikipediaURL)}" target="_blank" rel="noopener noreferrer">${escapeHTML(person.name || "[No name]")}</a>`
            : escapeHTML(person.name || "[No name]");

        const titleEl = document.createElement("h3");
        titleEl.innerHTML = nameHTML;
        card.appendChild(titleEl);

        // 🔹 DOB / DOD line directly under the name
        const dateParts = [];
        if (person.dob) {
            dateParts.push(`b. ${escapeHTML(person.dob)}`);
        }
        if (person.dod) {
            dateParts.push(`d. ${escapeHTML(person.dod)}`);
        }

        if (dateParts.length > 0) {
            const metaLine = document.createElement("div");
            metaLine.className = "meta-line";
            metaLine.textContent = dateParts.join(" · ");
            card.appendChild(metaLine);
        }

        // Bio comes immediately after the name/meta
        const bioDiv = document.createElement("div");
        bioDiv.className = "bio-content";

        if (person.bioMarkdown) {
            const html = renderMarkdown(person.bioMarkdown);
            bioDiv.innerHTML = html;
        } else {
            bioDiv.textContent = "Bio coming soon.";
        }

        card.appendChild(bioDiv);

        // Optional portrait image, full-width in the card
        if (person.imageURL) {
            const imgWrapper = document.createElement("div");
            imgWrapper.className = "card-image";

            const img = document.createElement("img");
            img.src = person.imageURL;
            img.alt = `Portrait of ${person.name || "this person"}`;

            imgWrapper.appendChild(img);
            card.appendChild(imgWrapper);
        }

        // Optional YouTube video embed at the bottom of the card
        if (person.youtubeURL) {
            try {
                const url = new URL(person.youtubeURL);
                let videoId = url.searchParams.get("v");

                if (!videoId && url.pathname) {
                    const parts = url.pathname.split("/");
                    videoId = parts[parts.length - 1] || "";
                }

                if (videoId) {
                    const videoWrapper = document.createElement("div");
                    videoWrapper.className = "card-video";

                    const iframe = document.createElement("iframe");
                    iframe.src = `https://www.youtube.com/embed/${videoId}`;
                    iframe.setAttribute(
                        "title",
                        `YouTube video for ${person.name || "this person"}`
                    );
                    iframe.setAttribute(
                        "allow",
                        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    );
                    iframe.setAttribute("allowfullscreen", "");

                    videoWrapper.appendChild(iframe);
                    card.appendChild(videoWrapper);
                }
            } catch (err) {
                console.warn(
                    "Invalid YouTube URL for person",
                    person.name,
                    person.youtubeURL,
                    err
                );
            }
        }

        return card;
    }

    // -------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------
    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}