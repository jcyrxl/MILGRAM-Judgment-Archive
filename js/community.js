import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDMahPg83kYJorSLKolRGKHfwXPuRcizzM",
    authDomain: "communityposts-f15a4.firebaseapp.com",
    projectId: "communityposts-f15a4",
    storageBucket: "communityposts-f15a4.firebasestorage.app",
    messagingSenderId: "958341557918",
    appId: "1:958341557918:web:1f90348de3bfd32a3fd58f"
};

const isConfigured = Object.values(firebaseConfig).every(
    value => value && !value.includes("PASTE_YOUR")
);

const form = document.querySelector("#community-form");
const list = document.querySelector("#community-list");
const status = document.querySelector("#community-status");
const empty = document.querySelector("#community-empty");

const filterButtons = document.querySelectorAll("[data-community-filter]");
const typeSelect = document.querySelector("#post-type");
const prisonerSelect = document.querySelector("#post-prisoner");
const trialSelect = document.querySelector("#post-trial");
const nameInput = document.querySelector("#post-name");
const messageInput = document.querySelector("#post-message");

let posts = [];
let activeFilter = "ALL";

if (!isConfigured) {

    status.textContent =
        "DATABASE NOT CONNECTED — CHECK FIREBASE CONFIG";

    status.classList.add("status-warning");

    form?.querySelector("button[type='submit']")
        ?.setAttribute("disabled", "true");

} else {

    try {

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        const communityRef = collection(db, "communityPosts");

        console.log("Firebase initialized successfully.");
        console.log("Firestore collection:", "communityPosts");

        onSnapshot(
            communityRef,

            snapshot => {

                console.log(
                    "Firestore snapshot received:",
                    snapshot.size,
                    "documents"
                );

                posts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                renderPosts();

                status.textContent =
                    "LIVE DATABASE // REAL-TIME SYNC ACTIVE";

                status.classList.remove("status-warning");
            },

            error => {

                console.error(
                    "Firestore listener error:",
                    error
                );

                status.textContent =
                    "DATABASE ERROR — " + error.code;

                status.classList.add("status-warning");
            }
        );

        form?.addEventListener("submit", async event => {

            event.preventDefault();

            const name = nameInput.value.trim();
            const type = typeSelect.value;
            const prisoner = prisonerSelect.value;
            const trial = trialSelect.value;
            const message = messageInput.value.trim();

            const submitButton =
                form.querySelector("button[type='submit']");


            // Check required fields

            if (!name || !type || !prisoner || !trial || !message) {

                status.textContent =
                    "PLEASE COMPLETE ALL REQUIRED FIELDS";

                status.classList.add("status-warning");

                return;
            }


            submitButton.disabled = true;
            submitButton.textContent = "SUBMITTING...";

            status.textContent =
                "SUBMITTING ENTRY TO FIRESTORE...";

            status.classList.remove("status-warning");


            try {

                console.log("Attempting Firestore write...");

                const docRef = await addDoc(
                    communityRef,
                    {
                        name: name,
                        type: type,
                        prisoner: prisoner,
                        trial: trial,
                        message: message,
                        createdAt: serverTimestamp()
                    }
                );


                console.log(
                    "SUCCESS! Document ID:",
                    docRef.id
                );


                form.reset();

                status.textContent =
                    "ENTRY RECORDED // COMMUNITY ARCHIVE UPDATED";

                status.classList.remove("status-warning");


            } catch (error) {

                console.error(
                    "FIRESTORE WRITE ERROR:",
                    error
                );

                status.textContent =
                    "SUBMISSION FAILED — " +
                    error.code;

                status.classList.add("status-warning");

                alert(
                    "Firestore Error:\n\n" +
                    error.code +
                    "\n\n" +
                    error.message
                );

            } finally {

                submitButton.disabled = false;

                submitButton.textContent =
                    "SUBMIT TO ARCHIVE →";
            }

        });

    } catch (error) {

        console.error(
            "Firebase initialization error:",
            error
        );

        status.textContent =
            "FIREBASE INITIALIZATION FAILED";

        status.classList.add("status-warning");
    }
}

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(item =>
            item.classList.remove("selected")
        );

        button.classList.add("selected");

        activeFilter =
            button.dataset.communityFilter;

        renderPosts();
    });

});

function renderPosts() {

    if (!list) return;

    list.innerHTML = "";

    const filtered =
        activeFilter === "ALL"
            ? posts
            : posts.filter(
                post => post.type === activeFilter
            );


    if (!filtered.length) {

        if (empty)
            empty.hidden = false;

        return;
    }


    if (empty)
        empty.hidden = true;


    filtered.forEach(post => {

        const article =
            document.createElement("article");

        article.className =
            "community-post";


        const safeName =
            post.name || "ANONYMOUS";

        const safeType =
            post.type || "DISCUSSION";

        const safePrisoner =
            post.prisoner || "ALL PRISONERS";

        const safeTrial =
            post.trial || "ALL TRIALS";


        article.innerHTML = `
            <div class="community-post-top">
                <span class="community-tag">
                    ${escapeHTML(safeType)}
                </span>
            </div>

            <h3>
                ${escapeHTML(safePrisoner)}
            </h3>

            <div class="community-meta">
                ${escapeHTML(safeTrial)}
                // BY
                ${escapeHTML(safeName)}
            </div>

            <p>
                ${escapeHTML(post.message || "")}
            </p>
        `;


        list.appendChild(article);

    });

}

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}