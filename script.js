/* ==============================================
   NOSSO UNIVERSO — 2 ANOS  |  script.js
   ============================================== */

// ---- 0.1) Registro do Service Worker (PWA) ----
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// ---- 0.5) Música de fundo (YouTube IFrame API) ----
let bgPlayer = null;
let bgPlayerReady = false;
let bgMusicStarted = false;
let userHasInteracted = false;

window.onYouTubeIframeAPIReady = function () {
  bgPlayer = new YT.Player("ytBgPlayer", {
    videoId: "Oa_RSwwpPaA",
    playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: "Oa_RSwwpPaA", rel: 0, modestbranding: 1 },
    events: {
      onReady: () => {
        bgPlayerReady = true;
        bgPlayer.setVolume(20);
        // Se o usuário já interagiu antes do player ficar pronto, inicia agora
        if (userHasInteracted) startBgMusic();
      }
    }
  });
};

const floatingMusicBtn = document.getElementById("floatingMusicBtn");

function startBgMusic() {
  if (!bgMusicStarted && bgPlayerReady) {
    bgPlayer.playVideo();
    bgMusicStarted = true;
    if (floatingMusicBtn) floatingMusicBtn.classList.add("is-playing");
  }
}

function onFirstInteraction() {
  userHasInteracted = true;
  startBgMusic();
  ["click", "touchstart", "keydown"].forEach(ev => document.removeEventListener(ev, onFirstInteraction));
}
["click", "touchstart", "keydown"].forEach(ev => document.addEventListener(ev, onFirstInteraction, { once: true }));

if (floatingMusicBtn) {
  floatingMusicBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!bgPlayerReady) return;
    const state = bgPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      bgPlayer.pauseVideo();
      floatingMusicBtn.classList.remove("is-playing");
    } else {
      bgPlayer.playVideo();
      bgMusicStarted = true;
      floatingMusicBtn.classList.add("is-playing");
    }
  });
}

// ---- 0) Login ----
const loginGate = document.getElementById("loginGate");
const loginForm = document.getElementById("loginForm");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
const loginSuccess = document.getElementById("loginSuccess");
const btnPennyKnock = document.getElementById("btnPennyKnock");
const pennyKnockText = document.getElementById("pennyKnockText");
const loginCard = document.querySelector(".login-card");
const ACCESS_PASSWORD = "Penny";

function unlockSite() {
  document.body.classList.remove("app-locked");
  document.body.classList.add("app-unlocked");
  if (loginGate) loginGate.setAttribute("aria-hidden", "true");
}

function lockSite() {
  document.body.classList.remove("app-unlocked");
  document.body.classList.add("app-locked");
  if (loginGate) loginGate.removeAttribute("aria-hidden");
}

const navigationEntry = performance.getEntriesByType?.("navigation")?.[0];
const isReloadNavigation = navigationEntry
  ? navigationEntry.type === "reload"
  : performance.navigation?.type === 1;

if (isReloadNavigation) {
  lockSite();
} else {
  unlockSite();
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const typed = (loginPassword?.value || "").trim();

    if (typed === ACCESS_PASSWORD) {
      if (loginSuccess) {
        loginSuccess.classList.remove("show");
        void loginSuccess.offsetWidth;
        loginSuccess.classList.add("show");
      }

      setTimeout(() => {
        unlockSite();
      }, 900);

      if (loginPassword) loginPassword.value = "";
      if (loginError) loginError.textContent = "";
      return;
    }

    if (loginError) {
      loginError.textContent = "Senha incorreta. Tente novamente.";
    }
    if (loginPassword) {
      loginPassword.classList.remove("login-input--error");
      void loginPassword.offsetWidth; // força reflow para reiniciar animation
      loginPassword.classList.add("login-input--error");
      loginPassword.addEventListener("input", () => loginPassword.classList.remove("login-input--error"), { once: true });
    }
  });
}

