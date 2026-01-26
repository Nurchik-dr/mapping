import { extractString } from "../utils/extract";

// src/components/DetailsModal.tsx
const DetailsModal = ({
  row,
  mappingTitleKey,
  mappedTitleKey,
  onClose
}: {
  row: any;
  mappingTitleKey: string;
  mappedTitleKey: string;
  onClose: () => void;
}) => {
  const expected = extractString(row, mappingTitleKey);
  const actual = extractString(row, mappedTitleKey);

  return (
    <div className="modal-backdrop" onClick={onClose}>
  <div className="modal-window" onClick={(e) => e.stopPropagation()}>
    
    <div className="modal-header">
      <span className="modal-title">Сравнение & Детали</span>
      <button className="modal-close" onClick={onClose}>×</button>
    </div>

    <div className="modal-section">
      <div className="section-title">Сравнение названий</div>
      <div className="compare-box">
        <div><b>Ожидаемое:</b> {expected}</div>
        <div><b>Замапленное:</b> {actual}</div>
        <small>norm: {row.__norm_expected} | {row.__norm_actual}</small>
        <div style={{marginTop: 6}}>
          {row.__match
            ? <span className="result-ok">Совпало ✔</span>
            : <span className="result-bad">Не совпало ✖</span>
          }
        </div>
        {row.__suggested_title && (
          <div className="suggested-box">
            <div>
              <b>Рекомендация:</b> {row.__suggested_title}
            </div>
            <small>score: {row.__suggested_score?.toFixed?.(2) ?? row.__suggested_score}</small>
          </div>
        )}
      </div>
    </div>

    <div className="modal-section">
      <div className="section-title">Доп. данные</div>
      <div className="fields-box">
        {Object.entries(row)
          .filter(([k]) => !k.startsWith("__"))
          .map(([key, value]) => (
            <div key={key} className="field-row">
              <div className="field-key">{key}</div>
              <div className="field-value">{String(value)}</div>
            </div>
          ))}
      </div>
    </div>
  </div>
</div>


  );
};

export default DetailsModal;
