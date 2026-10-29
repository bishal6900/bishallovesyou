const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Add a picture by changing the matching entry to "assets/photos/your-file.jpg".
// Keep "#" for any slot you want to leave as a placeholder.
const photoMap = {
  hero: "assets/photos/hero.jpg",
  "memory-1": "assets/photos/memory-1.jpg",
  "memory-2": "assets/photos/memory-2.jpg",
  // Reuse the two memory photos so you only need five pictures total.
  "memory-3": "assets/photos/memory-1.jpg",
  "memory-4": "assets/photos/memory-2.jpg",
  letter: "assets/photos/memory-2.jpg",
  meeting: "assets/photos/first-meeting.jpg",
  proposal: "assets/photos/proposal.jpg"
};

function applyPhotos() {
  $$("[data-photo]").forEach((slot) => {
    const key = slot.dataset.photo;
    const path = photoMap[key];
    if (path && path !== "#") {
      const image = new Image();
      image.onload = () => {
        slot.style.backgroundImage = `url("${path}")`;
        slot.classList.add("has-photo");
        slot.setAttribute("data-loaded-photo", "true");
      };
      image.onerror = () => console.warn(`Photo not found for ${key}: ${path}`);
      image.src = path;
    }
  });
}

// Mobile navigation
const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});
$$("#navLinks a").forEach((link) => link.addEventListener("click", () => {
  navLinks.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}));

// Gentle reveal-on-scroll; the site remains readable if observers are unavailable.
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((element) => observer.observe(element));
} else {
  $$(".reveal").forEach((element) => element.classList.add("is-visible"));
}

// Photo lightbox. Placeholder tiles can be previewed too, so they are easy to find.
const photoModal = $("#photoModal");
const modalContent = $("#modalContent");
const closePhotoModal = $("#closePhotoModal");
let lastFocusedElement = null;
function openPhoto(slot) {
  lastFocusedElement = document.activeElement;
  modalContent.replaceChildren();
  const preview = document.createElement("div");
  preview.className = "photo-slot";
  const key = slot.dataset.photo;
  const path = photoMap[key];
  if (path && path !== "#" && slot.dataset.loadedPhoto === "true") {
    preview.classList.add("has-photo");
    preview.style.backgroundImage = `url("${path}")`;
  } else {
    const hash = document.createElement("span");
    hash.className = "photo-hash";
    hash.textContent = "#";
    const caption = document.createElement("span");
    caption.className = "photo-caption";
    caption.textContent = slot.querySelector(".photo-caption")?.textContent || "your photo goes here";
    preview.append(hash, caption);
  }
  modalContent.append(preview);
  photoModal.hidden = false;
  document.body.classList.add("modal-open");
  closePhotoModal.focus();
}
function closePhoto() {
  photoModal.hidden = true;
  document.body.classList.remove("modal-open");
  if (lastFocusedElement) lastFocusedElement.focus();
}
$$(".memory-photo").forEach((slot) => slot.addEventListener("click", () => openPhoto(slot)));
closePhotoModal.addEventListener("click", closePhoto);
photoModal.addEventListener("click", (event) => { if (event.target === photoModal) closePhoto(); });

// The answer buttons respond warmly without trying to prevent a real choice.
const celebration = $("#celebration");
const yesButton = $("#yesButton");
const notYetButton = $("#notYetButton");
const proposalNote = $("#proposalNote");
const closeCelebration = $("#closeCelebration");
const backToStory = $("#backToStory");
const notYetMessage = "Thank you for everything, Bhawana—for the memories, the calls, the photos, our meeting, and the years we shared. I will always be grateful for what you meant to me. I still wish we could try again. A part of me may keep loving you for the rest of my life and hoping that one day we find our way back, but I know promises cannot force a choice. If you ever want to come back, it has to be because you truly want to, and because we can be honest and faithful with each other. If you don't, I will be hurt, but I won't force you to stay. I miss old us, and I never wanted to lose you. ♡";
notYetButton.addEventListener("click", () => {
  proposalNote.textContent = notYetMessage;
  proposalNote.classList.add("proposal-response");
  proposalNote.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
});
function openCelebration() {
  celebration.hidden = false;
  document.body.classList.add("modal-open");
  closeCelebration.focus();
  burstHearts();
}
function hideCelebration() {
  celebration.hidden = true;
  document.body.classList.remove("modal-open");
  yesButton.focus();
}
yesButton.addEventListener("click", openCelebration);
closeCelebration.addEventListener("click", hideCelebration);
backToStory.addEventListener("click", () => {
  hideCelebration();
  $("#story").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
});
celebration.addEventListener("click", (event) => { if (event.target === celebration) hideCelebration(); });

// Decorative hearts are intentionally subtle and disabled for reduced-motion users.
function makeHeart(container, large = false) {
  const heart = document.createElement("span");
  heart.className = "ambient-heart";
  heart.textContent = Math.random() > 0.5 ? "♡" : "♥";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${large ? 14 + Math.random() * 18 : 10 + Math.random() * 12}px`;
  heart.style.animationDuration = `${large ? 7 + Math.random() * 6 : 10 + Math.random() * 8}s`;
  container.append(heart);
  heart.addEventListener("animationend", () => heart.remove(), { once: true });
}
const ambient = $("#ambient");
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  setInterval(() => { if (document.visibilityState === "visible") makeHeart(ambient); }, 1800);
}
function burstHearts() {
  for (let i = 0; i < 18; i += 1) setTimeout(() => makeHeart(ambient, true), i * 70);
}

// Keyboard support for dialogs.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!photoModal.hidden) closePhoto();
    if (!celebration.hidden) hideCelebration();
  }
});
$("#year").textContent = new Date().getFullYear();
applyPhotos();
