// src/utils/similarity.ts

export function normalizeSmart(title: string) {
  if (!title) return [];

  let t = title.toLowerCase().trim();

  // ё → е
  t = t.replace(/ё/g, "е");

  // литры
  t = t
    .replace(/литр|л\./g, "л")
    .replace(/(\d)\s*л/g, "$1л");

  // проценты
  t = t.replace(/\s*%\s*/g, "%");

  // убрать всё кроме букв/цифр/% → пробел
  t = t.replace(/[^\p{L}\p{N}%]+/gu, " ");

  const tokens = t.split(/\s+/g).filter(Boolean).sort();
  return tokens;
}

export function areSimilar(a: string, b: string) {
  const na = normalizeSmart(a);
  const nb = normalizeSmart(b);

  if (na.length !== nb.length) return false;
  for (let i = 0; i < na.length; i++) {
    if (na[i] !== nb[i]) return false;
  }
  return true;
}
