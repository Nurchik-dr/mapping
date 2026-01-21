import React from "react";

interface Props {
  total: number;
  matched: number;
  mismatched: number;
}

const Summary: React.FC<Props> = ({ total, matched, mismatched }) => {
  return (
    <section className="summary">
      <h2>Итог</h2>
      <p>Всего: {total}</p>
      <p>Совпали: {matched}</p>
      <p>Не совпали: {mismatched}</p>
    </section>
  );
};

export default Summary;
