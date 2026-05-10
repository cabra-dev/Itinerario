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

    // QA: Sanitização de strings (remove espaços extras no início e fim)
    const nomeLimpo = form.nome.trim();
    const categoriaLimpa = form.categoria.trim();
    const precoNum = parseFloat(form.preco);
    const estoqueNum = parseInt(form.estoque);

    // Validações de Segurança
    if (!nomeLimpo || !categoriaLimpa) {
      alert("Erro: Nome e categoria são campos obrigatórios.");
      setCarregando(false);
      return;
    }

    if (isNaN(precoNum) || precoNum <= 0) {
      alert("Erro: O preço deve ser maior que zero.");
      setCarregando(false);
      return;
    }

    if (isNaN(estoqueNum) || estoqueNum < 0) {
      alert("Erro: O estoque não pode ser negativo.");
      setCarregando(false);
      return;
    }

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
      setCarregando(false);
    }
  };

  return (
    <div className="container">
      <h1 style={{ color: "#000000", textAlign: 'center' }}>Cadastrar Novo Item</h1>
      
      <div
        className="card"
        style={{
          maxWidth: "500px",
          margin: "2rem auto",
          border: "1px solid #cbd5e1",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{ fontWeight: "bold", color: "#374151" }}>
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
            <label style={{ fontWeight: "bold", color: "#374151" }}>
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
              <label style={{ fontWeight: "bold", color: "#374151" }}>
                Preço
              </label>
              <div style={{ display: "flex", alignItems: "center", marginTop: "0.5rem" }}>
                <span style={prefixStyle}>R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.preco}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.includes("-")) return; 
                    setForm({ ...form, preco: val });
                  }}
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
              <label style={{ fontWeight: "bold", color: "#374151" }}>
                Estoque Inicial
              </label>
              <input
                type="number"
                required
                value={form.estoque}
                onChange={(e) => {
                  const val = e.target.value;
                  // Bloqueia negativos e decimais (estoque é inteiro)
                  if (val.includes("-") || val.includes(".") || val.includes(",")) return;
                  setForm({ ...form, estoque: val });
                }}
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
            disabled={carregando}
            style={{
              width: "100%",
              padding: "1rem",
              backgroundColor: carregando ? "#94a3b8" : "#2563eb",
              color: "white",
              fontSize: "1.1rem",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: carregando ? "not-allowed" : "pointer",
              transition: "background-color 0.2s"
            }}
          >
            {carregando ? "Processando..." : "Salvar Produto"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ESTILOS AUXILIARES
const inputStyleBase = {
  width: "100%",
  padding: "0.8rem",
  marginTop: "0.5rem",
  border: "1px solid #cbd5e1",
  borderRadius: "4px",
  color: "#000000",
  fontSize: "1rem",
  outlineColor: "#2563eb"
};

const inputStyleRight = {
  flex: 1,
  padding: "0.8rem",
  border: "1px solid #cbd5e1",
  borderLeft: "none",
  borderRadius: "0 4px 4px 0",
  fontWeight: "bold" as const,
  color: "#000000",
  fontSize: "1rem"
};

const prefixStyle = {
  backgroundColor: "#f8fafc",
  border: "1px solid #cbd5e1",
  padding: "0.8rem",
  borderRadius: "4px 0 0 4px",
  color: "#64748b",
  fontWeight: "bold" as const,
};