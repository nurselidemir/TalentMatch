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
      setError("Failed to fetch uploaded CVs.");
      setCvList([]);
    }
  };

  const handleDelete = async (filename) => {
    try {
      await axios.delete(`http://localhost:8000/delete-cv/?filename=${encodeURIComponent(filename)}`);
      setCvList((prevList) => prevList.filter((f) => f !== filename));
      if (selectedFilename === filename) {
        setSelectedFilename(null);
      }
    } catch (err) {
      alert("Failed to delete the CV.");
    }
  };

  return (
    <div style={{
      maxWidth: "700px",
      margin: "2rem auto",
      padding: "2rem",
      background: "#f5ecf1",  // updated background color
      borderRadius: "12px",
      boxShadow: "0 0 16px rgba(0,0,0,0.08)",
      fontFamily: "Arial, sans-serif"
    }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem", textAlign: "center", color: "#2c3e50" }}>
        Uploaded CVs
      </h2>

      <div style={{ textAlign: "center" }}>
        <button
          onClick={handleFetch}
          style={{
            padding: "0.6rem 1.5rem",
            background: "#8a5471",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            marginBottom: "1.5rem"
          }}
        >
          Show Uploaded CVs
        </button>
      </div>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {cvList.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {cvList.map((filename, idx) => (
            <li
              key={idx}
              style={{
                background: "#ffffff",
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "8px",
                boxShadow: "0 0 6px rgba(0,0,0,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <button
                onClick={() => setSelectedFilename(filename)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2c3e50",
                  fontSize: "1rem",
                  cursor: "pointer",
                  fontWeight: "bold",
                  textAlign: "left",
                  flex: 1
                }}
              >
                {filename}
              </button>
              <button
                onClick={() => handleDelete(filename)}
                style={{
                  background: "#e74c3c",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginLeft: "1rem"
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {cvList.length === 0 && !error && (
        <p style={{ textAlign: "center", color: "#7f8c8d" }}>No CVs uploaded yet.</p>
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
