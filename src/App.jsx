import { useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import UploadCard from "./components/UploadCard";
import Footer from "./components/Footer";
import Login from "./components/Login";

const STORAGE_KEY = "authUser";

function App() {
  // Restore the session on refresh so the user isn't logged out.
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (loggedInUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  // Not authenticated → show the login page only.
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Authenticated → main application.
  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <Hero />
      <UploadCard />
      <Footer />
    </>
  );
}

export default App;
