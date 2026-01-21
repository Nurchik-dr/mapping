export function normalizeSmart(title: string) {
  if (!title) return [];

  let t = title.toLowerCase().trim();

  // ё → е
  t = t.replace(/ё/g, "е");

  // литры
  t = t
    .replace(/литр|л\./g, "л")   // литр → л, л. → л
    .replace(/(\d)\s*л/g, "$1л"); // 1 л → 1л

  // проценты
  t = t.replace(/\s*%\s*/g, "%"); // 20 % → 20%

  // убрать всё кроме букв/цифр/% → заменить на пробел
  t = t.replace(/[^\p{L}\p{N}%]+/gu, " ");

  // разбить и отсортировать токены
  const tokens = t.split(/\s+/g).filter(Boolean).sort();

  return tokens;
}
