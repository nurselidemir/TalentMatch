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
        setSelectedFilename(null); // Close detail view if deleted
      }
    } catch (err) {
      alert("Failed to delete the CV.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem", background: "#eef2f3", borderRadius: "8px" }}>
      <h2>Uploaded CVs</h2>

      <button onClick={handleFetch} style={{ padding: "0.5rem 1rem", marginBottom: "1rem" }}>
        Show Uploaded CVs
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {cvList.length > 0 && (
        <>
          <h3 style={{ marginTop: "1rem" }}>CV List</h3>
          <ul>
            {cvList.map((filename, idx) => (
              <li key={idx} style={{ marginBottom: "10px" }}>
                <button
                  onClick={() => setSelectedFilename(filename)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  {filename}
                </button>
                <button
                  onClick={() => handleDelete(filename)}
                  style={{
                    padding: "5px",
                    background: "#e74c3c",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginLeft: "10px"
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {cvList.length === 0 && !error && (
        <p>No CVs uploaded yet.</p>
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
