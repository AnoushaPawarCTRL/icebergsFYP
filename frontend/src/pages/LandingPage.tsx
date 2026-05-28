import React from "react";
import "./LandingPage.css";
import iceberg from "../assets/iceberg.png";
import Navbar from "../components/Navbar"; // adjust path if needed


interface LandingPageProps {
  onLogin: () => void;
  onCreateAccount: () => void;
  onGuestAccount: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  onCreateAccount,
  onGuestAccount,
}) => {
  return (
    <div className="landing-root">
        <Navbar /> 
      {/* Background polar grid */}
      <div className="landing-bg-grid" aria-hidden="true" />
      <div className="landing-bg-glow" aria-hidden="true" />

      {/* Hero */}
      <main className="landing-hero">
        <div className="hero-content">
          <p className="hero-eyebrow">AI-Powered Polar Intelligence</p>
          <h1 className="hero-headline">
            <span className="headline-line">AUTOMATED DETECTION</span>
            <span className="headline-line accent">READY-TO-USE GEODATA</span>
          </h1>
          <p className="hero-body">
            An AI-powered iceberg detection system that saves hours of manual
            tracking time and generates in-depth geodata reports.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={onCreateAccount}>
              CREATE ACCOUNT NOW
            </button>
            <button className="btn-secondary" onClick={onGuestAccount}>
              TRY GUEST ACCOUNT
            </button>
          </div>

          {/* Stats strip */}
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">98.4%</span>
              <span className="stat-label">Detection Accuracy</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-value">12×</span>
              <span className="stat-label">Faster Than Manual</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-value">4K+</span>
              <span className="stat-label">Icebergs Tracked</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="iceberg-wrapper">
            <div className="iceberg-glow" aria-hidden="true" />
            <img src={iceberg} alt="Iceberg" className="iceberg-img" />
            <div className="data-panel">
                <p>ICEBERG ID: A83</p>
                <p>AREA: 55.34 sqNM</p>
                <p>COORDINATES: 0.4 m/s</p>
            </div>
            {/* Scan line animation */}
            <div className="scan-line" aria-hidden="true" />
          </div>
        </div>
      </main>

      {/* Bottom rule */}
      <div className="landing-footer-rule" aria-hidden="true" />
    </div>
  );
};

export default LandingPage;