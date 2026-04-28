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
  const loveModal = document.getElementById("loveModal");
  const loveModalClose = document.getElementById("loveModalClose");
  const loveModalX = document.getElementById("loveModalX");
  const loveHerImg = document.getElementById("loveHerImg");
  const loveMineImg = document.getElementById("loveMineImg");

  if (!yesBtn || !reveal || !askCard || !loveModal || !loveModalClose || !loveModalX) return;

  const ensureLoaded = async (img) => {
    if (!img) return;
    const desired = img.getAttribute("data-src");
    if (!desired) return;
    const result = await setFirstWorkingSrc(img, desired);
    if (result.ok) img.removeAttribute("data-src");
  };

  const openModal = async () => {
    await Promise.all([ensureLoaded(loveHerImg), ensureLoaded(loveMineImg)]);

    loveModal.hidden = false;
    loveModal.setAttribute("aria-hidden", "false");

    const previouslyFocused = document.activeElement;

    const close = () => {
      loveModal.hidden = true;
      loveModal.setAttribute("aria-hidden", "true");
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    loveModalClose.onclick = close;
    loveModalX.onclick = close;
    document.addEventListener("keydown", onKeyDown);
    loveModalX.focus();
  };

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

    void openModal();
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
        tile.remove();
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

async function buildGalleryTiles() {
  const wall = document.getElementById("photoWall");
  if (!wall) return;

  const params = new URLSearchParams(window.location.search);
  const start = Math.max(1, Math.min(200, Number(params.get("start") ?? 1) || 1));
  const max = Math.max(1, Math.min(200, Number(params.get("max") ?? 200) || 200));
  const stopAfter = Math.max(
    1,
    Math.min(50, Number(params.get("stopAfter") ?? 8) || 8),
  );

  wall.textContent = "";

  let misses = 0;
  let found = 0;

  for (let i = start; i <= max; i += 1) {
    const src = `assets/${i}.jpg`;

    try {
      // eslint-disable-next-line no-await-in-loop
      await loadImage(src);
      misses = 0;
      found += 1;
    } catch {
      misses += 1;
      if (found > 0 && misses >= stopAfter) break;
      continue;
    }

    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.setAttribute("data-zoom", "");
    tile.dataset.index = String(i);

    const img = document.createElement("img");
    img.src = src;
    img.alt = `Cutie photo ${String(i).padStart(2, "0")}`;
    img.loading = "lazy";
    img.decoding = "async";

    const tag = document.createElement("span");
    tag.className = "tile__tag";
    tag.textContent = String(i).padStart(2, "0");

    tile.appendChild(img);
    tile.appendChild(tag);
    wall.appendChild(tile);
  }
}

function wireGate() {
  const gate = document.getElementById("gate");
  const app = document.getElementById("app");
  const form = document.getElementById("gateForm");
  const input = document.getElementById("gateName");
  const error = document.getElementById("gateError");
  const panel = document.querySelector(".gate__panel");

  if (!gate || !app || !form || !input || !error || !panel) return;

  const params = new URLSearchParams(window.location.search);
  const expected = (params.get("key") ?? "ritika").trim().toLowerCase();
  const saved = (localStorage.getItem("gateName") ?? "").trim().toLowerCase();
  const fromURL = (params.get("name") ?? "").trim().toLowerCase();

  const unlock = (nameValue) => {
    gate.hidden = true;
    gate.setAttribute("aria-hidden", "true");

    app.hidden = false;

    const target = document.getElementById("nameTarget");
    if (target && nameValue) target.textContent = nameValue;

    if (nameValue) localStorage.setItem("gateName", nameValue);
  };

  const tryAuto = () => {
    if (fromURL && fromURL === expected) {
      unlock(params.get("name") || "Ritika");
      return true;
    }
    if (saved && saved === expected) {
      unlock("Ritika");
      return true;
    }
    return false;
  };

  if (tryAuto()) return;

  app.hidden = true;
  gate.hidden = false;
  gate.setAttribute("aria-hidden", "false");

  input.value = "";
  input.focus();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = (input.value ?? "").trim();
    const normalized = value.toLowerCase();

    if (normalized === expected) {
      error.textContent = "";
      unlock(value);
      return;
    }

    error.textContent = "Not you. Try again.";
    panel.classList.remove("isWrong");
    // retrigger animation
    // eslint-disable-next-line no-unused-expressions
    panel.offsetWidth;
    panel.classList.add("isWrong");
    input.select();
  });
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

    const tag = tile.dataset.index || tile.querySelector(".tile__tag")?.textContent?.trim();
    open(img, tag ? `Cutie photo ${String(tag).padStart(2, "0")}` : "Photo");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const active = document.activeElement;
    if (!active || !active.matches?.("[data-zoom]")) return;
    if (active.classList.contains("tile--missing")) return;
    const img = active.querySelector("img");
    if (!img) return;
    if (img.hasAttribute("data-src")) return;
    const tag = active.dataset.index || active.querySelector(".tile__tag")?.textContent?.trim();
    open(img, tag ? `Cutie photo ${String(tag).padStart(2, "0")}` : "Photo");
  });
}

wireNoButton();
wireYesButton();
applyPersonalizationFromURL();
wireGate();
buildGalleryTiles().then(() => {
  styleGalleryWall();
});
wireLightbox();
loadDataSrcImages();
