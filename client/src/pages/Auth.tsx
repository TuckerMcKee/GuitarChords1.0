import React, { useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function AuthPage({ setUser }: { setUser: (u:any)=>void }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [mode, setMode] = useState<"login"|"register">("login");
  const nav = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") await api.post("/auth/register", { email, password: pw });
    await api.post("/auth/login", { email, password: pw });
    const me = await api.get("/me");
    setUser(me.data);
    setEmail(""); setPw("");
    nav("/");
  };
  return (
    <div style={{ maxWidth: 360, margin: "2rem auto" }}>
      <h2>{mode}</h2>
      <form onSubmit={submit}>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} /><br/>
        <input placeholder="password" type="password" value={pw} onChange={e=>setPw(e.target.value)} /><br/>
        <button type="submit">{mode}</button>{" "}
        <button type="button" onClick={()=>setMode(mode==="login"?"register":"login")}>switch to {mode==="login"?"register":"login"}</button>
      </form>
    </div>
  );
}
