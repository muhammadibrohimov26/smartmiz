// Current Uzbek Latin → the updated Latin alphabet (law OʻRQ-1184, signed
// 21 October 2026, in force from 22 April 2027): oʻ → ö, gʻ → ğ, sh → ş,
// ch → ç (ng is no longer a separate letter but is written the same; the
// tutuq belgisi ʼ stays). Used for the "Özbekça" site language, converted on
// the fly so it never falls behind the current Latin texts.
//
// Kept as they are: {placeholders}, links, e-mails, ALL-CAPS names (IELTS,
// CEFR, C1) and foreign words that happen to contain sh / ch (English…).

const KEEP_WORDS = /^(english|telegram|instagram|youtube|google|facebook|windows|word|excel|powerpoint|python|scratch|lego|general|smartmiz\w*)$/i;

const TOKEN = /(\{\w+\}|https?:\/\/\S+|[\w.+-]+@[\w-]+\.[\w.]+|[A-Za-z][A-Za-z0-9]*(?:[ʻ‘'`’ʼ][A-Za-z]+)*)/g;

function convertWord(word: string) {
  if (KEEP_WORDS.test(word)) return word;
  const letters = word.replace(/[^A-Za-z]/g, "");
  if (letters === letters.toUpperCase() && /[A-Z]/.test(letters) && (letters.length >= 2 || /\d/.test(word))) return word;
  return word
    .replace(/([OoGg])[ʻ‘'`’]/g, (_, c: string) => ({ O: "Ö", o: "ö", G: "Ğ", g: "ğ" })[c]!)
    .replace(/S[Hh]/g, "Ş")
    .replace(/sh/g, "ş")
    .replace(/C[Hh]/g, "Ç")
    .replace(/ch/g, "ç");
}

export function toNewLatin(text: string): string {
  if (!text) return text;
  return text.replace(TOKEN, (token) => (/^[A-Za-z]/.test(token) ? convertWord(token) : token));
}
