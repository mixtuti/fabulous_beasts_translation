const state = {
  cards: [],
  quiz: [],
  current: 0,
  score: 0,
  answered: false,
  wrong: [],
  currentQuestion: null,
  orderSelection: [],
};

const TYPE_LABELS = {
  zhToJa: "中国語 → 日本語",
  jaToZh: "日本語 → 中国語",
  pinyinToZh: "ピンイン → 漢字",
  blank: "穴埋め",
  audio: "音声 → 中国語",
  order: "並び替え",
};

const startQuizButton = document.querySelector("#startQuizButton");
const selectAllTypesButton = document.querySelector("#selectAllTypesButton");
const clearTypesButton = document.querySelector("#clearTypesButton");
const selectFunTypesButton = document.querySelector("#selectFunTypesButton");
const progressText = document.querySelector("#progressText");
const scoreText = document.querySelector("#scoreText");
const questionType = document.querySelector("#questionType");
const questionText = document.querySelector("#questionText");
const choicesEl = document.querySelector("#choices");
const orderArea = document.querySelector("#orderArea");
const resultText = document.querySelector("#resultText");
const nextQuestionButton = document.querySelector("#nextQuestionButton");
const restartButton = document.querySelector("#restartButton");
const audioControls = document.querySelector("#audioControls");
const playAudioButton = document.querySelector("#playAudioButton");
const orderMaxSelect = document.querySelector("#orderMaxSelect");
const questionCountSelect = document.querySelector("#questionCountSelect");
const choiceCountSelect = document.querySelector("#choiceCountSelect");
const reviewPanel = document.querySelector("#reviewPanel");
const wrongList = document.querySelector("#wrongList");

async function loadCards() {
  const response = await fetch("data.json");
  state.cards = await response.json();
  updateScore();
}

function selectedTypes() {
  return [...document.querySelectorAll('input[name="quizType"]:checked')].map(input => input.value);
}

function setTypes(types) {
  document.querySelectorAll('input[name="quizType"]').forEach(input => {
    input.checked = types.includes(input.value);
  });
}

function startQuiz() {
  const types = selectedTypes();

  if (types.length === 0) {
    alert("出題タイプを1つ以上選んでください。");
    return;
  }

  const questions = [];
  const maxQuestions = getQuestionCount();
  const shuffledCards = shuffle(getQuizCards());

  for (const card of shuffledCards) {
    const possible = shuffle(types).map(type => makeQuestion(card, type)).filter(Boolean);
    if (possible.length > 0) questions.push(possible[0]);
    if (questions.length >= maxQuestions) break;
  }

  if (questions.length === 0) {
    alert("選択された出題タイプで作れる問題がありません。");
    return;
  }

  state.quiz = questions;
  state.current = 0;
  state.score = 0;
  state.wrong = [];
  state.answered = false;
  reviewPanel.classList.add("is-hidden");
  showQuestion();
}

function getQuizCards() {
  return state.cards.filter(isWordQuizCard);
}

function isWordQuizCard(card) {
  if (!card.zh || !card.ja) return false;
  if (["セリフ", "文", "例文", "構文"].includes(card.type)) return false;
  if (card.pattern) return false;
  return true;
}

function makeQuestion(card, type) {
  if (type === "zhToJa") return makeChoiceQuestion(card, type, card.zh, card.ja, "日本語の意味は？");
  if (type === "jaToZh") return makeChoiceQuestion(card, type, card.ja, card.zh, "この意味の中国語は？");
  if (type === "pinyinToZh") {
    if (!card.pinyin) return null;
    if (!isGoodPinyinQuizCard(card)) return null;
    return makeChoiceQuestion(card, type, card.pinyin, card.zh, "このピンインの漢字は？");
  }
  if (type === "audio") return makeChoiceQuestion(card, type, "音声を聞いて、中国語を選んでください。", card.zh, "音声問題");
  if (type === "blank") return makeBlankQuestion(card);
  if (type === "order") return makeOrderQuestion();
  return null;
}

function makeChoiceQuestion(card, type, prompt, correct, instruction) {
  const choices = makeChoices(correct, type, card);
  if (choices.length < getChoiceCount()) return null;
  return { mode: "choice", type, instruction, prompt, correct, choices, card };
}