if (btnPennyKnock && pennyKnockText) {
  let knockTimers = [];

  const clearKnockTimers = () => {
    knockTimers.forEach((id) => clearTimeout(id));
    knockTimers = [];
  };

  const runKnockSequence = () => {
    clearKnockTimers();
    if (loginCard) {
      loginCard.classList.remove("knock-animate");
      void loginCard.offsetWidth;
      loginCard.classList.add("knock-animate");
    }

    const lines = [
      "Toc toc toc...",
      "Toc toc toc...",
      "Toc toc toc... Penny!"
    ];

    lines.forEach((line, index) => {
      knockTimers.push(setTimeout(() => {
        pennyKnockText.textContent = line;
      }, index * 520));
    });
  };

  btnPennyKnock.addEventListener("click", runKnockSequence);
}

// ---- 1) Contador de dias e horas ----
const startDate = new Date("2024-06-13T00:00:00"); // data do namoro
const nextAnniversaryDate = new Date("2027-06-13T00:00:00");

const daysCountEl  = document.getElementById("daysCount");
const hoursCountEl = document.getElementById("hoursCount");
const nextAnniversaryCountEl = document.getElementById("nextAnniversaryCount");

function updateCounter() {
  const now  = new Date();
  const diff = now - startDate;
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (daysCountEl)  daysCountEl.textContent  = isNaN(days)  ? "—" : days.toLocaleString("pt-BR");
  if (hoursCountEl) hoursCountEl.textContent = isNaN(hours) ? "—" : hours.toLocaleString("pt-BR");
}
updateCounter();
setInterval(updateCounter, 60_000);

function updateNextAnniversaryCountdown() {
  if (!nextAnniversaryCountEl) return;

  const now = new Date();
  const diff = nextAnniversaryDate - now;
  const dayMs = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil(diff / dayMs);

  nextAnniversaryCountEl.textContent = daysLeft > 0 ? daysLeft.toString() : "Chegou!";
}

updateNextAnniversaryCountdown();
setInterval(updateNextAnniversaryCountdown, 60_000);


// ---- 2) Motivos aleatórios ----
const motivos = [
  "Você faz o mundo ficar mais leve só por existir.",
  "Você é meu lugar seguro em qualquer tempestade.",
  "Seu carinho muda meu dia de dentro pra fora.",
  "Com você, até o silêncio é bom demais.",
  "Seu sorriso é meu plot twist favorito.",
  "Você é a minha constante no universo.",
  "Do seu lado, qualquer lugar vira lar.",
  "Você cuida de mim de um jeito que eu não sabia que precisava.",
  "Você me faz ser uma versão melhor de mim.",
  "Cada dia com você é meu capítulo favorito.",
  "Você é a prova de que as melhores teorias têm a ver com o coração.",
  "Nosso amor seria o experimento mais lindo da ciência.",
  "Você entende minhas referências e também meus silêncios.",
  "Você me acalma só com o seu abraço.",
  "Me apaixono de novo toda vez que você ri.",
];

const motivoRandomEl = document.getElementById("motivoRandom");
const btnMotivo = document.getElementById("btnAdicionarMotivo");
let lastIndex = -1;

if (btnMotivo) {
  btnMotivo.addEventListener("click", () => {
    let idx;
    do { idx = Math.floor(Math.random() * motivos.length); } while (idx === lastIndex);
    lastIndex = idx;
    motivoRandomEl.style.opacity = "0";
    setTimeout(() => {
      motivoRandomEl.textContent = `"${motivos[idx]}"`;
      motivoRandomEl.style.opacity = "1";
    }, 200);
  });
}


// ---- 2.1) Assinaturas confirmáveis ----
const signatureYouInput = document.getElementById("signatureYou");
const signatureYouPreview = document.getElementById("signatureYouPreview");
const signatureYouConfirmBtn = document.getElementById("signatureYouConfirm");
const signatureHerInput = document.getElementById("signatureHer");
const signaturePreview = document.getElementById("signaturePreview");
const signatureHerConfirmBtn = document.getElementById("signatureHerConfirm");
const signatureYouStorageKey = "nosso-universo-signature-you";
const signatureHerStorageKey = "nosso-universo-signature-her";
const signatureYouPendingKey = "nosso-universo-signature-you-pending";
const signatureHerPendingKey = "nosso-universo-signature-her-pending";
const signatureYouLockedKey = "nosso-universo-signature-you-locked";
const signatureHerLockedKey = "nosso-universo-signature-her-locked";
const contractStamp = document.getElementById("contractStamp");

