import React from "react";

export interface ResultRow {
  expectedTitle: string;
  actualTitle: string;
  expectedNorm: string;
  actualNorm: string;
  isExact: boolean;
}

interface Props {
  results: ResultRow[];
}

const ResultTable: React.FC<Props> = ({ results }) => {
  return (
    <section className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Ожидаемое</th>
            <th>Замапленное</th>
            <th>Совпадение</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i} className={r.isExact ? "match" : "mismatch"}>
              <td>
                <div className="title">{r.expectedTitle}</div>
                <div className="normalized">{r.expectedNorm}</div>
              </td>
              <td>
                <div className="title">{r.actualTitle}</div>
                <div className="normalized">{r.actualNorm}</div>
              </td>
              <td>
                {r.isExact ? "✅" : "❌"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default ResultTable;
