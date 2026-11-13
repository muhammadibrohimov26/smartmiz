// Uzbek Latin → Uzbek Cyrillic, for the "Ўзбекча" (uzc) site language: every
// Uzbek text (dictionary and admin data) is converted on the fly, so the
// Cyrillic version never falls behind the Latin one.
//
// Kept in Latin: {placeholders}, links, e-mails, ALL-CAPS names (IELTS,
// CEFR, EPS…) and brand names. Russian loanwords that keep a soft sign or
// other letters in Cyrillic are listed in EXCEPTIONS (matched as word starts).

const KEEP_WORDS = /^(telegram|instagram|youtube|google|facebook|windows|word|excel|powerpoint|python|scratch|lego|general|english)$/i;
// The brand stays in Latin, its suffix is converted: Smartmizda → Smartmizда
const BRAND = /^(smartmiz)(.*)$/i;

// Latin word start → Cyrillic (the rest of the word is converted normally)
const EXCEPTIONS: [string, string][] = [
  ["kompyuter", "компьютер"],
  ["online", "онлайн"],
  ["offline", "офлайн"],
  ["yanvar", "январь"],
  ["fevral", "февраль"],
  ["aprel", "апрель"],
  ["iyun", "июнь"],
  ["iyul", "июль"],
  ["sentabr", "сентябрь"],
  ["oktabr", "октябрь"],
  ["noyabr", "ноябрь"],
  ["dekabr", "декабрь"],
  ["mentalitet", "менталитет"],
];

const LETTERS: Record<string, string> = {
  a: "а", b: "б", c: "ц", d: "д", f: "ф", g: "г", h: "ҳ", i: "и", j: "ж", k: "к",
  l: "л", m: "м", n: "н", o: "о", p: "п", q: "қ", r: "р", s: "с", t: "т", u: "у",
  v: "в", w: "в", x: "х", y: "й", z: "з",
};
const VOWELS = new Set(["a", "e", "i", "o", "u", "ў"]);
const TURNED = /[ʻ‘'`’]/; // oʻ, gʻ (written several ways)
const STOP = /[ʼ'’]/; // tutuq belgisi: taʼlim → таълим

function convertWord(word: string): string {
  if (KEEP_WORDS.test(word)) return word;
  const brand = word.match(BRAND);
  if (brand) return brand[1] + (brand[2] ? convertWord(brand[2]) : "");
  // ALL-CAPS abbreviations stay as they are: IELTS, CEFR, EPS, IT, and levels like C1, B2
  const letters = word.replace(/[^A-Za-z]/g, "");
  if (letters === letters.toUpperCase() && /[A-Z]/.test(letters) && (letters.length >= 2 || /\d/.test(word))) return word;

  const upperWord = letters.length > 1 && letters === letters.toUpperCase();
  const lower = word.toLowerCase();
  let out = "";
  let i = 0;

  for (const [lat, cyr] of EXCEPTIONS) {
    if (lower.startsWith(lat)) {
      out = /^[A-Z]/.test(word) ? cyr[0].toUpperCase() + cyr.slice(1) : cyr;
      i = lat.length;
      break;
    }
  }

  const caseOf = (src: string, cyr: string) => (upperWord ? cyr.toUpperCase() : /[A-Z]/.test(src) ? cyr[0].toUpperCase() + cyr.slice(1) : cyr);

  while (i < word.length) {
    const c = lower[i];
    const next = lower[i + 1] ?? "";
    const prevOut = out.slice(-1).toLowerCase();
    const atStart = out === "" || !/[а-яёўқғҳъ]/i.test(prevOut);

    if ((c === "o" || c === "g") && TURNED.test(next)) {
      out += caseOf(word[i], c === "o" ? "ў" : "ғ");
      i += 2;
    } else if (c === "s" && next === "h") {
      out += caseOf(word[i], "ш");
      i += 2;
    } else if (c === "c" && next === "h") {
      out += caseOf(word[i], "ч");
      i += 2;
    } else if (c === "y" && "oaue".includes(next) && next && !(next === "o" && TURNED.test(lower[i + 2] ?? ""))) {
      out += caseOf(word[i], { o: "ё", a: "я", u: "ю", e: "е" }[next]!);
      i += 2;
    } else if (c === "e") {
      // э at the start of a word and after a vowel, е elsewhere
      out += caseOf(word[i], atStart || VOWELS.has(prevOut === "ў" ? "ў" : translitBack(prevOut)) ? "э" : "е");
      i += 1;
    } else if (STOP.test(word[i]) && i > 0) {
      out += upperWord ? "Ъ" : "ъ";
      i += 1;
    } else if (LETTERS[c]) {
      out += caseOf(word[i], LETTERS[c]);
      i += 1;
    } else {
      out += word[i];
      i += 1;
    }
  }
  return out;
}

// Cyrillic vowel → Latin vowel (for the э rule)
function translitBack(cyr: string) {
  return ({ а: "a", э: "e", е: "e", и: "i", о: "o", у: "u", я: "a", ё: "o", ю: "u" } as Record<string, string>)[cyr] ?? "";
}

// Words are runs of Latin letters with the apostrophes Uzbek uses inside
// words; placeholders, links and e-mails are passed through untouched.
const TOKEN = /(\{\w+\}|https?:\/\/\S+|[\w.+-]+@[\w-]+\.[\w.]+|[A-Za-z][A-Za-z0-9]*(?:[ʻ‘'`’ʼ][A-Za-z]+)*)/g;

export function toCyrillic(text: string): string {
  if (!text) return text;
  return text.replace(TOKEN, (token) => (/^[A-Za-z]/.test(token) ? convertWord(token) : token));
}