function updateSignaturePreview(value, previewEl, fallbackText, filledClass = "signature-preview--filled") {
  const cleaned = (value || "").trim();

  if (!previewEl) return;

  if (cleaned) {
    previewEl.textContent = `Assinatura: ${cleaned}`;
    previewEl.classList.add(filledClass);
  } else {
    previewEl.textContent = fallbackText;
    previewEl.classList.remove(filledClass);
  }
}

function lockSignatureField(inputEl, confirmBtn, confirmText = "Assinado ✅") {
  if (inputEl) {
    inputEl.disabled = true;
    inputEl.readOnly = true;
  }

  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = confirmText;
  }
}

function updateContractStamp() {
  if (!contractStamp) return;

  const youSigned = localStorage.getItem(signatureYouLockedKey) === "true";
  const herSigned = localStorage.getItem(signatureHerLockedKey) === "true";

  contractStamp.classList.toggle("show", youSigned && herSigned);
}

function wireSignatureField(inputEl, previewEl, confirmBtn, pendingKey, storageKey, lockedKey, fallbackText) {
  if (!inputEl) return;

  const savedSignature = localStorage.getItem(storageKey);
  const savedPending = localStorage.getItem(pendingKey);
  const isLocked = localStorage.getItem(lockedKey) === "true";

  if (savedPending) {
    inputEl.value = savedPending;
  }

  if (savedSignature) {
    updateSignaturePreview(savedSignature, previewEl, fallbackText);
  }

  if (isLocked) {
    lockSignatureField(inputEl, confirmBtn);
    updateContractStamp();
    return;
  }

  inputEl.addEventListener("input", (event) => {
    localStorage.setItem(pendingKey, event.target.value);
  });

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      const value = inputEl.value.trim();
      if (!value) return;

      localStorage.setItem(storageKey, value);
      localStorage.setItem(lockedKey, "true");
      localStorage.removeItem(pendingKey);
      updateSignaturePreview(value, previewEl, fallbackText);
      lockSignatureField(inputEl, confirmBtn);
      updateContractStamp();
    });
  }
}

wireSignatureField(
  signatureYouInput,
  signatureYouPreview,
  signatureYouConfirmBtn,
  signatureYouPendingKey,
  signatureYouStorageKey,
  signatureYouLockedKey,
  "Sua assinatura vai aparecer aqui depois de confirmar 💗"
);

wireSignatureField(
  signatureHerInput,
  signaturePreview,
  signatureHerConfirmBtn,
  signatureHerPendingKey,
  signatureHerStorageKey,
  signatureHerLockedKey,
  "A assinatura dela vai aparecer aqui depois de confirmar 💜"
);

updateContractStamp();


// ---- 2.2) Bola de crochê para revelar timeline ----
const timelinePull = document.getElementById("timelinePull");
const timelineYarn = document.getElementById("timelineYarn");
const timelineReveal = document.getElementById("timelineReveal");
const timelinePullHint = document.getElementById("timelinePullHint");

