export type SimilarityResult = {
  title: string;
  score: number;
};

export function normalizeSmart(title: string) {
  if (!title) return [] as string[];

  let t = title.toLowerCase().trim();

  t = t.replace(/ё/g, "е");

  t = t
    .replace(/литр|л\./g, "л")
    .replace(/миллилитр|мл\./g, "мл")
    .replace(/грамм|гр\./g, "г")
    .replace(/килограмм|кг\./g, "кг")
    .replace(/(\d)\s*(л|мл|кг|г)/g, "$1$2");

  t = t.replace(/\s*%\s*/g, "%");

  t = t.replace(/[^\p{L}\p{N}%]+/gu, " ");

  return t.split(/\s+/g).filter(Boolean);
}

export function similarityScore(a: string, b: string) {
  const na = normalizeSmart(a);
  const nb = normalizeSmart(b);

  if (!na.length || !nb.length) return 0;

  const weights = (token: string) => (/[\d%]/.test(token) ? 2 : 1);

  const mapA = new Map<string, number>();
  const mapB = new Map<string, number>();

  na.forEach((token) => {
    mapA.set(token, (mapA.get(token) ?? 0) + weights(token));
  });
  nb.forEach((token) => {
    mapB.set(token, (mapB.get(token) ?? 0) + weights(token));
  });

  const tokens = new Set([...mapA.keys(), ...mapB.keys()]);
  let intersection = 0;
  let union = 0;

  tokens.forEach((token) => {
    const aWeight = mapA.get(token) ?? 0;
    const bWeight = mapB.get(token) ?? 0;
    intersection += Math.min(aWeight, bWeight);
    union += Math.max(aWeight, bWeight);
  });

  if (!union) return 0;

  return intersection / union;
}

export function findBestMatch(title: string, candidates: string[]): SimilarityResult {
  let bestTitle = "";
  let bestScore = 0;

  for (const candidate of candidates) {
    const score = similarityScore(title, candidate);
    if (score > bestScore) {
      bestScore = score;
      bestTitle = candidate;
    }
  }

  return { title: bestTitle, score: bestScore };
}