function makeChoices(correct, type, sourceCard = null) {
  const answerField = type === "zhToJa" ? "ja" : "zh";
  const requiredWrongCount = getChoiceCount() - 1;

  let poolCards = getChoicePool(type, sourceCard)
    .filter(card => card[answerField] && card[answerField] !== correct);

  if (sourceCard) {
    poolCards = preferSimilarCards(poolCards, sourceCard, answerField, correct);
  }

  let pool = unique(poolCards.map(card => card[answerField]));

  if (pool.length < requiredWrongCount) {
    const fallback = getChoicePool(type, null)
      .filter(card => card[answerField] && card[answerField] !== correct)
      .map(card => card[answerField]);

    pool = unique([...pool, ...fallback]);
  }

  return shuffle([correct, ...shuffle(pool).slice(0, requiredWrongCount)]);
}

function getChoicePool(type, sourceCard = null) {
  if (type === "pinyinToZh") {
    return state.cards.filter(isGoodPinyinQuizCard);
  }

  return state.cards.filter(card => {
    if (!isWordQuizCard(card)) return false;

    // 4択系の選択肢に長文訳・セリフ訳が混ざるのを防ぐ
    if (String(card.zh ?? "").length > 8) return false;
    if (String(card.ja ?? "").length > 34) return false;

    return true;
  });
}

function preferSimilarCards(poolCards, sourceCard, answerField, correct) {
  const strict = poolCards.filter(card => {
    if (answerField === "zh") {
      return isSimilarLength(sourceCard.zh, card.zh);
    }

    return isSimilarJapaneseLength(correct, card.ja);
  });

  if (strict.length >= getChoiceCount() - 1) return strict;

  const relaxed = poolCards.filter(card => {
    if (answerField === "zh") {
      return Math.abs(String(sourceCard.zh ?? "").length - String(card.zh ?? "").length) <= 2;
    }

    return Math.abs(String(correct ?? "").length - String(card.ja ?? "").length) <= 12;
  });

  return relaxed.length >= getChoiceCount() - 1 ? relaxed : poolCards;
}

function isGoodPinyinQuizCard(card) {
  if (!isWordQuizCard(card)) return false;
  if (!card.pinyin) return false;
  if (String(card.zh ?? "").length > 6) return false;
  if (String(card.ja ?? "").length > 34) return false;
  return true;
}

function isSimilarLength(a, b) {
  const lenA = String(a ?? "").length;
  const lenB = String(b ?? "").length;
  return Math.abs(lenA - lenB) <= 1;
}

function isSimilarJapaneseLength(a, b) {
  const lenA = String(a ?? "").length;
  const lenB = String(b ?? "").length;
  return Math.abs(lenA - lenB) <= 8;
}

function isSimilarPinyinLength(a, b) {
  const countA = pinyinSyllableCount(a);
  const countB = pinyinSyllableCount(b);
  return Math.abs(countA - countB) <= 1;
}