if (timelinePull && timelineYarn && timelineReveal) {
  const DRAG_RANGE = 170;
  let progress = 0;
  let isDragging = false;
  let startY = 0;
  let startProgress = 0;

  const getPointerY = (event) => {
    if (typeof event.clientY === "number") return event.clientY;
    if (event.touches?.length) return event.touches[0].clientY;
    if (event.changedTouches?.length) return event.changedTouches[0].clientY;
    return 0;
  };

  const setTimelineProgress = (value) => {
    progress = Math.max(0, Math.min(1, value));

    const yarnOffset = progress * DRAG_RANGE;
    timelinePull.style.setProperty("--yarn-offset", `${yarnOffset}px`);
    timelinePull.style.setProperty("--yarn-thread", `${28 + yarnOffset}px`);

    const hiddenPercent = (1 - progress) * 100;
    timelineReveal.style.clipPath = `inset(0 0 ${hiddenPercent}% 0)`;
    timelineReveal.style.opacity = `${0.2 + progress * 0.8}`;
    timelineReveal.classList.toggle("is-open", progress >= 0.999);

    // No iOS, play() chamado enquanto o clip-path zera a área visível falha
    // silenciosamente e não retoma depois — força retry assim que houver área revelada
    if (progress > 0) {
      timelineReveal.querySelectorAll("video").forEach((video) => {
        if (video.paused) video.play().catch(() => {});
      });
    }

    timelineYarn.setAttribute("aria-valuenow", `${Math.round(progress * 100)}`);

    if (timelinePullHint) {
      if (progress < 0.05) {
        timelinePullHint.textContent = "Puxe a bolinha para baixo para revelar a nossa história 💗";
      } else if (progress < 1) {
        timelinePullHint.textContent = "Isso! Continua puxando... ✨";
      } else {
        timelinePullHint.textContent = "Linha do tempo revelada! 🧶💞";
      }
    }
  };

  const startDrag = (event) => {
    isDragging = true;
    startY = getPointerY(event);
    startProgress = progress;
    timelinePull.classList.add("is-dragging");
    timelineYarn.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = (event) => {
    if (!isDragging) return;
    const currentY = getPointerY(event);
    const deltaY = currentY - startY;
    setTimelineProgress(startProgress + deltaY / DRAG_RANGE);
  };

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    timelinePull.classList.remove("is-dragging");
  };

  timelineYarn.addEventListener("pointerdown", startDrag);
  window.addEventListener("pointermove", moveDrag);
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  timelineYarn.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setTimelineProgress(progress + 0.08);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setTimelineProgress(progress - 0.08);
    } else if (event.key === "Home") {
      event.preventDefault();
      setTimelineProgress(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setTimelineProgress(1);
    }
  });

  window.addEventListener("resize", () => {
    setTimelineProgress(progress);
  });

  setTimelineProgress(0);
}




// ---- 3) Mídia flexível (imagem ou vídeo) ----
function isVideoFile(src = "") {
  if (src.startsWith("data:video/")) return true;
  return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(src);
}

function renderMedia(container) {
  if (!container) return;
  const src = container.dataset.src || "";
  const alt = container.dataset.alt || "Mídia";
  container.innerHTML = "";
  if (!src) return;

  if (isVideoFile(src)) {
    const video = document.createElement("video");
    video.src = src;
    video.controls = false;
    video.preload = "auto";
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "");
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.className = "media-slot__asset media-slot__video";
    // Fallback explícito para mobile onde autoplay falha silenciosamente
    video.addEventListener("canplay", () => { video.play().catch(() => {}); }, { once: true });
    container.appendChild(video);

    // Retry quando o vídeo realmente entra em área visível (ex.: saindo de um
    // container com clip-path zerado), já que o play() inicial pode ter falhado
    const visibilityRetry = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0 && video.paused) {
          video.play().catch(() => {});
        }
      });
    }, { threshold: 0.01 });
    visibilityRetry.observe(video);
  } else {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.className = "media-slot__asset media-slot__image";
    if (container.dataset.position) {
      img.style.objectPosition = container.dataset.position;
    }
    container.appendChild(img);
  }
}

document.querySelectorAll(".media-slot").forEach(renderMedia);


// ---- 4) Modal da galeria ----
const modal       = document.getElementById("modalFoto");
const modalMedia   = document.getElementById("modalMedia");
const modalCap    = document.getElementById("modalCaption");
const modalClose  = document.getElementById("modalClose");

document.querySelectorAll(".photo").forEach(btn => {
  btn.addEventListener("click", () => {
    const src = btn.dataset.src || btn.querySelector(".media-slot")?.dataset.src || "";
    const alt = btn.dataset.alt || btn.querySelector(".media-slot")?.dataset.alt || "Foto ampliada";

    if (!src) return;

    modalMedia.innerHTML = "";
    const media = isVideoFile(src) ? document.createElement("video") : document.createElement("img");
    media.src = src;
    media.alt = alt;
    media.className = isVideoFile(src) ? "modal__asset modal__video" : "modal__asset modal__image";

    if (isVideoFile(src)) {
      media.controls = true;
      media.autoplay = true;
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = "metadata";
    }

    media.addEventListener("error", () => {
      modalMedia.innerHTML = `<div class="modal__fallback">Arquivo indisponível</div>`;
    });

    modalMedia.appendChild(media);
    modalCap.textContent = btn.dataset.caption || "";
    modal.showModal();
  });
});

