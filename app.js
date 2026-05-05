const state = {
  cards: [],
  query: "",
  type: "all",
  category: "all",
  speaker: "all",
  sort: "registered",
  flagOnly: false,
};

let cardByZh = new Map();
let cardById = new Map();

const searchInput = document.querySelector("#searchInput");
const typeFilter = document.querySelector("#typeFilter");
const categoryFilter = document.querySelector("#categoryFilter");
const speakerFilter = document.querySelector("#speakerFilter");
const sortSelect = document.querySelector("#sortSelect");
const flagOnly = document.querySelector("#flagOnly");
const resetButton = document.querySelector("#resetButton");
const cardsEl = document.querySelector("#cards");
const countText = document.querySelector("#countText");
const template = document.querySelector("#cardTemplate");


async function loadCards() {
  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error("data.json を読み込めませんでした");
    state.cards = await response.json();
    rebuildIndexes();
    setupFilters();
    render();
  } catch (error) {
    cardsEl.innerHTML = `<div class="empty">${error.message}</div>`;
  }
}


function speakChinese(text) {
  const value = String(text ?? "").trim();
  if (!value) return;

  if (!("speechSynthesis" in window)) {
    alert("このブラウザは音声読み上げに対応していません。");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(value);
  utterance.lang = "zh-CN";
  utterance.rate = 0.85;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(voice => voice.lang === "zh-CN")
    || voices.find(voice => voice.lang.startsWith("zh"))
    || null;

  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
}

async function copyText(text) {
  const value = String(text ?? "");
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const temp = document.createElement("textarea");
    temp.value = value;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }
}

function rebuildIndexes() {
  cardByZh = new Map();
  cardById = new Map();

  for (const card of state.cards) {
    if (card.zh) cardByZh.set(card.zh, card);
    if (card.id != null) cardById.set(String(card.id), card);
  }
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));
}

function setupFilters() {
  addOptions(typeFilter, uniqueValues(state.cards.map(card => card.type)));
  addOptions(categoryFilter, uniqueValues(state.cards.map(card => card.category)));
  addOptions(speakerFilter, uniqueValues(state.cards.map(card => card.speaker)));
}

function addOptions(select, values) {
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }
}

function normalize(value) {
  return String(value ?? "").toLowerCase().trim();
}

function slug(value) {
  return encodeURIComponent(String(value ?? "").replaceAll("%", "%25"));
}

function cardDomId(card) {
  return `card-${card.id ?? slug(card.zh)}`;
}

function isSentenceCard(card) {
  return ["文", "セリフ", "例文"].includes(card.type);
}

function isWordCard(card) {
  return !isSentenceCard(card);
}

function matchesQuery(card) {
  const q = normalize(state.query);
  if (!q) return true;

  const haystack = [
    card.zh,
    card.pinyin,
    card.ja,
    card.literal,
    card.pattern,
    card.meaning,
    card.usage,
    ...(card.examples ?? []).flatMap(example => typeof example === "string" ? [example] : [example.zh, example.ja]),
    ...(card.related ?? []),
    card.type,
    card.category,
    card.note,
    card.source,
    card.page,
    card.speaker,
    ...(card.contains ?? []),
    ...(card.tags ?? []),
  ].map(normalize).join(" ");

  return haystack.includes(q);
}

function getExamplesForWord(word) {
  return state.cards.filter(card => {
    return isSentenceCard(card) && (card.contains ?? []).includes(word);
  });
}

function filteredCards() {
  let result = state.cards.filter(card => {
    const typeOk = state.type === "all" || card.type === state.type;
    const categoryOk = state.category === "all" || card.category === state.category;
    const speakerOk = state.speaker === "all" || card.speaker === state.speaker;
    const flagOk = !state.flagOnly || card.status === "要確認" || card.needsCheck === true;
    return typeOk && categoryOk && speakerOk && flagOk && matchesQuery(card);
  });

  result = [...result].sort((a, b) => {
    if (state.sort === "speaker") return normalize(a.speaker).localeCompare(normalize(b.speaker), "ja");
    if (state.sort === "zh") return normalize(a.zh).localeCompare(normalize(b.zh), "zh-Hans-CN");
    if (state.sort === "pinyin") return normalize(a.pinyin).localeCompare(normalize(b.pinyin));
    if (state.sort === "category") return normalize(a.category).localeCompare(normalize(b.category), "ja");
    if (state.sort === "type") return normalize(a.type).localeCompare(normalize(b.type), "ja");
    return (a.id ?? 0) - (b.id ?? 0);
  });

  return result;
}

