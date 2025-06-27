import React, { useEffect, useState } from "react";

const CVDetails = ({ filename, onClose }) => {
  const [sections, setSections] = useState(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`http://localhost:8000/cv-details/?filename=${filename}`);
        const data = await response.json();
        setSections(data.sections);
      } catch (error) {
        console.error("CV detayları alınamadı:", error);
      }
    };

    fetchSections();
  }, [filename]);

  if (!sections) return <div>Yükleniyor...</div>;

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", marginTop: "20px" }}>
      <h3>{filename} - Bölümler</h3>
      {Object.entries(sections).map(([label, content], idx) => (
        <div key={idx} style={{ marginBottom: "20px" }}>
          <h4>{label}</h4>
          {content.map((text, i) => (
            <pre key={i} style={{ backgroundColor: "#f9f9f9", padding: "10px" }}>{text}</pre>
          ))}
        </div>
      ))}
      <button onClick={onClose}>Kapat</button>
    </div>
  );
};

export default CVDetails;