if (modalClose) modalClose.addEventListener("click", () => modal.close());
if (modal) {
  modal.addEventListener("click", e => {
    const rect = modal.getBoundingClientRect();
    const inside = (
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top  && e.clientY <= rect.bottom
    );
    if (!inside) modal.close();
  });
}


// ---- 5) Modal surpresa ----
const modalSurpresa  = document.getElementById("modalSurpresa");
const surpresaClose  = document.getElementById("surpresaClose");
const btnSurpresa    = document.getElementById("btnSurpresa");
const btnSurpresaCon = document.getElementById("btnSurpresaConfete");

if (btnSurpresa) {
  btnSurpresa.addEventListener("click", () => {
    modalSurpresa.showModal();
  });
}
if (surpresaClose) {
  surpresaClose.addEventListener("click", () => modalSurpresa.close());
}
if (btnSurpresaCon) {
  btnSurpresaCon.addEventListener("click", () => {
    modalSurpresa.close();
    confettiBlast(200);
  });
}


// ---- 6) Confete ----
const canvas = document.getElementById("confetti");
const ctx    = canvas.getContext("2d");
let pieces   = [];
let animId   = null;

function resize() {
  canvas.width  = window.innerWidth  * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
}
window.addEventListener("resize", resize);
resize();

const COLORS = ["#ff5fa2","#ffd1e6","#7c4dff","#e8dfff","#ffffff","#ffb3d4","#c77dff"];
const SHAPES = ["rect","circle","heart"];

function spawnConfetti(count = 160) {
  pieces = Array.from({ length: count }).map(() => ({
    x:     Math.random() * canvas.width,
    y:     -Math.random() * canvas.height * 0.25,
    r:     (5 + Math.random() * 10) * devicePixelRatio,
    vx:    (-1 + Math.random() * 2) * 1.4 * devicePixelRatio,
    vy:    (2.5 + Math.random() * 4) * devicePixelRatio,
    rot:   Math.random() * Math.PI * 2,
    vr:    (-0.25 + Math.random() * 0.5),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    alpha: 1,
  }));
}

function drawPiece(p) {
  ctx.save();
  ctx.globalAlpha = p.alpha;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.fillStyle = p.color;

  if (p.shape === "rect") {
    ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
  } else if (p.shape === "circle") {
    ctx.beginPath();
    ctx.arc(0, 0, p.r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // heart
    const s = p.r * 0.06;
    ctx.beginPath();
    ctx.moveTo(0, s * 2);
    ctx.bezierCurveTo(-s * 5, -s * 3, -s * 10, s * 2, 0, s * 8);
    ctx.bezierCurveTo(s * 10, s * 2, s * 5, -s * 3, 0, s * 2);
    ctx.fill();
  }
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(p => {
    p.x   += p.vx;
    p.y   += p.vy;
    p.rot += p.vr;
    if (p.y > canvas.height * 0.75) p.alpha -= 0.012;
    drawPiece(p);
  });
  pieces = pieces.filter(p => p.alpha > 0 && p.y < canvas.height + 50);
  if (pieces.length > 0) animId = requestAnimationFrame(draw);
  else { cancelAnimationFrame(animId); animId = null; }
}

function confettiBlast(count = 160) {
  spawnConfetti(count);
  if (!animId) draw();
}

const btnConfete = document.getElementById("btnConfete");
const modalFeliz2anos = document.getElementById("modalFeliz2anos");
const feliz2anosClose = document.getElementById("feliz2anosClose");
const btnFeliz2anosConfete = document.getElementById("btnFeliz2anosConfete");

if (btnConfete) btnConfete.addEventListener("click", () => {
  if (modalFeliz2anos) {
    modalFeliz2anos.showModal();
    setTimeout(() => confettiBlast(80), 400);
  } else {
    confettiBlast(220);
  }
});

if (feliz2anosClose) feliz2anosClose.addEventListener("click", () => modalFeliz2anos.close());
if (modalFeliz2anos) modalFeliz2anos.addEventListener("click", (e) => { if (e.target === modalFeliz2anos) modalFeliz2anos.close(); });
if (btnFeliz2anosConfete) btnFeliz2anosConfete.addEventListener("click", () => { confettiBlast(300); modalFeliz2anos.close(); });


// ---- 7) Menu mobile ----
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");

if (hamburger && mobileNav) {
  hamburger.addEventListener("click", () => {
    mobileNav.classList.toggle("open");
  });
  document.querySelectorAll(".mnav-link").forEach(link => {
    link.addEventListener("click", () => mobileNav.classList.remove("open"));
  });
}


// ---- 8) Scroll reveal ----
const revealEls = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));


