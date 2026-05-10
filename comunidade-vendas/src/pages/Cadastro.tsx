import { useState } from "react";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";

export default function Cadastro() {
  const { cadastrarProduto } = useData();
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    categoria: "",
    preco: "",
    estoque: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    const nomeLimpo = form.nome.trim();
    const categoriaLimpa = form.categoria.trim();
    const precoNum = parseFloat(form.preco);
    const estoqueNum = parseInt(form.estoque);

    if (!nomeLimpo || !categoriaLimpa || isNaN(precoNum) || isNaN(estoqueNum) || precoNum <= 0) {
      alert("⚠️ Preencha todos os campos corretamente. O preço deve ser maior que zero.");
      setCarregando(false);
      return;
    }

    try {
      const sucesso = await cadastrarProduto({
        nome: nomeLimpo,
        categoria: categoriaLimpa,
        preco: precoNum,
        estoque: estoqueNum,
      });

      if (sucesso) {
        alert("✅ Produto cadastrado com sucesso!");
        navigate("/inventario");
      } else {
        alert("❌ Erro ao cadastrar. Verifique a conexão com o servidor (CORS).");
        setCarregando(false);
      }
    } catch (err) {
      alert("❌ Falha crítica na comunicação com o backend.");
      setCarregando(false);
    }
  };

  return (
    <div className="container" style={{ padding: "10px" }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem', color: "#000" }}>
        Cadastrar Novo Item
      </h1>
      <div 
        className="card" 
        style={{ 
          maxWidth: "500px", 
          margin: "0 auto", 
          border: "1px solid #cbd5e1",
          boxSizing: "border-box",
          padding: "20px"
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontWeight: "bold", display: "block" }}>Nome do Produto</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="Ex: Camiseta"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              style={inputStyleBase}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontWeight: "bold", display: "block" }}>Categoria</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="Ex: Vestuário"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              style={inputStyleBase}
            />
          </div>

          <div style={{ 
            display: "flex", 
            gap: "1rem", 
            marginBottom: "1.5rem",
            flexWrap: "wrap" 
          }}>
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ fontWeight: "bold", display: "block" }}>Preço</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                className="form-control"
                placeholder="0.00"
                value={form.preco}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes("-")) return;
                  setForm({ ...form, preco: val });
                }}
                style={inputStyleBase}
              />
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ fontWeight: "bold", display: "block" }}>Estoque Inicial</label>
              <input
                type="number"
                min="0"
                required
                className="form-control"
                placeholder="0"
                value={form.estoque}
                onChange={(e) => {
                  const val = e.target.value;
                  // Impede negativos, pontos e vírgulas (apenas inteiros)
                  if (val.includes("-") || val.includes(".") || val.includes(",")) return;
                  setForm({ ...form, estoque: val });
                }}
                style={inputStyleBase}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="btn btn-primary"
            style={{ 
              width: "100%", 
              padding: "1rem", 
              fontWeight: "bold", 
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: carregando ? "not-allowed" : "pointer",
              backgroundColor: carregando ? "#94a3b8" : "#000",
              transition: "background 0.3s"
            }}
          >
            {carregando ? "Salvando..." : "Salvar Produto"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyleBase = {
  width: "100%",
  padding: "0.8rem",
  marginTop: "0.5rem",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  boxSizing: "border-box" as "border-box"
};