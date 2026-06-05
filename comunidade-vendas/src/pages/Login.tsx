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
    if (!loginInput || !senha) {
      setErro("Preencha todos os campos.");
      return;
    }
    setCarregando(true);
    setErro("");
    try {
      const response = await api.post("/auth/login", {
        login: loginInput,
        senha: senha,
      });
      login(response.data);
    } catch (error: any) {
      setErro("Login ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-icon">🌵</div>
        <h1>Comunidade Gestor</h1>
        <h2>Entrar</h2>

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