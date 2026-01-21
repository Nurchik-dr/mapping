export const normalizeTitle = (value: string) => {
  const lowered = value.toLowerCase().trim();
  const replaced = lowered.replace(/[^\p{L}\p{N}]+/gu, " ");
  return replaced.replace(/\s+/g, " ").trim();
};
