import React, { useState } from "react";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";

type View = "landing" | "login";

const App: React.FC = () => {
  const [view, setView] = useState<View>("landing");

  if (view === "login") {
    return (
      <Login
        onBack={() => setView("landing")}
        onLoginSuccess={(email) => {
          // TODO: handle post-login routing
          console.log("Logged in as:", email);
        }}
      />
    );
  }

  return (
    <LandingPage
      onLogin={() => setView("login")}
      onCreateAccount={() => setView("login")}
      onGuestAccount={() => {
        // TODO: handle guest session
        console.log("Guest account clicked");
      }}
    />
  );
};

export default App;