const state = {
  cards: [],
  selectedContains: new Set(),
};

const formIds = [
  "idInput", "typeInput", "categoryInput", "statusInput", "zhInput",
  "pinyinInput", "speakerInput", "jaInput", "literalInput",
  "patternInput", "meaningInput", "usageInput", "examplesInput", "relatedInput",
  "sourceInput", "pageInput", "tagsInput", "noteInput"
];

const els = Object.fromEntries(formIds.map(id => [id, document.querySelector(`#${id}`)]));

const categoryList = document.querySelector("#categoryList");
const speakerList = document.querySelector("#speakerList");
const containsSearch = document.querySelector("#containsSearch");
const containsCandidates = document.querySelector("#containsCandidates");
const selectedContains = document.querySelector("#selectedContains");
const manualContainsInput = document.querySelector("#manualContainsInput");
const addManualContainsButton = document.querySelector("#addManualContainsButton");
const jsonOutput = document.querySelector("#jsonOutput");
const copyObjectButton = document.querySelector("#copyObjectButton");
const copyArrayItemButton = document.querySelector("#copyArrayItemButton");
const resetFormButton = document.querySelector("#resetFormButton");

const previewZh = document.querySelector("#previewZh");
const previewPinyin = document.querySelector("#previewPinyin");
const previewJa = document.querySelector("#previewJa");
const previewMeta = document.querySelector("#previewMeta");

async function loadData() {
  try {
    const response = await fetch("data.json");
    state.cards = await response.json();
  } catch {
    state.cards = [];
  }

  setupDefaults();
  setupDatalists();
  renderContainsCandidates();
  render();
}

function setupDefaults() {
  const maxId = state.cards.reduce((max, card) => Math.max(max, Number(card.id) || 0), 0);
  els.idInput.value = maxId + 1;
  els.sourceInput.value = "有兽焉";
  els.statusInput.value = "要確認";
}

function setupDatalists() {
  addOptions(categoryList, unique(state.cards.map(card => card.category)));
  addOptions(speakerList, unique([
    "ナレーション",
    "不明",
    "モブ",
    ...state.cards.map(card => card.speaker),
    ...state.cards.filter(isWordCard).map(card => card.ja),
    ...state.cards.filter(isWordCard).map(card => card.zh),
  ]));
}

function addOptions(datalist, values) {
  datalist.innerHTML = "";
  for (const value of values.filter(Boolean)) {
    const option = document.createElement("option");
    option.value = value;
    datalist.appendChild(option);
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "ja"));
}

function isSentenceCard(card) {
  return ["文", "セリフ", "例文"].includes(card.type);
}

function isWordCard(card) {
  return !isSentenceCard(card);
}

function getWordCandidates() {
  return state.cards
    .filter(isWordCard)
    .map(card => ({
      zh: card.zh,
      ja: card.ja,
      pinyin: card.pinyin,
      type: card.type,
      category: card.category,
    }))
    .filter(item => item.zh);
}

function renderContainsCandidates() {
  const query = normalize(containsSearch.value);
  containsCandidates.innerHTML = "";

  const candidates = getWordCandidates().filter(item => {
    const target = normalize([item.zh, item.ja, item.pinyin, item.type, item.category].join(" "));
    return !query || target.includes(query);
  });

  if (candidates.length === 0) {
    containsCandidates.innerHTML = `<p class="helper-note">該当する登録済み単語がありません。</p>`;
    return;
  }

  for (const item of candidates) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "contains-choice";
    if (state.selectedContains.has(item.zh)) button.classList.add("is-selected");

    button.innerHTML = `
      <span class="contains-choice-zh">${escapeHtml(item.zh)}</span>
      <span class="contains-choice-ja">${escapeHtml(item.ja || "")}</span>
      <span class="contains-choice-meta">${escapeHtml([item.pinyin, item.type].filter(Boolean).join(" / "))}</span>
    `;

    button.addEventListener("click", () => {
      toggleContains(item.zh);
    });

    containsCandidates.appendChild(button);
  }
}

