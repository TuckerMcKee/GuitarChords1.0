import React from "react";
import { Route, Routes, Link, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import AuthPage from "./pages/Auth";
export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 12, borderBottom: "1px solid #ddd", marginBottom: 16 }}>
        <Link to="/">Home</Link>{" | "}
        <Link to="/auth">Login/Register</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}