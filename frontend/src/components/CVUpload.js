import { useState } from "react";
import axios from "axios";

function CVUpload() {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [consentChecked, setConsentChecked] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    if (selectedFiles.length > 10) {
      alert("You can upload up to 10 files.");
      return;
    }

    if (!consentChecked) {
      alert("Please confirm you have obtained explicit consent from the candidates.");
      return;
    }

    const formData = new FormData();
    for (const file of selectedFiles) {
      formData.append("files", file);
    }

    try {
      const response = await axios.post("http://localhost:8000/upload-cv/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResult(response.data);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadResult({
        error:
          err.response?.data?.detail === "No new valid files uploaded."
            ? "You uploaded a duplicate file."
            : err.response?.data?.detail || "Upload failed.",
      });
    }
  };

  return (
    <div style={{
      maxWidth: "700px",
      margin: "3rem auto",
      padding: "2.5rem",
      background: "#f5ecf1 ",
      borderRadius: "12px",
      boxShadow: "0 0 20px rgba(0,0,0,0.1)",
      fontFamily: "Arial, sans-serif",
      textAlign: "center"
    }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem", color: "#2c3e50" }}>Upload CV</h2>

      <label
        htmlFor="cv-upload-input"
        style={{
          display: "inline-block",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#8a5471",
          color: "#fff",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "1rem",
          fontWeight: "bold"
        }}
      >
        Select CV files
      </label>

      <input
        id="cv-upload-input"
        type="file"
        multiple
        accept=".pdf,.docx"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {selectedFiles && (
        <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#555" }}>
          {Array.from(selectedFiles).map((file, idx) => (
            <div key={idx}>{file.name}</div>
          ))}
        </div>
      )}

      <label style={{ display: "block", marginTop: "1.5rem", fontSize: "0.95rem" }}>
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
        />{" "}
        I confirm that I have obtained explicit consent from the CV owners to upload and process their documents.
      </label>

      <button
        onClick={handleUpload}
        style={{
          marginTop: "2rem",
          padding: "0.75rem 2rem",
          fontSize: "1rem",
          backgroundColor: "#618e62 ",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Upload
      </button>

      {uploadResult && (
        <div style={{ marginTop: "1.5rem" }}>
          {uploadResult.files ? (
            <ul style={{ textAlign: "left", marginTop: "1rem" }}>
              {uploadResult.files.map((file, idx) => (
                <li key={idx}>{file}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "red" }}>{uploadResult.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CVUpload;