// ---- 9) Easter egg: confete ao chegar na seção final ----
const finalSection = document.getElementById("final");
let finalTriggered = false;

const finalObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !finalTriggered) {
      finalTriggered = true;
      setTimeout(() => confettiBlast(120), 600);
    }
  });
}, { threshold: 0.4 });

if (finalSection) finalObserver.observe(finalSection);


// ---- 10) Bazinga mode ----
const bazingaMode = document.getElementById("bazingaMode");
let bazingaBuffer = "";
let bazingaHideTimer = null;

function activateBazingaMode() {
  if (!bazingaMode) return;

  bazingaMode.classList.remove("show");
  void bazingaMode.offsetWidth;
  bazingaMode.classList.add("show");
  confettiBlast(180);

  if (bazingaHideTimer) clearTimeout(bazingaHideTimer);
  bazingaHideTimer = setTimeout(() => {
    bazingaMode.classList.remove("show");
  }, 1800);
}

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key.length !== 1) return;

  bazingaBuffer = (bazingaBuffer + event.key.toLowerCase()).slice(-7);
  if (bazingaBuffer === "bazinga") {
    activateBazingaMode();
    bazingaBuffer = "";
  }
});

// ---- 11) Quebra-cabeça com seleção e troca ----
(function initPuzzle() {
  const board       = document.getElementById("puzzleBoard");
  const movesEl     = document.getElementById("puzzleMoves");
  const solvedEl    = document.getElementById("puzzleSolved");
  const shuffleBtn  = document.getElementById("puzzleShuffle");
  const photoSelect = document.getElementById("puzzlePhotoSelect");
  if (!board) return;

  // 9 peças, sem espaço vazio — clica para selecionar, clica em outra para trocar
  const SOLVED = [1,2,3,4,5,6,7,8,9];
  let state        = [...SOLVED];
  let moves        = 0;
  let selected     = null; // índice da peça selecionada no momento
  let currentPhoto = "assets/foto-casal-1.jpeg";

  // Posição correta na imagem para cada valor de peça
  function tileBgPos(val) {
    const i   = val - 1;
    const row = Math.floor(i / 3);
    const col = i % 3;
    return `${col * 50}% ${row * 50}%`;
  }

  function isSolved() {
    return state.every((v, i) => v === SOLVED[i]);
  }

  function handleClick(idx) {
    if (selected === null) {
      // Primeira peça: seleciona
      selected = idx;
    } else if (selected === idx) {
      // Clicou na mesma: deseleciona
      selected = null;
    } else {
      // Segunda peça: troca com a selecionada
      [state[selected], state[idx]] = [state[idx], state[selected]];
      moves++;
      selected = null;
    }
    render();
  }

  function render() {
    board.innerHTML = "";
    state.forEach((val, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "puzzle-tile" + (idx === selected ? " puzzle-tile--selected" : "");
      btn.style.backgroundImage    = `url('${currentPhoto}')`;
      btn.style.backgroundSize     = "300% 300%";
      btn.style.backgroundPosition = tileBgPos(val);
      btn.addEventListener("click", () => handleClick(idx));
      btn.setAttribute("aria-label", `Peça ${val}`);
      board.appendChild(btn);
    });

    movesEl.textContent = `Trocas: ${moves}`;

    if (isSolved()) {
      board.classList.add("puzzle-board--solved");
      solvedEl.removeAttribute("aria-hidden");
      confettiBlast(100);
    } else {
      board.classList.remove("puzzle-board--solved");
      solvedEl.setAttribute("aria-hidden", "true");
    }
  }

  function shuffle() {
    // Fisher-Yates garante embaralhamento uniforme
    state = [...SOLVED];
    for (let i = state.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state[i], state[j]] = [state[j], state[i]];
    }
    if (isSolved()) [state[0], state[1]] = [state[1], state[0]];
    moves    = 0;
    selected = null;
    render();
  }

  if (photoSelect) {
    photoSelect.querySelectorAll(".puzzle-photo-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        photoSelect.querySelectorAll(".puzzle-photo-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentPhoto = btn.dataset.photo;
        shuffle();
      });
    });
  }

  shuffleBtn.addEventListener("click", shuffle);
  shuffle();
}());

