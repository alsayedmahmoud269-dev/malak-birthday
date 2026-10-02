const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const config = SITE_CONFIG;

const state = {
  currentPage: "home",
  musicStarted: false,
  score: 0,
};

document.title = `For ${config.herName} ❤️`;

function init() {
  renderPersonalization();
  renderTimeline();
  renderGallery();
  renderReasons();
  renderLetters();
  setupNavigation();
  setupGift();
  setupMusic();
  setupCountdown();
  setupFinal();
  createStars();
  setTimeout(() => $("#loader").classList.add("hide"), 900);
}

function renderPersonalization() {
  const homeTitle = $("#home h1");
  homeTitle.innerHTML = `Happy Birthday,<br><span>${escapeHtml(config.herName)}</span> <i>♥</i>`;

  $("#typeTitle").textContent = config.intro.title;
  $("#typeText").textContent = config.intro.text;
  $("#letterTitle").textContent = config.letter.title;
  $("#senderName").textContent = config.yourName;
  $("#finalText").textContent = config.finalText;
  $("#footerName").textContent = config.yourName;
}

function goTo(id) {
  const target = document.getElementById(id);
  if (!target) return;

  $$(".page").forEach(page => page.classList.remove("active"));
  target.classList.add("active");
  state.currentPage = id;
  updateProgress();
  $("#menu").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (id === "welcome") typeIntro();
  if (id === "final") setTimeout(() => celebrate(false), 500);
}

function setupNavigation() {
  $("#startBtn").addEventListener("click", () => {
    startMusic();
    goTo("gift");
  });

  $$(".next-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.next) goTo(btn.dataset.next);
    });
  });

  $("#menuBtn").addEventListener("click", () => {
    $("#menu").classList.toggle("open");
  });

  $$("#menu button").forEach(btn => {
    btn.addEventListener("click", () => goTo(btn.dataset.go));
  });

  updateProgress();
}

function updateProgress() {
  const pages = ["home", "gift", "welcome", "story", "memories", "reasons", "letters", "letter", "final"];
  const index = pages.indexOf(state.currentPage);
  const percent = Math.max(0, (index / (pages.length - 1)) * 100);
  $("#progressBar").style.width = `${percent}%`;
}

function setupGift() {
  $("#giftBox").addEventListener("click", () => {
    $("#giftBox").classList.add("opened");
    createHearts(25);
    setTimeout(() => goTo("welcome"), 750);
  });
}

function typeIntro() {
  const title = config.intro.title;
  const text = config.intro.text;
  const titleEl = $("#typeTitle");
  const textEl = $("#typeText");

  titleEl.textContent = "";
  textEl.textContent = "";

  let i = 0;
  const titleTimer = setInterval(() => {
    titleEl.textContent += title[i++];
    if (i >= title.length) {
      clearInterval(titleTimer);
      let j = 0;
      const textTimer = setInterval(() => {
        textEl.textContent += text[j++];
        if (j >= text.length) clearInterval(textTimer);
      }, 22);
    }
  }, 45);
}

function renderTimeline() {
  const timeline = $("#timeline");
  timeline.innerHTML = "";

  config.story.forEach((item, index) => {
    const article = document.createElement("article");
    article.className = "timeline-item";
    article.innerHTML = `
      <div class="timeline-dot">${index + 1}</div>
      <div class="timeline-card">
        <span>${escapeHtml(item.date)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.text)}</p>
      </div>
    `;
    timeline.appendChild(article);
  });
}

function renderGallery() {
  const gallery = $("#gallery");
  gallery.innerHTML = "";

  config.photos.forEach((photo, index) => {
    const figure = document.createElement("figure");
    figure.className = "photo-card";
    figure.innerHTML = `
      <div class="photo-number">0${index + 1}</div>
      <img src="${escapeAttribute(photo.src)}" alt="Memory ${index + 1}" onerror="this.parentElement.classList.add('missing')">
      <figcaption>${escapeHtml(photo.caption)}</figcaption>
    `;
    gallery.appendChild(figure);
  });
}

