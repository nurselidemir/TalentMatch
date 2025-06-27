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
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "2rem", background: "#fff", borderRadius: "8px", boxShadow: "0 0 8px rgba(0,0,0,0.1)" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Upload CV</h2>
      <input type="file" multiple accept=".pdf,.docx" onChange={handleFileChange} />

      <label style={{ display: "block", marginTop: "10px" }}>
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
        />{" "}
        I confirm that I have obtained explicit consent from the CV owners to upload and process their documents for job matching purposes.
      </label>

      <button onClick={handleUpload} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
        Upload
      </button>

      {uploadResult && (
        <div style={{ marginTop: "1rem" }}>
          {uploadResult.files ? (
            <ul>
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