// ---- 11.5) Botão APERTE — Bazinga com explosões ----
(function () {
  const btn = document.getElementById("btnBazingaPuzzle");
  const display = document.getElementById("bazingaMode");
  if (!btn) return;

  btn.addEventListener("click", () => {
    // Várias ondas de confete com delay
    confettiBlast(300);
    setTimeout(() => confettiBlast(250), 300);
    setTimeout(() => confettiBlast(200), 600);
    setTimeout(() => confettiBlast(180), 950);

    // Mostra o BAZINGA na tela
    if (display) {
      display.classList.remove("show");
      void display.offsetWidth;
      display.classList.add("show");
      setTimeout(() => display.classList.remove("show"), 2200);
    }

    // Animação do botão
    btn.classList.add("btn--bazinga--fired");
    setTimeout(() => btn.classList.remove("btn--bazinga--fired"), 600);
  });
}());

// ---- 11.8) Download PDF do contrato ----
(function () {
  const statusEl = document.getElementById("contractPdfStatus");

  document.querySelectorAll(".contract-pdf-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const variant = btn.dataset.variant || "romantico";

      const signYou = (localStorage.getItem("nosso-universo-signature-you") || "").trim();
      const signHer = (localStorage.getItem("nosso-universo-signature-her") || "").trim();

      if (!signYou || !signHer) {
        if (statusEl) statusEl.textContent = "⚠️ Assine o contrato antes de baixar o PDF.";
        return;
      }

      if (statusEl) statusEl.textContent = "⏳ Gerando PDF...";
      btn.disabled = true;

      try {
        const res = await fetch("/api/contract-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            signedAt: "13/06/2024",
            signYou,
            signHer,
            variant
          })
        });

        if (!res.ok) throw new Error("Falha ao gerar PDF");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `acordo-namoro-nosso-universo.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        if (statusEl) statusEl.textContent = "✅ PDF baixado com sucesso!";
        setTimeout(() => { if (statusEl) statusEl.textContent = ""; }, 3000);
      } catch (err) {
        if (statusEl) statusEl.textContent = "❌ Erro ao gerar PDF. Tente novamente.";
      } finally {
        btn.disabled = false;
      }
    });
  });
}());

// ---- 12) Scroll progress bar ----
(function () {
  const progressBar = document.getElementById("scrollProgress");

  function onScroll() {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    const pct      = total > 0 ? (scrolled / total) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";
  }

  window.addEventListener("scroll", onScroll, { passive: true });
}());

// ---- 13) Ripple effect nos botões primários ----
document.querySelectorAll(".btn--primary").forEach(btn => {
  btn.addEventListener("click", function (e) {
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
});

// ---- 14) Nav active state por seção ----
(function () {
  const navLinks = document.querySelectorAll(".nav a[href^='#']");
  const sections = [...navLinks].map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => {
        a.classList.toggle("nav--active", a.getAttribute("href") === "#" + entry.target.id);
      });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  sections.forEach(s => io.observe(s));
}());
