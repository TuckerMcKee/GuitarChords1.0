import React, { useEffect, useState } from "react";
import { Route, Routes, Link, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import AuthPage from "./pages/Auth";
import { api } from "./lib/api";

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  useEffect(() => {
    api.get("/me").then(res => setUser(res.data)).catch(()=>setUser(null));
  }, []);
  const logout = async () => { await api.post("/auth/logout"); setUser(null); };
  return (
    <BrowserRouter>
      <nav style={{ padding: 12, borderBottom: "1px solid #ddd", marginBottom: 16 }}>
        <Link to="/">Home</Link>{" | "}
        {user ? <button onClick={logout}>Logout</button> : <Link to="/auth">Login/Register</Link>}
      </nav>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/auth" element={<AuthPage setUser={setUser} />} />
      </Routes>
    </BrowserRouter>
  );
}
