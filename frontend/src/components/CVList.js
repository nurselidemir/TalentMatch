import { useState } from "react";
import axios from "axios";
import CVDetails from "./CVDetails";

function CVList() {
  const [cvList, setCvList] = useState([]);
  const [error, setError] = useState(null);
  const [selectedFilename, setSelectedFilename] = useState(null);

  const handleFetch = async () => {
    try {
      const response = await axios.get("http://localhost:8000/uploaded-cvs/");
      setCvList(response.data.files);
      setError(null);
    } catch (err) {
      setError("Yüklü CV'ler alınamadı.");
      setCvList([]);
    }
  };

  const handleDelete = async (filename) => {
    try {
      await axios.delete(`http://localhost:8000/delete-cv/?filename=${encodeURIComponent(filename)}`);
      setCvList((prevList) => prevList.filter((f) => f !== filename));
      if (selectedFilename === filename) {
        setSelectedFilename(null); // detay görünümünü kapat
      }
    } catch (err) {
      alert("Silme işlemi başarısız oldu.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem", background: "#f8f8f8", borderRadius: "8px" }}>
      <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Yüklü CV’ler</h2>
      <button onClick={handleFetch} style={{ padding: "0.5rem 1rem", marginBottom: "1rem" }}>
        Yüklü CV’leri Göster
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {cvList.length > 0 && (
        <ul>
          {cvList.map((filename, idx) => (
            <li key={idx} style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{filename}</span>
              <div>
                <button
                  onClick={() => setSelectedFilename(filename)}
                  style={{ padding: "0.3rem 0.6rem", marginRight: "0.5rem", background: "#3498db", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Detay
                </button>
                <button
                  onClick={() => handleDelete(filename)}
                  style={{ padding: "0.3rem 0.6rem", background: "#e74c3c", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedFilename && (
        <CVDetails
          filename={selectedFilename}
          onClose={() => setSelectedFilename(null)}
        />
      )}
    </div>
  );
}

export default CVList;
