const COMMON_CHARS = [
  {
    "char": "的",
    "pinyin": "de",
    "meaning": "所有・〜の／構造助詞"
  },
  {
    "char": "一",
    "pinyin": "yī / yì / yí",
    "meaning": "一つ"
  },
  {
    "char": "是",
    "pinyin": "shì",
    "meaning": "〜である"
  },
  {
    "char": "不",
    "pinyin": "bù",
    "meaning": "〜ない"
  },
  {
    "char": "了",
    "pinyin": "le / liǎo",
    "meaning": "完了・変化／分かる"
  },
  {
    "char": "人",
    "pinyin": "rén",
    "meaning": "人"
  },
  {
    "char": "我",
    "pinyin": "wǒ",
    "meaning": "私"
  },
  {
    "char": "在",
    "pinyin": "zài",
    "meaning": "〜にいる／〜で"
  },
  {
    "char": "有",
    "pinyin": "yǒu",
    "meaning": "ある・持つ"
  },
  {
    "char": "他",
    "pinyin": "tā",
    "meaning": "彼"
  },
  {
    "char": "这",
    "pinyin": "zhè",
    "meaning": "これ・この"
  },
  {
    "char": "为",
    "pinyin": "wéi / wèi",
    "meaning": "〜のため／〜となる"
  },
  {
    "char": "之",
    "pinyin": "zhī",
    "meaning": "これ・それ／〜の"
  },
  {
    "char": "大",
    "pinyin": "dà",
    "meaning": "大きい"
  },
  {
    "char": "来",
    "pinyin": "lái",
    "meaning": "来る"
  },
  {
    "char": "以",
    "pinyin": "yǐ",
    "meaning": "〜を用いて／〜によって"
  },
  {
    "char": "个",
    "pinyin": "gè",
    "meaning": "個・量詞"
  },
  {
    "char": "中",
    "pinyin": "zhōng",
    "meaning": "中・中央"
  },
  {
    "char": "上",
    "pinyin": "shàng",
    "meaning": "上"
  },
  {
    "char": "们",
    "pinyin": "men",
    "meaning": "複数接尾辞"
  },
  {
    "char": "到",
    "pinyin": "dào",
    "meaning": "到着する／〜まで"
  },
  {
    "char": "说",
    "pinyin": "shuō",
    "meaning": "言う"
  },
  {
    "char": "国",
    "pinyin": "guó",
    "meaning": "国"
  },
  {
    "char": "和",
    "pinyin": "hé / huò",
    "meaning": "〜と／和やか"
  },
  {
    "char": "地",
    "pinyin": "dì / de",
    "meaning": "地・場所／副詞化"
  },
  {
    "char": "也",
    "pinyin": "yě",
    "meaning": "〜も"
  },
  {
    "char": "子",
    "pinyin": "zǐ",
    "meaning": "子"
  },
  {
    "char": "时",
    "pinyin": "shí",
    "meaning": "時"
  },
  {
    "char": "道",
    "pinyin": "dào",
    "meaning": "道・方法・言う"
  },
  {
    "char": "出",
    "pinyin": "chū",
    "meaning": "出る"
  },
  {
    "char": "而",
    "pinyin": "ér",
    "meaning": "そして／しかし"
  },
  {
    "char": "要",
    "pinyin": "yào / yāo",
    "meaning": "欲しい／必要"
  },
  {
    "char": "于",
    "pinyin": "yú",
    "meaning": "〜において"
  },
  {
    "char": "就",
    "pinyin": "jiù",
    "meaning": "すぐ／それなら"
  },
  {
    "char": "下",
    "pinyin": "xià",
    "meaning": "下"
  },
  {
    "char": "得",
    "pinyin": "dé / de / děi",
    "meaning": "得る／〜しなければ"
  },
  {
    "char": "可",
    "pinyin": "kě",
    "meaning": "できる／〜してよい"
  },
  {
    "char": "你",
    "pinyin": "nǐ",
    "meaning": "あなた"
  },
  {
    "char": "年",
    "pinyin": "nián",
    "meaning": "年"
  },
  {
    "char": "生",
    "pinyin": "shēng",
    "meaning": "生まれる／生"
  },
  {
    "char": "自",
    "pinyin": "zì",
    "meaning": "自分／〜から"
  },
  {
    "char": "会",
    "pinyin": "huì",
    "meaning": "できる／会う"
  },
  {
    "char": "那",
    "pinyin": "nà",
    "meaning": "あれ・その"
  },
  {
    "char": "后",
    "pinyin": "hòu",
    "meaning": "後"
  },
  {
    "char": "能",
    "pinyin": "néng",
    "meaning": "できる"
  },
  {
    "char": "对",
    "pinyin": "duì",
    "meaning": "正しい／〜に対して"
  },
  {
    "char": "着",
    "pinyin": "zhe / zhuó / zhāo / zháo",
    "meaning": "持続・状態助詞"
  },
  {
    "char": "事",
    "pinyin": "shì",
    "meaning": "事"
  },
  {
    "char": "其",
    "pinyin": "qí",
    "meaning": "その"
  },
  {
    "char": "里",
    "pinyin": "lǐ",
    "meaning": "中・里"
  },
  {
    "char": "所",
    "pinyin": "suǒ",
    "meaning": "場所／〜するところ"
  },
  {
    "char": "去",
    "pinyin": "qù",
    "meaning": "行く"
  },
  {
    "char": "行",
    "pinyin": "háng / xíng",
    "meaning": "行・業種／できる・行く"
  },
  {
    "char": "过",
    "pinyin": "guò",
    "meaning": "過ぎる／経験助詞"
  },
  {
    "char": "家",
    "pinyin": "jiā",
    "meaning": "家"
  },
  {
    "char": "十",
    "pinyin": "shí",
    "meaning": "十"
  },
  {
    "char": "用",
    "pinyin": "yòng",
    "meaning": "使う"
  },
  {
    "char": "发",
    "pinyin": "fā / fà",
    "meaning": "発する／髪"
  },
  {
    "char": "天",
    "pinyin": "tiān",
    "meaning": "天・日"
  },
  {
    "char": "如",
    "pinyin": "rú",
    "meaning": "〜のように"
  },
  {
    "char": "然",
    "pinyin": "rán",
    "meaning": "そうである"
  },
  {
    "char": "作",
    "pinyin": "zuò",
    "meaning": "作る・する"
  },
  {
    "char": "方",
    "pinyin": "fāng",
    "meaning": "方・方向"
  },
  {
    "char": "成",
    "pinyin": "chéng",
    "meaning": "成る・完成する"
  },
  {
    "char": "者",
    "pinyin": "zhě",
    "meaning": "〜する者"
  },
  {
    "char": "多",
    "pinyin": "duō",
    "meaning": "多い"
  },
  {
    "char": "日",
    "pinyin": "rì",
    "meaning": "日・太陽"
  },
  {
    "char": "都",
    "pinyin": "dōu",
    "meaning": "すべて"
  },
  {
    "char": "三",
    "pinyin": "sān",
    "meaning": "三"
  },
  {
    "char": "小",
    "pinyin": "xiǎo",
    "meaning": "小さい"
  },
  {
    "char": "军",
    "pinyin": "jūn",
    "meaning": "軍"
  },
  {
    "char": "二",
    "pinyin": "èr",
    "meaning": "二"
  },
  {
    "char": "无",
    "pinyin": "wú",
    "meaning": "無い"
  },
  {
    "char": "同",
    "pinyin": "tóng",
    "meaning": "同じ"
  },
  {
    "char": "么",
    "pinyin": "me",
    "meaning": "疑問・語気の接尾辞"
  },
  {
    "char": "经",
    "pinyin": "jīng",
    "meaning": "経る・経典"
  },
  {
    "char": "法",
    "pinyin": "fǎ",
    "meaning": "法・方法"
  },
  {
    "char": "当",
    "pinyin": "dāng / dàng",
    "meaning": "〜すべき／当たる"
  },
  {
    "char": "起",
    "pinyin": "qǐ",
    "meaning": "起きる・始まる"
  },
  {
    "char": "与",
    "pinyin": "yú / yǔ / yù",
    "meaning": "〜と／与える"
  },
  {
    "char": "好",
    "pinyin": "hǎo / hào",
    "meaning": "良い／好む"
  },
  {
    "char": "看",
    "pinyin": "kān / kàn",
    "meaning": "見る／見守る"
  },
  {
    "char": "学",
    "pinyin": "xué",
    "meaning": "学ぶ"
  },
  {
    "char": "进",
    "pinyin": "jìn",
    "meaning": "入る・進む"
  },
  {
    "char": "种",
    "pinyin": "zhǒng / zhòng",
    "meaning": "種類／植える"
  },
  {
    "char": "将",
    "pinyin": "jiāng / jiàng",
    "meaning": "まさに〜する／将軍"
  },
  {
    "char": "还",
    "pinyin": "hái / huán",
    "meaning": "まだ・また／返す"
  },
  {
    "char": "分",
    "pinyin": "fēn / fèn",
    "meaning": "分ける／部分"
  },
  {
    "char": "此",
    "pinyin": "cǐ",
    "meaning": "この"
  },
  {
    "char": "心",
    "pinyin": "xīn",
    "meaning": "心"
  },
  {
    "char": "前",
    "pinyin": "qián",
    "meaning": "前"
  },
  {
    "char": "面",
    "pinyin": "miàn",
    "meaning": "面・顔"
  },
  {
    "char": "又",
    "pinyin": "yòu",
    "meaning": "また"
  },
  {
    "char": "定",
    "pinyin": "dìng",
    "meaning": "定める"
  },
  {
    "char": "见",
    "pinyin": "jiàn / xiàn",
    "meaning": "見る・会う／現れる"
  },
  {
    "char": "只",
    "pinyin": "zhī / zhǐ",
    "meaning": "匹・羽／ただ〜だけ"
  },
  {
    "char": "主",
    "pinyin": "zhǔ",
    "meaning": "主・主人"
  },
  {
    "char": "没",
    "pinyin": "méi / mò",
    "meaning": "ない／沈む"
  },
  {
    "char": "公",
    "pinyin": "gōng",
    "meaning": "公・公共"
  },
  {
    "char": "从",
    "pinyin": "cóng",
    "meaning": "〜から"
  }
];

