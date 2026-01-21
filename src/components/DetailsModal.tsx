// src/components/DetailsModal.tsx
const DetailsModal = ({ row, onClose }: { row: any; onClose: () => void }) => {
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
        <div><b>Ожидаемое:</b> {row.title}</div>
        <div><b>Замапленное:</b> {row.matched_csv_title}</div>
        <small>norm: {row.__norm_expected} | {row.__norm_actual}</small>
        <div style={{marginTop: 6}}>
          {row.__match
            ? <span className="result-ok">Совпало ✔</span>
            : <span className="result-bad">Не совпало ✖</span>
          }
        </div>
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
