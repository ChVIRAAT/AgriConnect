import "./Hero.css";

import DNA from "./svg/DNA";
import Fingerprint from "./svg/Fingerprint";
import Bloodcell from "./svg/Bloodcell";

function Hero() {
  return (
    <section className="hero">

      <DNA />

      <Bloodcell />

      <div className="hero-left">

        <h1>
          AI-Powered
          <br />
          <span>Blood Group</span>
          <br />
          Detection
        </h1>

        <p>
          Upload a fingerprint image and let our intelligent
          system predict blood group quickly, securely,
          and accurately.
        </p>

        <div className="feature-boxes">

          <div className="feature-box">
            <h3>Secure & Private</h3>
            <p>Your data is protected</p>
          </div>

          <div className="feature-box">
            <h3>AI-Powered</h3>
            <p>Advanced ML Algorithm</p>
          </div>

        </div>

      </div>

      <div className="hero-right">

        <Fingerprint />

      </div>

    </section>
  );
}

export default Hero;