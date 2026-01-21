import React from "react";

interface Props {
  onFileLoaded: (rows: any[]) => void;
  error: string | null;
  loading: boolean;
}

const FileLoader: React.FC<Props> = ({ onFileLoaded, error, loading }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed)) throw new Error("Ожидается JSON-массив");
        onFileLoaded(parsed);
      } catch (err) {
        onFileLoaded([]);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="card">
      <div className="field">
        <label>JSON-файл</label>
        <input type="file" accept="application/json" onChange={handleFileChange} />
      </div>

      {loading && <p className="info">Загружаем файл по умолчанию…</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default FileLoader;
