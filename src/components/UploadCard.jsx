import { useState } from "react";
import { apiPost } from "../api";
import ResultCard from "./ResultCard";

function UploadCard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectFile = (file) => {
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError("");
    }
  };

  const handleFileChange = (event) => {
    selectFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    selectFile(event.dataTransfer.files[0]);
  };

  const handlePredict = async () => {
    if (!selectedFile) {
      setError("Please select a fingerprint image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // POST /predict → { blood_group, confidence }
      const data = await apiPost("/predict", formData, { isJson: false });
      setResult(data);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Could not connect to the backend. Make sure Flask is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-card">
      <h2>Upload Fingerprint</h2>

      <div
        className="upload-area"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <p>📁</p>

        <p>Drag &amp; Drop your fingerprint here</p>

        <span>or</span>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />

        {selectedFile && (
          <p>
            Selected: <strong>{selectedFile.name}</strong>
          </p>
        )}
      </div>

      <button
        className="predict-btn"
        onClick={handlePredict}
        disabled={loading}
      >
        {loading ? "Predicting..." : "Predict Blood Group"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "15px" }}>
          {error}
        </p>
      )}

      {result && (
        <ResultCard
          bloodGroup={result.blood_group}
          confidence={result.confidence}
        />
      )}
    </div>
  );
}

export default UploadCard;