function render() {
  const result = filteredCards();
  cardsEl.innerHTML = "";
  countText.textContent = `${result.length}件 / 全${state.cards.length}件`;

  if (result.length === 0) {
    cardsEl.innerHTML = `<div class="empty">該当するカードがありません。</div>`;
    return;
  }

  for (const card of result) {
    cardsEl.appendChild(createCardNode(card));
  }

  bindLinkClicks();
}

function createCardNode(card) {
  const node = template.content.cloneNode(true);
  const article = node.querySelector(".card");
  article.id = cardDomId(card);

  const type = card.type || "単語";
  if (isSentenceCard(card)) article.classList.add("is-sentence");

  node.querySelector(".type").textContent = type;
  node.querySelector(".category").textContent = card.category || "未分類";
  node.querySelector(".speaker-badge").textContent = card.speaker ? `話者: ${card.speaker}` : "";
  node.querySelector(".zh").textContent = card.zh || "";
  node.querySelector(".pinyin").textContent = card.pinyin || "";
  node.querySelector(".ja").textContent = card.ja || "";
  node.querySelector(".literal").textContent = card.literal || "";

  renderSyntax(node, card);
  renderRelated(node, card);

  node.querySelector(".speak-zh").addEventListener("click", () => speakChinese(card.zh));
  node.querySelector(".copy-zh").addEventListener("click", () => copyText(card.zh));

  const statusEl = node.querySelector(".status");
  const status = card.status || (card.needsCheck ? "要確認" : "確認済み");
  statusEl.textContent = status;
  if (status === "要確認" || card.needsCheck) statusEl.classList.add("needs-check");

  node.querySelector(".source").textContent = card.source ? `出典: ${card.source}` : "";
  node.querySelector(".page").textContent = card.page ? `位置: ${card.page}` : "";
  node.querySelector(".note").textContent = card.note || "";

  renderContains(node, card);
  renderExamples(node, card);
  renderTags(node, card);

  return node;
}


function renderSyntax(node, card) {
  const syntaxBlock = node.querySelector(".syntax-block");
  const syntaxExamplesBlock = node.querySelector(".syntax-examples-block");
  const syntaxExamplesEl = node.querySelector(".syntax-examples");
  const examples = card.examples ?? [];
  const hasSyntax = card.pattern || card.meaning || card.usage || examples.length > 0;

  if (!hasSyntax) {
    syntaxBlock.classList.add("is-empty");
    syntaxExamplesBlock.classList.add("is-empty");
    return;
  }

  node.querySelector(".pattern").textContent = card.pattern || "";
  node.querySelector(".meaning").textContent = card.meaning ? `意味: ${card.meaning}` : "";
  node.querySelector(".usage").textContent = card.usage || "";

  if (examples.length === 0) {
    syntaxExamplesBlock.classList.add("is-empty");
    return;
  }

  for (const example of examples) {
    const div = document.createElement("div");
    div.className = "syntax-example";

    const zh = document.createElement("p");
    zh.className = "example-zh";
    const ja = document.createElement("p");
    ja.className = "example-ja";

    if (typeof example === "string") {
      const [zhText, jaText] = example.split("|");
      zh.textContent = zhText?.trim() || example;
      ja.textContent = jaText?.trim() || "";
    } else {
      zh.textContent = example.zh || "";
      ja.textContent = example.ja || "";
    }

    div.appendChild(zh);
    if (ja.textContent) div.appendChild(ja);
    syntaxExamplesEl.appendChild(div);
  }
}

function renderRelated(node, card) {
  const relatedBlock = node.querySelector(".related-block");
  const relatedEl = node.querySelector(".related");
  const related = card.related ?? [];

  if (related.length === 0) {
    relatedBlock.classList.add("is-empty");
    return;
  }

  for (const item of related) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "word-chip";
    button.textContent = item;

    const linkedCard = cardByZh.get(item);
    if (linkedCard) {
      button.dataset.target = cardDomId(linkedCard);
      button.title = `${item} のカードへ移動`;
    } else {
      button.classList.add("is-missing");
      button.title = "このカードはまだ登録されていません";
    }

    relatedEl.appendChild(button);
  }
}


