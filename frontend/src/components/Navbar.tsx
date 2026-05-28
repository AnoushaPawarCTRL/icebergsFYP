import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/logo.png"; // adjust path if needed

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <img src={logo} alt="CryoAI Logo" className="nav-logo" />
      </Link>

      <div className="nav-links">
        <Link to="/history/1">Login</Link>
      </div>
    </nav>
  );
}