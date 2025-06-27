import { useState } from "react";
import axios from "axios";

function CVUpload() {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Lütfen en az bir dosya seçin.");
      return;
    }

    if (selectedFiles.length > 10) {
      alert("En fazla 10 dosya yükleyebilirsiniz.");
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
      console.error("Yükleme hatası:", err);
      setUploadResult({
        error:
          err.response?.data?.detail === "No new valid files uploaded."
            ? "Aynı dosyayı tekrar yüklediniz."
            : err.response?.data?.detail || "Yükleme başarısız oldu",
      });
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "2rem", background: "#fff", borderRadius: "8px", boxShadow: "0 0 8px rgba(0,0,0,0.1)" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>CV Yükle</h2>
      <input type="file" multiple accept=".pdf,.docx" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>Yükle</button>

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