function pinyinSyllableCount(value) {
  return String(value ?? "")
    .replace(/[，。！？、,.!?]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function getQuestionCount() {
  const value = Number(questionCountSelect?.value || 10);
  return Number.isFinite(value) ? value : 10;
}

function getChoiceCount() {
  const value = Number(choiceCountSelect?.value || 4);
  return Number.isFinite(value) ? value : 4;
}

function makeBlankQuestion(card) {
  const sentenceCards = state.cards.filter(c => {
    return ["セリフ", "文", "例文"].includes(c.type) && c.zh && c.ja && (c.contains ?? []).includes(card.zh);
  });

  if (sentenceCards.length === 0) return null;

  const sentence = random(sentenceCards);
  const blanked = sentence.zh.replace(card.zh, "____");
  if (blanked === sentence.zh) return null;

  const choices = makeChoices(card.zh, "jaToZh");
  if (choices.length < getChoiceCount()) return null;

  return {
    mode: "choice",
    type: "blank",
    instruction: "空欄に入る中国語は？",
    prompt: blanked,
    correct: card.zh,
    choices,
    card,
    extra: sentence.ja,
  };
}

function makeOrderQuestion() {
  const sentenceCards = shuffle(state.cards.filter(c => {
    return ["セリフ", "文", "例文"].includes(c.type) && c.zh && c.ja && (c.contains ?? []).length >= 3;
  }));

  for (const sentence of sentenceCards) {
    const orderData = buildOrderData(sentence);
    if (!orderData || orderData.correctParts.length < 3) continue;

    return {
      mode: "order",
      type: "order",
      instruction: "音声も使いながら、空欄に入る語を正しい順に並べてください",
      prompt: sentence.ja,
      correctParts: orderData.correctParts,
      choices: shuffle(orderData.correctParts),
      skeleton: orderData.skeleton,
      card: sentence,
    };
  }

  return null;
}

function buildOrderData(sentence) {
  const zh = sentence.zh || "";

  const STOP_ORDER_PARTS = new Set([
    "我", "你", "他", "她", "它", "在", "了", "就", "一", "不", "没", "有", "是", "的", "中"
  ]);

  const rawParts = [...new Set((sentence.contains ?? [])
    .filter(Boolean)
    .filter(part => !isSyntaxPart(part))
    .filter(part => part.length >= 2)
    .filter(part => !STOP_ORDER_PARTS.has(part))
  )];

  const hits = rawParts
    .map(part => ({ part, index: zh.indexOf(part) }))
    .filter(item => item.index >= 0)
    .sort((a, b) => a.index - b.index);

  let dedupedHits = removeOverlappingHits(hits);

  if (dedupedHits.length < 3) return null;

  const maxParts = getOrderMaxParts();
  dedupedHits = pickRandomOrderHits(dedupedHits, maxParts);

  if (dedupedHits.length < 3) return null;

  const correctParts = dedupedHits.map(item => item.part);
  const skeleton = [];
  let cursor = 0;

  for (const hit of dedupedHits) {
    if (hit.index > cursor) {
      skeleton.push({ type: "hint", text: zh.slice(cursor, hit.index) });
    }

    skeleton.push({ type: "blank", answer: hit.part });
    cursor = hit.index + hit.part.length;
  }

  if (cursor < zh.length) {
    skeleton.push({ type: "hint", text: zh.slice(cursor) });
  }

  return { correctParts, skeleton };
}

function getOrderMaxParts() {
  const value = Number(orderMaxSelect?.value || 5);
  return Number.isFinite(value) ? value : 5;
}

function pickRandomOrderHits(hits, maxParts) {
  if (hits.length <= maxParts) return hits;

  return shuffle(hits)
    .slice(0, maxParts)
    .sort((a, b) => a.index - b.index);
}

function isSyntaxPart(part) {
  return /[+ＡAＢBＶV]/.test(part)
    || part.includes("...")
    || part.includes("〜")
    || part.includes("～")
    || /\s[A-Z]\s?/.test(part)
    || /\b[A-Z]\b/.test(part);
}

function removeOverlappingHits(hits) {
  const selected = [];

  for (const hit of hits) {
    const hitStart = hit.index;
    const hitEnd = hit.index + hit.part.length;

    const overlaps = selected.some(existing => {
      const existingStart = existing.index;
      const existingEnd = existing.index + existing.part.length;
      return hitStart < existingEnd && existingStart < hitEnd;
    });

    if (!overlaps) {
      selected.push(hit);
    }
  }

  return selected;
}

function showQuestion() {
  state.answered = false;
  state.orderSelection = [];
  state.currentQuestion = state.quiz[state.current];

  const q = state.currentQuestion;

  choicesEl.innerHTML = "";
  orderArea.innerHTML = "";
  resultText.textContent = "";
  nextQuestionButton.disabled = true;
  audioControls.classList.toggle("is-hidden", !(q.type === "audio" || q.type === "pinyinToZh" || q.type === "order"));
  orderArea.classList.toggle("is-hidden", q.mode !== "order");

  progressText.textContent = `${state.current + 1} / ${state.quiz.length}`;
  questionType.textContent = TYPE_LABELS[q.type] || q.type;
  questionText.textContent = q.prompt;
  updateScore();

  if (q.extra) {
    const extra = document.createElement("p");
    extra.className = "quiz-extra";
    extra.textContent = q.extra;
    questionText.appendChild(extra);
  }

  if (q.mode === "choice") renderChoiceQuestion(q);
  if (q.mode === "order") renderOrderQuestion(q);

  if (q.type === "audio" || q.type === "pinyinToZh") {
    setTimeout(() => speakChinese(q.card.zh), 250);
  }
}

function renderChoiceQuestion(q) {
  for (const choice of q.choices) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = choice;
    button.addEventListener("click", () => answerChoice(button, choice));
    choicesEl.appendChild(button);
  }
}

function answerChoice(button, choice) {
  if (state.answered) return;

  const q = state.currentQuestion;
  state.answered = true;
  nextQuestionButton.disabled = false;

  const isCorrect = choice === q.correct;
  if (isCorrect) {
    state.score++;
    resultText.textContent = "正解！";
    resultText.className = "quiz-result is-correct";
  } else {
    resultText.textContent = `不正解。正解: ${q.correct}`;
    resultText.className = "quiz-result is-wrong";
    state.wrong.push(q);
  }

  [...choicesEl.children].forEach(child => {
    child.disabled = true;
    if (child.textContent === q.correct) child.classList.add("is-correct-choice");
    if (child === button && !isCorrect) child.classList.add("is-wrong-choice");
  });

  updateScore();
}

function renderOrderQuestion(q) {
  const skeleton = document.createElement("div");
  skeleton.className = "order-skeleton";

  for (const piece of q.skeleton ?? []) {
    const span = document.createElement("span");

    if (piece.type === "hint") {
      span.className = "order-hint";
      span.textContent = piece.text;
    } else {
      span.className = "order-blank";
      span.textContent = "____";
    }

    skeleton.appendChild(span);
  }

  const selected = document.createElement("div");
  selected.className = "order-selected";
  selected.textContent = "ここに選んだ順番が表示されます";

  const choices = document.createElement("div");
  choices.className = "order-choices";

  for (const part of q.choices) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = part;
    button.addEventListener("click", () => {
      if (state.answered || button.disabled) return;
      state.orderSelection.push(part);
      button.disabled = true;
      selected.textContent = state.orderSelection.join(" / ");

      if (state.orderSelection.length === q.correctParts.length) {
        answerOrder();
      }
    });
    choices.appendChild(button);
  }

  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "選び直す";
  reset.addEventListener("click", () => {
    if (state.answered) return;
    state.orderSelection = [];
    selected.textContent = "ここに選んだ順番が表示されます";
    [...choices.children].forEach(button => button.disabled = false);
  });

  orderArea.appendChild(skeleton);
  orderArea.appendChild(selected);
  orderArea.appendChild(choices);
  orderArea.appendChild(reset);
}

