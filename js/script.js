const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("nav");

if (menuToggle && nav) {
    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
}

document.querySelectorAll(".expand-btn").forEach(button => {
    const content = button.nextElementSibling;

    if (!content || !content.classList.contains("hidden-content")) return;

    const originalText = button.textContent.trim();

    button.addEventListener("click", () => {
        const isHidden = content.style.display === "none" || content.style.display === "";

        if (isHidden) {
            content.style.display = "block";
            button.textContent = "Hide Evidence";
            button.setAttribute("aria-expanded", "true");
        } else {
            content.style.display = "none";
            button.textContent = originalText;
            button.setAttribute("aria-expanded", "false");
        }
    });
});

const backTop = document.createElement("button");
backTop.className = "back-to-top";
backTop.type = "button";
backTop.innerHTML = "↑ <span>TOP</span>";
backTop.setAttribute("aria-label", "Back to top");
document.body.appendChild(backTop);

window.addEventListener("scroll", () => {
    backTop.classList.toggle("visible", window.scrollY > 450);
}, { passive: true });

backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

const progress = document.createElement("div");
progress.className = "scroll-progress";
progress.innerHTML = "<span></span>";
document.body.appendChild(progress);
const progressBar = progress.querySelector("span");

function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

const viewerImages = document.querySelectorAll(".trial-character-image, .analysis-panel > img");

if (viewerImages.length) {
    const overlay = document.createElement("div");
    overlay.className = "image-viewer";
    overlay.innerHTML = `
        <button class="image-viewer-close" type="button" aria-label="Close image">×</button>
        <img src="" alt="Expanded image">
        <p>CLICK ANYWHERE TO CLOSE</p>
    `;
    document.body.appendChild(overlay);

    const viewerImage = overlay.querySelector("img");

    viewerImages.forEach(image => {
        image.setAttribute("tabindex", "0");
        image.setAttribute("role", "button");
        image.setAttribute("aria-label", "Open image");

        const openImage = () => {
            viewerImage.src = image.currentSrc || image.src;
            viewerImage.alt = image.alt || "Expanded MILGRAM image";
            overlay.classList.add("open");
            document.body.classList.add("viewer-open");
        };

        image.addEventListener("click", openImage);
        image.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openImage();
            }
        });
    });

    const closeViewer = () => {
        overlay.classList.remove("open");
        document.body.classList.remove("viewer-open");
    };

    overlay.addEventListener("click", event => {
        if (event.target === overlay || event.target.classList.contains("image-viewer-close")) {
            closeViewer();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeViewer();
    });
}

const prisonerSearch = document.querySelector("#prisoner-search");
const prisonerCards = [...document.querySelectorAll(".prisoner-card")];
const prisonerEmpty = document.querySelector("#prisoner-empty");

if (prisonerSearch && prisonerCards.length) {
    const filterCards = () => {
        const query = prisonerSearch.value.trim().toLowerCase();
        let visible = 0;

        prisonerCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const matches = !query || text.includes(query);
            card.classList.toggle("is-filtered-out", !matches);
            if (matches) visible++;
        });

        if (prisonerEmpty) prisonerEmpty.hidden = visible !== 0;
    };

    prisonerSearch.addEventListener("input", filterCards);
}

const verdictFilters = document.querySelectorAll("[data-verdict-filter]");
const personalVerdicts = [...document.querySelectorAll(".personal-verdict")];
const verdictEmpty = document.querySelector("#verdict-empty");

if (verdictFilters.length && personalVerdicts.length) {
    verdictFilters.forEach(button => {
        button.addEventListener("click", () => {
            verdictFilters.forEach(item => item.classList.remove("selected"));
            button.classList.add("selected");

            const filter = button.dataset.verdictFilter;
            let visible = 0;

            personalVerdicts.forEach(card => {
                const verdict = card.dataset.verdict || "";
                const matches = filter === "all" || verdict === filter;
                card.classList.toggle("is-filtered-out", !matches);
                if (matches) visible++;
            });

            if (verdictEmpty) verdictEmpty.hidden = visible !== 0;
        });
    });
}
