import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const [loginInput, setLoginInput] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async () => {
    if (!loginInput || !senha) { setErro("Preencha todos os campos."); return; }
    setCarregando(true);
    setErro("");
    try {
      const response = await api.post("/auth/login", { login: loginInput, senha });
      login(response.data);
    } catch (error: any) {
      setErro("Login ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">

      {/* ===== SOL NORDESTINO TOPO ===== */}
      <svg className="login-sol" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke="#c4622d" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="60" cy="60" r="22"/>
          {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 60 + 28 * Math.cos(rad);
            const y1 = 60 + 28 * Math.sin(rad);
            const x2 = 60 + 42 * Math.cos(rad);
            const y2 = 60 + 42 * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}/>;
          })}
        </g>
      </svg>

      {/* ===== CACTO ESQUERDA ===== */}
      <svg className="login-cacto-esq" viewBox="0 0 280 380" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke="#c4622d" strokeWidth="6" strokeLinecap="round">
          <line x1="140" y1="370" x2="140" y2="150"/>
          <path d="M140 260 Q90 260 90 210 Q90 180 115 180"/>
          <path d="M140 290 Q200 290 200 240 Q200 205 175 205"/>
          <line x1="130" y1="200" x2="120" y2="192"/>
          <line x1="150" y1="220" x2="160" y2="212"/>
          <line x1="130" y1="310" x2="120" y2="302"/>
          <line x1="150" y1="330" x2="160" y2="322"/>
          <line x1="130" y1="250" x2="120" y2="242"/>
          <ellipse cx="140" cy="375" rx="40" ry="10"/>
          <path d="M100 375 Q108 395 140 398 Q172 398 180 375"/>
          <path d="M108 382 Q140 388 172 382"/>
        </g>
      </svg>

      {/* ===== CESTO DIREITA ===== */}
      <svg className="login-cesto-dir" viewBox="0 0 280 380" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke="#c4622d" strokeWidth="5" strokeLinecap="round">
          <ellipse cx="140" cy="290" rx="80" ry="20"/>
          <path d="M60 290 Q60 200 140 190 Q220 200 220 290"/>
          <path d="M72 272 Q140 258 208 272"/>
          <path d="M66 254 Q140 240 214 254"/>
          <path d="M64 236 Q140 222 216 236"/>
          <path d="M64 218 Q140 204 216 218"/>
          <path d="M66 200 Q140 188 214 200"/>
          <path d="M95 192 Q140 140 185 192"/>
          <circle cx="140" cy="155" r="28"/>
          <path d="M118 144 Q140 130 162 144"/>
          <path d="M115 160 Q140 174 165 160"/>
          <path d="M140 127 Q140 183 140 183"/>
          <path d="M140 183 Q160 210 180 200"/>
        </g>
      </svg>

      {/* ===== CARD DE LOGIN ===== */}
      <div className="login-box">
        <div className="login-icon">🌵</div>
        <h1>Bodega Digital</h1>
        <h2>Bem-vindo de volta</h2>

        <input
          type="text"
          placeholder="Login"
          value={loginInput}
          onChange={(e) => setLoginInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {erro && <p className="login-erro">{erro}</p>}

        <button onClick={handleSubmit} disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}