function answerOrder() {
  const q = state.currentQuestion;
  state.answered = true;
  nextQuestionButton.disabled = false;

  const answer = state.orderSelection.join("|");
  const correct = q.correctParts.join("|");

  if (answer === correct) {
    state.score++;
    resultText.textContent = "正解！";
    resultText.className = "quiz-result is-correct";
  } else {
    resultText.textContent = `不正解。正解: ${q.correctParts.join(" / ")}`;
    resultText.className = "quiz-result is-wrong";
    state.wrong.push(q);
  }

  updateScore();
}

function nextQuestion() {
  if (state.current + 1 >= state.quiz.length) {
    finishQuiz();
    return;
  }
  state.current++;
  showQuestion();
}

function finishQuiz() {
  progressText.textContent = "終了";
  questionType.textContent = "結果";
  questionText.textContent = `スコア: ${state.score} / ${state.quiz.length}`;
  choicesEl.innerHTML = "";
  orderArea.innerHTML = "";
  audioControls.classList.add("is-hidden");
  resultText.textContent = "";
  nextQuestionButton.disabled = true;
  renderReview();
}

function renderReview() {
  wrongList.innerHTML = "";

  if (state.wrong.length === 0) {
    reviewPanel.classList.remove("is-hidden");
    wrongList.innerHTML = `<p class="helper-note">全問正解！</p>`;
    return;
  }

  reviewPanel.classList.remove("is-hidden");

  for (const q of state.wrong) {
    const div = document.createElement("div");
    div.className = "wrong-item";
    div.innerHTML = `
      <p class="wrong-type">${TYPE_LABELS[q.type] || q.type}</p>
      <p><strong>問題:</strong> ${escapeHtml(q.prompt)}</p>
      <p><strong>正解:</strong> ${escapeHtml(q.correct || (q.correctParts ?? []).join(" / "))}</p>
      <p><strong>カード:</strong> ${escapeHtml(q.card?.zh || "")} / ${escapeHtml(q.card?.ja || "")}</p>
    `;
    wrongList.appendChild(div);
  }
}

function updateScore() {
  scoreText.textContent = `${state.score} / ${state.quiz.length || 0}`;
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

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function random(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function unique(array) {
  return [...new Set(array)];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

startQuizButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", startQuiz);
nextQuestionButton.addEventListener("click", nextQuestion);
playAudioButton.addEventListener("click", () => {
  if (state.currentQuestion?.card?.zh) speakChinese(state.currentQuestion.card.zh);
});

selectAllTypesButton.addEventListener("click", () => setTypes(Object.keys(TYPE_LABELS)));
clearTypesButton.addEventListener("click", () => setTypes([]));
selectFunTypesButton.addEventListener("click", () => setTypes(["blank", "audio", "order"]));

window.speechSynthesis?.addEventListener?.("voiceschanged", () => {});

loadCards();
