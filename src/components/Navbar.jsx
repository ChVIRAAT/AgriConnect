import "./Navbar.css";
import { FaTint } from "react-icons/fa";

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="logo">
        <FaTint className="logo-icon" />
        <div>
          <h2>VIRAAT <span>HEALTH CARE</span></h2>
          <p>AI-Powered Healthcare Solutions</p>
        </div>
      </div>

      <ul className="nav-links">
        <li className="active">Home</li>
        <li>About</li>
        <li>Services</li>
        <li>AI Prediction</li>
        <li>Contact</li>
      </ul>

      <div className="nav-user">
        {user && <span className="nav-username">{user.full_name}</span>}
        <button className="nav-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;