function renderContains(node, card) {
  const containsBlock = node.querySelector(".contains-block");
  const containsEl = node.querySelector(".contains");
  const contains = card.contains ?? [];

  if (contains.length === 0) {
    containsBlock.classList.add("is-empty");
    return;
  }

  for (const word of contains) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "word-chip";
    button.textContent = word;

    const linkedCard = cardByZh.get(word);
    if (linkedCard) {
      button.dataset.target = cardDomId(linkedCard);
      button.title = `${word} の単語カードへ移動`;
    } else {
      button.classList.add("is-missing");
      button.title = "この単語カードはまだ登録されていません";
    }

    containsEl.appendChild(button);
  }
}

function renderExamples(node, card) {
  const examplesBlock = node.querySelector(".examples-block");
  const examplesEl = node.querySelector(".examples");

  if (!isWordCard(card)) {
    examplesBlock.classList.add("is-empty");
    return;
  }

  const examples = getExamplesForWord(card.zh);

  if (examples.length === 0) {
    examplesBlock.classList.add("is-empty");
    return;
  }

  for (const example of examples) {
    const div = document.createElement("div");
    div.className = "example";
    div.dataset.target = cardDomId(example);
    div.title = "このセリフカードへ移動";

    const zh = document.createElement("p");
    zh.className = "example-zh";
    zh.textContent = example.zh;

    const ja = document.createElement("p");
    ja.className = "example-ja";
    ja.textContent = example.ja;

    const meta = document.createElement("p");
    meta.className = "example-meta";
    meta.textContent = [example.speaker ? `話者: ${example.speaker}` : "", example.page || ""].filter(Boolean).join(" / ");

    div.appendChild(zh);
    div.appendChild(ja);
    if (meta.textContent) div.appendChild(meta);
    examplesEl.appendChild(div);
  }
}

function renderTags(node, card) {
  const tagsEl = node.querySelector(".tags");
  for (const tag of card.tags ?? []) {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = `#${tag}`;
    tagsEl.appendChild(span);
  }
}

function bindLinkClicks() {
  document.querySelectorAll("[data-target]").forEach(element => {
    element.addEventListener("click", () => {
      const targetId = element.dataset.target;
      const target = document.getElementById(targetId);

      if (!target) {
        clearFiltersAndGo(targetId);
        return;
      }

      focusCard(target);
    });
  });
}

function focusCard(target) {
  document.querySelectorAll(".is-highlighted").forEach(card => {
    card.classList.remove("is-highlighted");
  });

  target.scrollIntoView({ behavior: "smooth", block: "center" });
  target.classList.add("is-highlighted");

  window.setTimeout(() => {
    target.classList.remove("is-highlighted");
  }, 2200);
}

function clearFiltersAndGo(targetId) {
  state.query = "";
  state.type = "all";
  state.category = "all";
  state.speaker = "all";
  state.sort = "registered";
  state.flagOnly = false;

  searchInput.value = "";
  typeFilter.value = "all";
  categoryFilter.value = "all";
  speakerFilter.value = "all";
  sortSelect.value = "registered";
  flagOnly.checked = false;

  render();

  if (!targetId) return;

  window.setTimeout(() => {
    const target = document.getElementById(targetId);
    if (target) focusCard(target);
  }, 0);
}

searchInput.addEventListener("input", event => {
  state.query = event.target.value;
  render();
});

typeFilter.addEventListener("change", event => {
  state.type = event.target.value;
  render();
});

categoryFilter.addEventListener("change", event => {
  state.category = event.target.value;
  render();
});

speakerFilter.addEventListener("change", event => {
  state.speaker = event.target.value;
  render();
});

sortSelect.addEventListener("change", event => {
  state.sort = event.target.value;
  render();
});

flagOnly.addEventListener("change", event => {
  state.flagOnly = event.target.checked;
  render();
});

resetButton.addEventListener("click", () => {
  clearFiltersAndGo("");
});

window.speechSynthesis?.addEventListener?.("voiceschanged", () => {});

loadCards();
