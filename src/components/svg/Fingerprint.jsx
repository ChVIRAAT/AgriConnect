import "../Fingerprint.css";
function Fingerprint() {
  return (
    <div className="fingerprint">
      <svg
        width="320"
        height="320"
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="160"
          cy="160"
          r="120"
          stroke="#00D9FF"
          strokeWidth="3"
          opacity="0.2"
        />

        <path
          d="M160 75
             C110 75 90 115 90 160
             C90 210 125 240 160 245
             C195 240 230 210 230 160
             C230 115 210 75 160 75"
          stroke="#00D9FF"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />

        <path
          d="M160 100
             C125 100 110 125 110 160
             C110 195 135 220 160 225
             C185 220 210 195 210 160
             C210 125 195 100 160 100"
          stroke="#00D9FF"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />

        <path
          d="M160 125
             C140 125 130 145 130 160
             C130 180 145 195 160 200
             C175 195 190 180 190 160
             C190 145 180 125 160 125"
          stroke="#00D9FF"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />

        <circle
          cx="160"
          cy="160"
          r="8"
          fill="#00D9FF"
        />
      </svg>
    </div>
  );
}

export default Fingerprint;