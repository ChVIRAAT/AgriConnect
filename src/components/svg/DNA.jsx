import "../DNA.css";

function DNA() {
  return (
    <div className="dna">
      <div className="line"></div>

      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className="pair"
          style={{ animationDelay: `${i * 0.2}s` }}
        >
          <span></span>
          <span></span>
        </div>
      ))}
    </div>
  );
}

export default DNA;