import { useState } from "react";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";

export default function Cadastro() {
  const { cadastrarProduto } = useData();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    categoria: "",
    preco: "",
    estoque: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const precoNum = parseFloat(form.preco);
    const estoqueNum = parseInt(form.estoque);
    const nomeLimpo = form.nome.trim();
    const categoriaLimpa = form.categoria.trim();

    if (!nomeLimpo || !categoriaLimpa) {
      alert("O nome e a categoria não podem conter apenas espaços.");
      return;
    }

    if (isNaN(precoNum) || precoNum <= 0) {
      alert("O preço deve ser um valor numérico maior que zero.");
      return;
    }

    if (isNaN(estoqueNum) || estoqueNum < 0) {
      alert("O estoque inicial não pode ser negativo.");
      return;
    }

    const sucesso = await cadastrarProduto({
      nome: nomeLimpo,
      categoria: categoriaLimpa,
      preco: precoNum,
      estoque: estoqueNum,
    });

    if (sucesso) {
      alert("Produto cadastrado com sucesso!");
      navigate("/inventario");
    }
  };

  return (
    <div className="container">
      <h1 style={{ color: "#000000" }}>Cadastrar Novo Item</h1>
      <div
        className="card"
        style={{
          maxWidth: "500px",
          margin: "2rem auto",
          border: "1px solid #cbd5e1",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{ fontWeight: "bold", color: "#000000" }}>
              Nome do Produto
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Boneca de Pano"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              style={inputStyleBase}
            />
          </div>

          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{ fontWeight: "bold", color: "#000000" }}>
              Categoria
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Artesanato"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              style={inputStyleBase}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: "bold", color: "#000000" }}>
                Preço
              </label>
              <div style={{ display: "flex", alignItems: "center", marginTop: "0.5rem" }}>
                <span style={prefixStyle}>R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.preco}
                  // BLOQUEIO PREVENTIVO NO ONCHANGE
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.includes("-")) return; // Bloqueia negativos
                    setForm({ ...form, preco: val });
                  }}
                  // SANITIZAÇÃO NO ONBLUR
                  onBlur={() => {
                    const val = parseFloat(form.preco);
                    if (isNaN(val) || val <= 0) {
                      setForm({ ...form, preco: "0.01" });
                    }
                  }}
                  style={inputStyleRight}
                />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: "bold", color: "#000000" }}>
                Estoque Inicial
              </label>
              <input
                type="number"
                required
                value={form.estoque}
                // BLOQUEIO PREVENTIVO NO ONCHANGE
                onChange={(e) => {
                  const val = e.target.value;
                  // Bloqueia negativos e decimais
                  if (val.includes("-") || val.includes(".") || val.includes(",")) return;
                  setForm({ ...form, estoque: val });
                }}
                // SANITIZAÇÃO NO ONBLUR
                onBlur={() => {
                  if (!form.estoque || parseInt(form.estoque) < 0) {
                    setForm({ ...form, estoque: "0" });
                  }
                }}
                style={{ ...inputStyleBase, marginTop: "0.5rem", fontWeight: "bold" }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn"
            style={{
              width: "100%",
              padding: "1rem",
              backgroundColor: "#2563eb",
              color: "white",
              fontSize: "1.1rem",
              fontWeight: "bold",
            }}
          >
            Salvar Produto
          </button>
        </form>
      </div>
    </div>
  );
}

// ESTILOS AUXILIARES (ALTO CONTRASTE)
const inputStyleBase = {
  width: "100%",
  padding: "0.8rem",
  marginTop: "0.5rem",
  border: "2px solid #000000",
  borderRadius: "4px",
  color: "#000000",
  fontSize: "1rem"
};

const inputStyleRight = {
  flex: 1,
  padding: "0.8rem",
  border: "2px solid #000000",
  borderRadius: "0 4px 4px 0",
  fontWeight: "bold" as const,
  color: "#000000",
  fontSize: "1rem"
};

const prefixStyle = {
  backgroundColor: "#e2e8f0",
  border: "2px solid #000000",
  borderRight: "none",
  padding: "0.8rem",
  borderRadius: "4px 0 0 4px",
  color: "#000000",
  fontWeight: "bold" as const,
};