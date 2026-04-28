const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function moveButtonWithinZone(button, zone) {
  const zoneRect = zone.getBoundingClientRect();
  const btnRect = button.getBoundingClientRect();

  const maxX = zoneRect.width - btnRect.width;
  const maxY = zoneRect.height - btnRect.height;

  const x = clamp(Math.random() * maxX, 0, maxX);
  const y = clamp(Math.random() * maxY, 0, maxY);

  button.style.position = "absolute";
  button.style.left = `${x}px`;
  button.style.top = `${y}px`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

async function setFirstWorkingSrc(imgEl, preferredSrc) {
  const candidates = [];
  if (preferredSrc) candidates.push(preferredSrc);

  const params = new URLSearchParams(window.location.search);
  const tryExts = params.get("tryExts") === "1";

  if (tryExts && preferredSrc && preferredSrc.endsWith(".jpg")) {
    candidates.push(preferredSrc.replace(/\.jpg$/i, ".jpeg"));
    candidates.push(preferredSrc.replace(/\.jpg$/i, ".png"));
    candidates.push(preferredSrc.replace(/\.jpg$/i, ".webp"));
  }

  if (tryExts && preferredSrc && preferredSrc.endsWith(".png")) {
    candidates.push(preferredSrc.replace(/\.png$/i, ".jpg"));
    candidates.push(preferredSrc.replace(/\.png$/i, ".jpeg"));
    candidates.push(preferredSrc.replace(/\.png$/i, ".webp"));
  }

  if (tryExts && preferredSrc && preferredSrc.endsWith(".jpeg")) {
    candidates.push(preferredSrc.replace(/\.jpeg$/i, ".jpg"));
    candidates.push(preferredSrc.replace(/\.jpeg$/i, ".png"));
    candidates.push(preferredSrc.replace(/\.jpeg$/i, ".webp"));
  }

  for (const src of candidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const working = await loadImage(src);
      imgEl.src = working;
      return { ok: true, src: working };
    } catch {
      // continue
    }
  }

  return { ok: false, src: null };
}

function wireNoButton() {
  const noBtn = document.getElementById("noBtn");
  const zone = document.getElementById("buttonZone");

  if (!noBtn || !zone) return;

  const dodge = () => moveButtonWithinZone(noBtn, zone);

  noBtn.addEventListener("pointerenter", dodge, { passive: true });
  noBtn.addEventListener("pointerdown", dodge, { passive: true });
  noBtn.addEventListener("focus", dodge, { passive: true });
  noBtn.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") dodge();
  });
  noBtn.addEventListener("click", (event) => {
    event.preventDefault();
    dodge();
  });

  window.addEventListener(
    "resize",
    () => {
      if (noBtn.style.position === "absolute") dodge();
    },
    { passive: true },
  );
}

function wireYesButton() {
  const yesBtn = document.getElementById("yesBtn");
  const reveal = document.getElementById("reveal");
  const askCard = document.querySelector(".ask");

  if (!yesBtn || !reveal || !askCard) return;

  yesBtn.addEventListener("click", () => {
    askCard.setAttribute("aria-hidden", "true");
    askCard.style.display = "none";

    reveal.hidden = false;
    reveal.scrollIntoView({ behavior: "smooth", block: "start" });

    reveal.animate(
      [
        { transform: "translateY(8px)", opacity: 0 },
        { transform: "translateY(0)", opacity: 1 },
      ],
      { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
  });
}

async function loadDataSrcImages() {
  const images = Array.from(document.querySelectorAll("img[data-src]"));
  await Promise.all(
    images.map(async (img) => {
      const desired = img.getAttribute("data-src");
      if (!desired) return;

      const result = await setFirstWorkingSrc(img, desired);
      const tile = img.closest(".tile");
      if (tile && !result.ok) {
        tile.classList.add("tile--missing");
        return;
      }

      if (result.ok) img.removeAttribute("data-src");
    }),
  );
}

function applyPersonalizationFromURL() {
  const params = new URLSearchParams(window.location.search);

  const name = params.get("name");
  if (name) {
    const target = document.getElementById("nameTarget");
    if (target) target.textContent = name;
    document.title = `For ${name}`;
  }

  const question = params.get("question");
  if (question) {
    const title = document.getElementById("askTitle");
    if (title) title.textContent = question;
  }

  const message = params.get("message") ?? params.get("msg");
  if (message) {
    const custom = document.getElementById("customMessage");
    if (custom) custom.textContent = message;
  }
}

function styleGalleryWall() {
  const tiles = Array.from(document.querySelectorAll(".tile"));
  for (const tile of tiles) {
    const rotation = (Math.random() * 6 - 3).toFixed(2);
    const y = (Math.random() * 8 - 4).toFixed(1);
    tile.style.setProperty("--r", `${rotation}deg`);
    tile.style.setProperty("--y", `${y}px`);
  }
}

function wireLightbox() {
  const lightbox = document.getElementById("lightbox");
  const closeBtn = document.getElementById("lightboxClose");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");

  if (!lightbox || !closeBtn || !lightboxImg || !lightboxCaption) return;

  const open = (imgEl, caption) => {
    lightboxImg.src = imgEl.currentSrc || imgEl.src;
    lightboxCaption.textContent = caption ?? "";

    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");

    const previouslyFocused = document.activeElement;

    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    const close = () => {
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };

    closeBtn.onclick = close;
    document.addEventListener("keydown", onKeyDown);
    closeBtn.focus();
  };

  document.addEventListener("click", (event) => {
    const tile = event.target.closest?.("[data-zoom]");
    if (!tile) return;
    if (tile.classList.contains("tile--missing")) return;
    const img = tile.querySelector("img");
    if (!img) return;
    if (img.hasAttribute("data-src")) return;

    const tag = tile.querySelector(".tile__tag")?.textContent?.trim();
    open(img, tag ? `Cutie photo ${tag}` : "Photo");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const active = document.activeElement;
    if (!active || !active.matches?.("[data-zoom]")) return;
    if (active.classList.contains("tile--missing")) return;
    const img = active.querySelector("img");
    if (!img) return;
    if (img.hasAttribute("data-src")) return;
    const tag = active.querySelector(".tile__tag")?.textContent?.trim();
    open(img, tag ? `Cutie photo ${tag}` : "Photo");
  });
}

wireNoButton();
wireYesButton();
applyPersonalizationFromURL();
styleGalleryWall();
wireLightbox();
loadDataSrcImages();
