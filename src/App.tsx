import { useEffect, useMemo, useState } from "react";
import data from "./mapped.json";
import "./index.css";
import { detectKeys, extractString } from "./utils/extract";
import { findBestMatch } from "./utils/similarity";

type MappingRow = Record<string, any> & {
  __suggested?: string;
  __score?: number;
  __fixed?: boolean;
  __original_mapped?: string;
};

type UploadState = {
  rows: MappingRow[];
  baseline: MappingRow[];
  fileName: string;
};

const cloneRows = (rows: MappingRow[]) =>
  JSON.parse(JSON.stringify(rows)) as MappingRow[];

const App = () => {
  const [mapping, setMapping] = useState<UploadState>({
    rows: [],
    baseline: [],
    fileName: "mapping-fixed.json"
  });
  const [referenceRows, setReferenceRows] = useState<Array<Record<string, any> | string>>([]);
  const [mappingTitleKey, setMappingTitleKey] = useState("title");
  const [mappedTitleKey, setMappedTitleKey] = useState("matched_csv_title");
  const [referenceTitleKey, setReferenceTitleKey] = useState("title");
  const [scoreThreshold, setScoreThreshold] = useState(0.7);

  useEffect(() => {
    const initial = data as MappingRow[];
    setMapping({
      rows: cloneRows(initial),
      baseline: cloneRows(initial),
      fileName: "mapping-fixed.json"
    });
  }, []);

  const mappingKeys = useMemo(() => detectKeys(mapping.rows), [mapping.rows]);
  const referenceKeys = useMemo(() => {
    if (!referenceRows.length) return [];
    if (typeof referenceRows[0] === "string") return [];
    return detectKeys(referenceRows as Record<string, any>[]);
  }, [referenceRows]);

  useEffect(() => {
    if (mappingKeys.length && !mappingKeys.includes(mappingTitleKey)) {
      setMappingTitleKey(mappingKeys[0]);
    }
    if (mappingKeys.length && !mappingKeys.includes(mappedTitleKey)) {
      setMappedTitleKey(mappingKeys[0]);
    }
  }, [mappingKeys, mappingTitleKey, mappedTitleKey]);

  useEffect(() => {
    if (referenceKeys.length && !referenceKeys.includes(referenceTitleKey)) {
      setReferenceTitleKey(referenceKeys[0]);
    }
  }, [referenceKeys, referenceTitleKey]);

  const candidates = useMemo(() => {
    if (!referenceRows.length) return [] as string[];
    return referenceRows
      .map((row) => (typeof row === "string" ? row : extractString(row, referenceTitleKey)))
      .filter(Boolean);
  }, [referenceRows, referenceTitleKey]);

  const results = useMemo(() => {
    return mapping.rows.map((row) => {
      const expected = extractString(row, mappingTitleKey);
      const mappedValue = extractString(row, mappedTitleKey);

      if (!expected) {
        return {
          ...row,
          __suggested: "",
          __score: 0
        };
      }

      const best = candidates.length
        ? findBestMatch(expected, candidates)
        : { title: "", score: 0 };

      return {
        ...row,
        __suggested: best.title,
        __score: best.score,
        __original_mapped: row.__original_mapped ?? mappedValue
      };
    });
  }, [mapping.rows, mappingTitleKey, mappedTitleKey, candidates]);

  const mismatchCount = results.filter((row) => {
    const expected = extractString(row, mappingTitleKey);
    const mappedValue = extractString(row, mappedTitleKey);
    return expected && expected !== mappedValue;
  }).length;

  const fixableCount = results.filter(
    (row) => (row.__score ?? 0) >= scoreThreshold && row.__suggested
  ).length;

  const appliedCount = results.filter((row) => row.__fixed).length;

  const handleLoadMapping = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        if (!Array.isArray(json)) throw new Error("Ожидается JSON-массив");
        const rows = cloneRows(json as MappingRow[]);
        setMapping({
          rows,
          baseline: cloneRows(rows),
          fileName: file.name.replace(/\.json$/i, "") + "-fixed.json"
        });
      } catch {
        alert("Ошибка: неверный JSON");
      }
    };
    reader.readAsText(file);
  };

  const handleLoadReference = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        if (!Array.isArray(json)) throw new Error("Ожидается JSON-массив");
        setReferenceRows(json as Array<Record<string, any> | string>);
      } catch {
        alert("Ошибка: неверный JSON");
      }
    };
    reader.readAsText(file);
  };

  const applyFix = (index: number) => {
    setMapping((prev) => {
      const next = cloneRows(prev.rows);
      const row = results[index];
      if (!row?.__suggested) return prev;
      if ((row.__score ?? 0) < scoreThreshold) return prev;

      next[index] = {
        ...next[index],
        [mappedTitleKey]: row.__suggested,
        __fixed: true,
        __original_mapped: row.__original_mapped ?? extractString(row, mappedTitleKey)
      };

      return { ...prev, rows: next };
    });
  };

  const applyAllFixes = () => {
    setMapping((prev) => {
      const next = prev.rows.map((row, index) => {
        const result = results[index];
        if (!result?.__suggested) return row;
        if ((result.__score ?? 0) < scoreThreshold) return row;
        return {
          ...row,
          [mappedTitleKey]: result.__suggested,
          __fixed: true,
          __original_mapped: result.__original_mapped ?? extractString(row, mappedTitleKey)
        };
      });
      return { ...prev, rows: next };
    });
  };

  const resetFixes = () => {
    setMapping((prev) => ({
      ...prev,
      rows: cloneRows(prev.baseline)
    }));
  };

  const downloadResult = () => {
    const payload = mapping.rows.map(({ __suggested, __score, __fixed, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = mapping.fileName || "mapping-fixed.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Автоматическое исправление маппинга</p>
          <h1>Mapping Fixer</h1>
          <p className="hero-subtitle">
            Загрузи файл с текущим маппингом и справочник (например, Яндекс). Сервис
            предложит правильные соответствия и позволит автоматически исправить ошибки.
          </p>
        </div>
        <div className="hero-card">
          <div className="hero-stat">
            <span>Всего строк</span>
            <strong>{results.length}</strong>
          </div>
          <div className="hero-stat">
            <span>Несоответствия</span>
            <strong>{mismatchCount}</strong>
          </div>
          <div className="hero-stat">
            <span>Можно исправить</span>
            <strong>{fixableCount}</strong>
          </div>
          <div className="hero-stat">
            <span>Уже исправлено</span>
            <strong>{appliedCount}</strong>
          </div>
        </div>
      </header>

      <section className="panel-grid">
        <div className="panel">
          <h3>1. Файл с текущим маппингом</h3>
          <p>JSON-массив объектов, где есть поле с ожидаемым названием и поле с замапленным.</p>
          <label className="file-btn">
            Загрузить JSON
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLoadMapping(file);
              }}
            />
          </label>
          <div className="field-row">
            <span>Поле ожидаемого названия</span>
            <select value={mappingTitleKey} onChange={(e) => setMappingTitleKey(e.target.value)}>
              {mappingKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <div className="field-row">
            <span>Поле замапленного названия</span>
            <select value={mappedTitleKey} onChange={(e) => setMappedTitleKey(e.target.value)}>
              {mappingKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="panel">
          <h3>2. Справочник для проверки</h3>
          <p>JSON-массив объектов или строк (список корректных названий).</p>
          <label className="file-btn">
            Загрузить JSON
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLoadReference(file);
              }}
            />
          </label>
          <div className="field-row">
            <span>Поле названия</span>
            {referenceKeys.length ? (
              <select value={referenceTitleKey} onChange={(e) => setReferenceTitleKey(e.target.value)}>
                {referenceKeys.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            ) : (
              <span className="helper">массив строк</span>
            )}
          </div>
          <div className="field-row">
            <span>Порог автоисправления</span>
            <input
              type="range"
              min={0.4}
              max={0.95}
              step={0.05}
              value={scoreThreshold}
              onChange={(e) => setScoreThreshold(Number(e.target.value))}
            />
            <strong>{scoreThreshold.toFixed(2)}</strong>
          </div>
        </div>

        <div className="panel">
          <h3>3. Применить исправления</h3>
          <p>Исправления применяются только при достаточном уровне уверенности.</p>
          <div className="action-grid">
            <button
              className="action-btn"
              onClick={applyAllFixes}
              disabled={!results.length || !referenceRows.length}
            >
              Исправить все подходящие
            </button>
            <button className="action-btn ghost" onClick={resetFixes} disabled={!results.length}>
              Сбросить исправления
            </button>
            <button className="action-btn primary" onClick={downloadResult} disabled={!results.length}>
              Скачать исправленный JSON
            </button>
          </div>
          <ul className="bullet-list">
            <li>Сначала загрузите справочник, чтобы появились рекомендации.</li>
            <li>При наведении на строку видно, какие поля будут заменены.</li>
            <li>Файл скачивается без внутренних полей подсказок.</li>
          </ul>
        </div>
      </section>

      <section className="table-section">
        <div className="table-header">
          <h3>Результаты сопоставления</h3>
          <p>Нажмите «Исправить» для точечной замены.</p>
        </div>
        <div className="table-wrapper">
          <table className="mapping-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ожидаемое название</th>
                <th>Текущее маппинг-значение</th>
                <th>Рекомендация</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => (
                <tr key={index} className={row.__fixed ? "row-fixed" : ""}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="title-main">{extractString(row, mappingTitleKey)}</div>
                  </td>
                  <td>
                    <div className="title-main">{extractString(row, mappedTitleKey)}</div>
                    {row.__original_mapped && row.__original_mapped !== extractString(row, mappedTitleKey) && (
                      <div className="title-note">Было: {row.__original_mapped}</div>
                    )}
                  </td>
                  <td>
                    {row.__suggested ? (
                      <>
                        <div className="title-main">{row.__suggested}</div>
                        <div className="title-note">
                          уверенность: {(row.__score ?? 0).toFixed(2)}
                        </div>
                      </>
                    ) : (
                      <span className="title-note">Нет рекомендаций</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="action-btn compact"
                      onClick={() => applyFix(index)}
                      disabled={!row.__suggested || (row.__score ?? 0) < scoreThreshold}
                    >
                      Исправить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default App;
