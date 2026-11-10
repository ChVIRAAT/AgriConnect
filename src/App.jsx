import { useEffect, useState } from "react";
import { apiGet, apiPost } from "./api";
import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import UploadCard from "./components/UploadCard";
import Footer from "./components/Footer";
import Login from "./components/Login";

function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    let active = true;
    apiGet("/session")
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch((error) => {
        if (active && error.status !== 401) {
          setSessionError("Could not reach the backend. Make sure Flask is running.");
        }
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setSessionError("");
  };

  const handleLogout = async () => {
    try {
      await apiPost("/logout", {});
      setUser(null);
      setSessionError("");
    } catch {
      setSessionError("Could not log out because the backend is unavailable.");
    }
  };

  if (checkingSession) {
    return <div className="session-loading">Checking your session...</div>;
  }

  // Not authenticated → show the login page only.
  if (!user) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        initialMessage={sessionError}
      />
    );
  }

  // Authenticated → main application.
  return (
    <>
      {sessionError && (
        <div className="session-error" role="alert">
          {sessionError}
        </div>
      )}
      <Navbar user={user} onLogout={handleLogout} />
      <Hero />
      <UploadCard />
      <Footer />
    </>
  );
}

export default App;
