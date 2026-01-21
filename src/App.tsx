// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import data from "./mapped.json";
import DetailsModal from "./components/DetailsModal";
import { normalizeTitle } from "./utils/normalize";
import "./index.css";
type Row = Record<string, any>;

const App = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"all" | "matched" | "mismatched">("all");
  const [selected, setSelected] = useState<Row | null>(null);

  useEffect(() => {
    setRows(data as Row[]);
  }, []);

  const results = useMemo(() => {
    return rows.map((r) => {
      const t1 = normalizeTitle(String(r.title ?? ""));
      const t2 = normalizeTitle(String(r.matched_csv_title ?? ""));
      return {
        ...r,
        __match: t1 === t2,
        __norm_expected: t1,
        __norm_actual: t2
      };
    });
  }, [rows]);

  const filtered = useMemo(() => {
    if (filter === "matched") return results.filter((r) => r.__match);
    if (filter === "mismatched") return results.filter((r) => !r.__match);
    return results;
  }, [results, filter]);

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
            <div>Процент: {((results.filter(r => r.__match).length / results.length) * 100).toFixed(2)}%</div>
          </div>
        </div>

      </div>

      <div className="controls">
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="filter-select">
          <option value="all">Все</option>
          <option value="matched">Правильные</option>
          <option value="mismatched">Неправильные</option>
        </select>
      </div>

      <table className="mapping-table">
        <thead>
          <tr>
            <th>Ожидаемое</th>
            <th>Замапленное</th>
            <th>Совпадение</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => (
            <tr key={i} className={r.__match ? "row-match" : "row-fail"}>
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


      {selected && <DetailsModal row={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default App;
