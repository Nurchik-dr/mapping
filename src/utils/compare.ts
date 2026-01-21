import { normalizeSmart } from "./normalize";

export function areSimilar(a: string, b: string) {
  const na = normalizeSmart(a);
  const nb = normalizeSmart(b);

  if (na.length !== nb.length) return false;

  for (let i = 0; i < na.length; i++) {
    if (na[i] !== nb[i]) return false;
  }
  return true;
}
