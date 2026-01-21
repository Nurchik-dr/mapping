import React from "react";

interface Props {
  keys: string[];
  expectedKey: string;
  actualKey: string;
  setExpectedKey: (v: string) => void;
  setActualKey: (v: string) => void;
  labels: Record<string, string>;
}

const Controls: React.FC<Props> = ({
  keys,
  expectedKey,
  actualKey,
  setExpectedKey,
  setActualKey,
  labels
}) => {
  return (
    <div className="controls">
      <div className="field">
        <label>Поле ожидаемого названия</label>
        <select value={expectedKey} onChange={(e) => setExpectedKey(e.target.value)}>
          {keys.map((k) => (
            <option key={k} value={k}>{labels[k] ?? k}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Поле замапленного названия</label>
        <select value={actualKey} onChange={(e) => setActualKey(e.target.value)}>
          {keys.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Controls;