function renderSelectedContains() {
  selectedContains.innerHTML = "";

  if (state.selectedContains.size === 0) {
    selectedContains.innerHTML = `<p class="helper-note">まだ選択されていません。</p>`;
    return;
  }

  for (const word of state.selectedContains) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "word-chip";
    button.textContent = `${word} ×`;
    button.title = "クリックで削除";
    button.addEventListener("click", () => {
      state.selectedContains.delete(word);
      renderContainsCandidates();
      render();
    });
    selectedContains.appendChild(button);
  }
}

function toggleContains(word) {
  if (state.selectedContains.has(word)) {
    state.selectedContains.delete(word);
  } else {
    state.selectedContains.add(word);
  }

  renderContainsCandidates();
  render();
}

function addManualContains() {
  const value = manualContainsInput.value.trim();
  if (!value) return;

  state.selectedContains.add(value);
  manualContainsInput.value = "";
  renderContainsCandidates();
  render();
}

function buildCard() {
  return {
    id: numberOrString(els.idInput.value),
    type: els.typeInput.value.trim(),
    zh: els.zhInput.value.trim(),
    pinyin: els.pinyinInput.value.trim(),
    ja: els.jaInput.value.trim(),
    literal: els.literalInput.value.trim(),
    pattern: els.patternInput.value.trim(),
    meaning: els.meaningInput.value.trim(),
    usage: els.usageInput.value.trim(),
    examples: splitExamples(els.examplesInput.value),
    category: els.categoryInput.value.trim(),
    speaker: els.speakerInput.value.trim(),
    contains: [...state.selectedContains],
    related: splitList(els.relatedInput.value),
    tags: splitList(els.tagsInput.value),
    source: els.sourceInput.value.trim(),
    page: els.pageInput.value.trim(),
    status: els.statusInput.value.trim(),
    note: els.noteInput.value.trim(),
  };
}

function numberOrString(value) {
  const number = Number(value);
  return Number.isFinite(number) && value !== "" ? number : value;
}

function splitList(value) {
  return String(value ?? "")
    .split(/[、,，]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function splitExamples(value) {
  return String(value ?? "")
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [zh, ja] = line.split("|");
      return {
        zh: (zh || "").trim(),
        ja: (ja || "").trim(),
      };
    })
    .filter(example => example.zh || example.ja);
}

function normalize(value) {
  return String(value ?? "").toLowerCase().trim();
}

function render() {
  const card = buildCard();
  jsonOutput.textContent = JSON.stringify(card, null, 2);
  renderSelectedContains();

  previewZh.textContent = card.pattern || card.zh || "中国語原文";
  previewPinyin.textContent = card.pinyin || "ピンイン未入力";
  previewJa.textContent = card.meaning || card.ja || "日本語訳";
  previewMeta.textContent = [
    card.type,
    card.category,
    card.speaker ? `話者: ${card.speaker}` : "",
    card.status
  ].filter(Boolean).join(" / ");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }
}

function resetForm() {
  for (const id of formIds) {
    if (id === "typeInput") els[id].value = "キャラ名";
    else if (id === "statusInput") els[id].value = "要確認";
    else els[id].value = "";
  }
  state.selectedContains.clear();
  setupDefaults();
  renderContainsCandidates();
  render();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

for (const element of Object.values(els)) {
  element.addEventListener("input", render);
  element.addEventListener("change", render);
}

containsSearch.addEventListener("input", renderContainsCandidates);
addManualContainsButton.addEventListener("click", addManualContains);
manualContainsInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    addManualContains();
  }
});

copyObjectButton.addEventListener("click", () => {
  copyText(JSON.stringify(buildCard(), null, 2));
});

copyArrayItemButton.addEventListener("click", () => {
  copyText(",\n" + JSON.stringify(buildCard(), null, 2));
});

resetFormButton.addEventListener("click", resetForm);

loadData();