function renderReasons() {
  const grid = $("#reasonsGrid");
  grid.innerHTML = "";

  config.reasons.forEach((reason, index) => {
    const card = document.createElement("button");
    card.className = "reason-card";
    card.innerHTML = `
      <span class="reason-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="reason-front">Tap me</span>
      <span class="reason-back">${escapeHtml(reason)}</span>
    `;
    card.addEventListener("click", () => card.classList.toggle("flipped"));
    grid.appendChild(card);
  });
}

function renderLetters() {
  const grid = $("#envelopes");
  grid.innerHTML = "";

  config.letters.forEach((letter, index) => {
    const button = document.createElement("button");
    button.className = "envelope";
    button.innerHTML = `
      <span class="envelope-fold"></span>
      <span class="envelope-paper">${escapeHtml(letter.title)}</span>
      <span class="wax-seal">♥</span>
    `;
    button.addEventListener("click", () => openLetter(letter, index));
    grid.appendChild(button);
  });
}

function openLetter(letter, index) {
  const modal = document.createElement("div");
  modal.className = "letter-modal";
  modal.innerHTML = `
    <div class="letter-modal-backdrop"></div>
    <article class="letter-popup">
      <button class="letter-close" aria-label="Close">×</button>
      <p class="eyebrow">Letter ${String(index + 1).padStart(2, "0")}</p>
      <h3>${escapeHtml(letter.title)}</h3>
      <p class="letter-popup-text" dir="rtl">${escapeHtml(letter.text)}</p>
      <div class="letter-heart">♥</div>
    </article>
  `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add("open"));

  const close = () => {
    modal.classList.remove("open");
    setTimeout(() => modal.remove(), 300);
  };
  modal.querySelector(".letter-close").addEventListener("click", close);
  modal.querySelector(".letter-modal-backdrop").addEventListener("click", close);
  startMusic();
}

function setupMusic() {
  const audio = $("#bgMusic");
  const btn = $("#musicBtn");

  btn.addEventListener("click", () => {
    if (audio.paused) startMusic();
    else stopMusic();
  });

  $("#musicHint").addEventListener("click", startMusic);
}

async function startMusic() {
  const audio = $("#bgMusic");
  try {
    await audio.play();
    state.musicStarted = true;
    $("#musicBtn").classList.add("playing");
    $("#musicBtn span").textContent = "Ⅱ";
    $("#musicHint").classList.add("hide");
  } catch {
    $("#musicHint").classList.add("show");
  }
}

function stopMusic() {
  $("#bgMusic").pause();
  $("#musicBtn").classList.remove("playing");
  $("#musicBtn span").textContent = "♫";
}

function setupCountdown() {
  if (!config.birthday.date) return;

  $("#countdown").hidden = false;

  function tick() {
    const target = new Date(config.birthday.date).getTime();
    const now = Date.now();
    let diff = target - now;

    if (diff < 0) diff = 0;

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    $("#days").textContent = String(days).padStart(2, "0");
    $("#hours").textContent = String(hours).padStart(2, "0");
    $("#minutes").textContent = String(minutes).padStart(2, "0");
    $("#seconds").textContent = String(seconds).padStart(2, "0");
  }

  tick();
  setInterval(tick, 1000);
}

function setupFinal() {
  $("#celebrateBtn").addEventListener("click", () => celebrate(true));

  $("#restartBtn").addEventListener("click", () => {
    goTo("home");
  });
}

function celebrate(big) {
  createHearts(big ? 80 : 20);
  createConfetti(big ? 130 : 45);

  const cake = $("#cake");
  if (cake) {
    cake.classList.add("celebrate");
    setTimeout(() => cake.classList.remove("celebrate"), 1500);
  }
}

function createHearts(count) {
  const container = $("#hearts");

  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = Math.random() > .2 ? "♥" : "♡";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${3 + Math.random() * 3}s`;
    heart.style.animationDelay = `${Math.random() * .8}s`;
    heart.style.fontSize = `${14 + Math.random() * 24}px`;
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 7000);
  }
}

function createConfetti(count) {
  const container = $("#confetti");

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDuration = `${2 + Math.random() * 3}s`;
    piece.style.animationDelay = `${Math.random() * .5}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 6000);
  }
}

function createStars() {
  const stars = $("#stars");
  for (let i = 0; i < 90; i++) {
    const star = document.createElement("span");
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    stars.appendChild(star);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") $("#menu").classList.remove("open");
});

window.addEventListener("load", init);
