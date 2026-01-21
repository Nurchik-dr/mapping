export const extractString = (row: Record<string, any>, key: string) => {
  const value = row[key];
  if (value === undefined || value === null) {
    return "";
  }
  return String(value);
};

export const detectKeys = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return [];
  return Object.keys(rows[0]);
};