const PHRASES = [
  "你",
  "我",
  "他",
  "她",
  "它",
  "我们",
  "你们",
  "他们",
  "这个",
  "那个",
  "这里",
  "那里",
  "什么",
  "怎么",
  "为什么",
  "是不是",
  "不是",
  "没有",
  "可以",
  "应该",
  "不要",
  "不能",
  "还要",
  "又来了",
  "人间",
  "神兽",
  "下凡",
  "貔貅",
  "四不像",
  "。",
  "，",
  "、",
  "？",
  "！",
  "：",
  "；",
  "“",
  "”",
  "《",
  "》",
  "（",
  "）"
];

const zhDraft = document.querySelector("#zhDraft");
const speakDraftButton = document.querySelector("#speakDraftButton");
const copyDraftButton = document.querySelector("#copyDraftButton");
const clearDraftButton = document.querySelector("#clearDraftButton");
const commonChars = document.querySelector("#commonChars");
const phraseButtons = document.querySelector("#phraseButtons");
const charSearch = document.querySelector("#charSearch");

function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  textarea.value = textarea.value.slice(0, start) + text + textarea.value.slice(end);
  const next = start + text.length;
  textarea.focus();
  textarea.setSelectionRange(next, next);
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

function renderCommonChars() {
  const query = String(charSearch.value ?? "").toLowerCase().trim();
  commonChars.innerHTML = "";

  const filtered = COMMON_CHARS.filter(item => {
    const target = [item.char, item.pinyin, item.meaning].join(" ").toLowerCase();
    return !query || target.includes(query);
  });

  for (const item of filtered) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "char-card";
    button.title = `${item.char} を入力`;

    const charEl = document.createElement("span");
    charEl.className = "char-card-main";
    charEl.textContent = item.char;

    const pinyinEl = document.createElement("span");
    pinyinEl.className = "char-card-pinyin";
    pinyinEl.textContent = item.pinyin;

    const meaningEl = document.createElement("span");
    meaningEl.className = "char-card-meaning";
    meaningEl.textContent = item.meaning;

    button.appendChild(charEl);
    button.appendChild(pinyinEl);
    button.appendChild(meaningEl);
    button.addEventListener("click", () => insertAtCursor(zhDraft, item.char));

    commonChars.appendChild(button);
  }
}

function renderPhrases() {
  for (const phrase of PHRASES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quick-char";
    button.textContent = phrase;
    button.addEventListener("click", () => insertAtCursor(zhDraft, phrase));
    phraseButtons.appendChild(button);
  }
}

speakDraftButton.addEventListener("click", () => speakChinese(zhDraft.value));
copyDraftButton.addEventListener("click", () => copyText(zhDraft.value));
clearDraftButton.addEventListener("click", () => {
  zhDraft.value = "";
  zhDraft.focus();
});

charSearch.addEventListener("input", renderCommonChars);
window.speechSynthesis?.addEventListener?.("voiceschanged", () => {});

renderCommonChars();
renderPhrases();
