function ResultCard({ bloodGroup, confidence }) {
  return (
    <div className="result-card">

      <h2>Prediction Result</h2>

      <div className="result-circle">
        <span>{bloodGroup || "--"}</span>
      </div>

      <h3>Blood Group</h3>

      <h4>
        Confidence : {confidence !== null && confidence !== undefined
          ? `${confidence.toFixed(2)}%`
          : "--%"}
      </h4>

      <p>
        Upload a fingerprint image and click
        <br />
        "Predict Blood Group"
        <br />
        to see the result.
      </p>

    </div>
  );
}

export default ResultCard;