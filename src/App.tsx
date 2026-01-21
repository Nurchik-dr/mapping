// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import data from "./mapped.json";
import DetailsModal from "./components/DetailsModal";
import "./index.css";
import { normalizeSmart, areSimilar } from "./utils/similarity";

type Row = Record<string, any>;

const App = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"all" | "matched" | "mismatched">("all");
  const [selected, setSelected] = useState<Row | null>(null);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  useEffect(() => {
    setRows(data as Row[]);
  }, []);

  const results = useMemo(() => {
    return rows.map((r) => {
      const expected = String(r.title ?? "");
      const actual = String(r.matched_csv_title ?? "");

      const normExpected = normalizeSmart(expected);
      const normActual = normalizeSmart(actual);

      return {
        ...r,
        __match: areSimilar(expected, actual),
        __norm_expected: normExpected.join(" "),
        __norm_actual: normActual.join(" ")
      };
    });
  }, [rows]);

  const filtered = useMemo(() => {
    if (filter === "matched") return results.filter((r) => r.__match);
    if (filter === "mismatched") return results.filter((r) => !r.__match);
    return results;
  }, [results, filter]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <div className="page">
      <div className="header">
        <h2>Mapping Checker</h2>
        <div className="summary-card">
          <h2>Итог</h2>
          <div className="summary-stats">
            <div>Всего: {results.length}</div>
            <div>Совпали: {results.filter(r => r.__match).length}</div>
            <div>Не совпали: {results.filter(r => !r.__match).length}</div>
            <div>
              Процент: {results.length > 0
                ? ((results.filter(r => r.__match).length / results.length) * 100).toFixed(2)
                : 0}%
            </div>
          </div>
        </div>
      </div>

      <div className="controls">
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as any);
            setPage(1);
          }}
          className="filter-select"
        >
          <option value="all">Все</option>
          <option value="matched">Правильные</option>
          <option value="mismatched">Неправильные</option>
        </select>
      </div>

      {/* === ВЫБОР JSON ФАЙЛА === */}
      <div className="file-upload">
        <label className="file-btn">
          Выбрать JSON
          <input
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const json = JSON.parse(String(reader.result));
                  setRows(json);
                  setPage(1);
                } catch {
                  alert("Ошибка: неверный JSON");
                }
              };
              reader.readAsText(file);
            }}
          />
        </label>
      </div>


      {/* === ПАГИНАЦИЯ === */}
      <div style={{ display: "flex", gap: 12, margin: "10px 0", alignItems: "center" }}>
        <div>
          Размер:
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            style={{ marginLeft: 6 }}
          >
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div>
          Страница: {page} / {totalPages || 1}
        </div>

        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ←
          </button>

          <span className="page-info">
            {page} / {totalPages || 1}
          </span>

          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            →
          </button>
        </div>

      </div>

      {/* === ТАБЛИЦА === */}
      <table className="mapping-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Ожидаемое</th>
            <th>Замапленное</th>
            <th>Совпадение</th>
          </tr>
        </thead>
        <tbody>
          {pagedData.map((r, i) => (
            <tr key={i} className={r.__match ? "row-match" : "row-fail"}>
              <td style={{ width: 40, opacity: 0.6 }}>
                {(page - 1) * pageSize + i + 1}
              </td>
              <td>
                <div className="title-main">{r.title}</div>
                <div className="title-norm">{r.__norm_expected}</div>
              </td>
              <td>
                <div className="title-main">{r.matched_csv_title}</div>
                <div className="title-norm">{r.__norm_actual}</div>
              </td>
              <td className="status-cell">
                {r.__match ? "🟢" : "❌"}
                <button className="details-btn" onClick={() => setSelected(r)}>Подробнее</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <DetailsModal row={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default App;
