const startDate = new Date("2024-06-13T00:00:00");
const checklistStorageKey = "love-lab-rosa-checklist-v1";

const quotePools = {
  mixed: [
    "Voce senta no meu lugar? So se for no sofa do coracao.",
    "Nosso relacionamento passou no teste de Sheldon: alta consistencia e zero tedio.",
    "Se amor fosse ciencia, nosso paper ja tinha premio Nobel.",
    "Bazinga para o mundo, carinho infinito para voce.",
    "Somos tipo Leonard e Penny, mas com menos drama e mais parceria.",
    "Nosso acordo de namoro tem clausula unica: rir junto todos os dias.",
    "Voce e meu episodio favorito em todas as temporadas.",
    "Se o universo expande, meu carinho por voce expande junto."
  ],
  romantic: [
    "Voce e meu lar mesmo quando o mundo acelera.",
    "Toda rotina fica bonita quando termina em abraco seu.",
    "A melhor parte do meu dia ainda e falar com voce.",
    "Nosso amor e simples, forte e muito nosso.",
    "Com voce, ate silencio vira conversa boa."
  ],
  bazinga: [
    "Toc toc toc... meu coracao abriu a porta para voce.",
    "Nosso caos teria 5 estrelas no IMDB de casais nerds.",
    "Se o Sheldon aprovou, o romance e canonico.",
    "Bazinga no mundo; carinho premium no apartamento.",
    "Esse casal passou em todos os testes do laboratorio romantico."
  ]
};

const dateIdeas = [
  "Maratona de episodio favorito + chocolate quente + manta de croche.",
  "Noite de pizza quadrada e quiz rapido de The Big Bang Theory.",
  "Sessao de fotos no estilo sitcom, com trilha e risadas.",
  "Date em casa com carta escrita a mao e playlist tranquila.",
  "Cafe da tarde com jogo de perguntas sobre nossa historia."
];

const daysCountEl = document.getElementById("daysCount");
const hoursCountEl = document.getElementById("hoursCount");
const nextCountEl = document.getElementById("nextCount");
const quoteTextEl = document.getElementById("quoteText");
const quoteModeEl = document.getElementById("quoteMode");
const ideaTextEl = document.getElementById("ideaText");
const finalMessageEl = document.getElementById("finalMessage");
const btnQuote = document.getElementById("btnQuote");
const btnIdea = document.getElementById("btnIdea");
const btnLetter = document.getElementById("btnLetter");
const btnReveal = document.getElementById("btnReveal");
const letterDialog = document.getElementById("letterDialog");
const btnBazinga = document.getElementById("btnBazinga");
const bazingaToast = document.getElementById("bazingaToast");
const checklistEl = document.getElementById("coupleChecklist");
const progressFillEl = document.getElementById("progressFill");
const progressLabelEl = document.getElementById("progressLabel");

function nextAnniversaryDate() {
  const now = new Date();
  const year = now.getMonth() > 5 || (now.getMonth() === 5 && now.getDate() > 13)
    ? now.getFullYear() + 1
    : now.getFullYear();

  return new Date(`${year}-06-13T00:00:00`);
}

function updateCounters() {
  const now = new Date();
  const diffMs = now - startDate;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const nextDiffDays = Math.ceil((nextAnniversaryDate() - now) / (1000 * 60 * 60 * 24));

  if (daysCountEl) daysCountEl.textContent = Number.isFinite(days) ? days.toLocaleString("pt-BR") : "0";
  if (hoursCountEl) hoursCountEl.textContent = Number.isFinite(hours) ? hours.toLocaleString("pt-BR") : "0";
  if (nextCountEl) nextCountEl.textContent = Number.isFinite(nextDiffDays) ? String(nextDiffDays) : "0";
}

function getQuotePool() {
  const mode = quoteModeEl?.value || "mixed";
  return quotePools[mode] || quotePools.mixed;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomQuote() {
  if (!quoteTextEl) return;
  quoteTextEl.style.opacity = "0.2";
  setTimeout(() => {
    quoteTextEl.textContent = randomItem(getQuotePool());
    quoteTextEl.style.opacity = "1";
  }, 180);
}

function randomDateIdea() {
  if (!ideaTextEl) return;
  ideaTextEl.style.opacity = "0.2";
  setTimeout(() => {
    ideaTextEl.textContent = randomItem(dateIdeas);
    ideaTextEl.style.opacity = "1";
  }, 180);
}

function showBazingaToast() {
  if (!bazingaToast) return;
  bazingaToast.classList.add("show");
  bazingaToast.setAttribute("aria-hidden", "false");
  document.body.classList.add("pulse");

  setTimeout(() => {
    bazingaToast.classList.remove("show");
    bazingaToast.setAttribute("aria-hidden", "true");
    document.body.classList.remove("pulse");
  }, 1500);
}

function revealFinalMessage() {
  if (!finalMessageEl) return;
  finalMessageEl.textContent = "Temporada atual: duas pessoas escolhendo uma a outra todos os dias. Renovada para sempre.";
}

function loadChecklistState() {
  const inputs = checklistEl?.querySelectorAll("input[type='checkbox']");
  if (!inputs?.length) return;

  try {
    const saved = JSON.parse(localStorage.getItem(checklistStorageKey) || "[]");
    inputs.forEach((input, index) => {
      input.checked = Boolean(saved[index]);
    });
  } catch {
    inputs.forEach((input) => {
      input.checked = false;
    });
  }

  updateChecklistProgress();
}

function persistChecklistState() {
  const inputs = checklistEl?.querySelectorAll("input[type='checkbox']");
  if (!inputs?.length) return;
  const values = [...inputs].map((input) => input.checked);
  localStorage.setItem(checklistStorageKey, JSON.stringify(values));
}

function updateChecklistProgress() {
  const inputs = checklistEl?.querySelectorAll("input[type='checkbox']");
  if (!inputs?.length || !progressFillEl || !progressLabelEl) return;

  const done = [...inputs].filter((input) => input.checked).length;
  const percent = Math.round((done / inputs.length) * 100);

  progressFillEl.style.width = `${percent}%`;
  progressLabelEl.textContent = `${percent}% concluido`;
}

btnQuote?.addEventListener("click", randomQuote);
btnIdea?.addEventListener("click", randomDateIdea);
btnLetter?.addEventListener("click", () => letterDialog?.showModal());
btnBazinga?.addEventListener("click", showBazingaToast);
btnReveal?.addEventListener("click", revealFinalMessage);
quoteModeEl?.addEventListener("change", randomQuote);

checklistEl?.addEventListener("change", (event) => {
  if (event.target instanceof HTMLInputElement) {
    persistChecklistState();
    updateChecklistProgress();
  }
});

loadChecklistState();
updateCounters();
setInterval(updateCounters, 60_000);
