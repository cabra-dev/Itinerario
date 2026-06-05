import { useState } from "react";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";

export default function Cadastro() {
  const { cadastrarProduto } = useData();
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    nome: "",
    categoria: "",
    preco: "",
    estoque: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const nomeLimpo = form.nome.trim();
    const categoriaLimpa = form.categoria.trim();
    const precoNum = parseFloat(form.preco);
    const estoqueNum = parseInt(form.estoque);

    // Validação sem alert
    if (!nomeLimpo || !categoriaLimpa || isNaN(precoNum) || isNaN(estoqueNum) || precoNum <= 0) {
      setErro("Preencha todos os campos corretamente. O preço deve ser maior que zero.");
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
        navigate("/inventario");
      } else {
        setErro("Erro ao cadastrar. Verifique a conexão com o servidor.");
        setCarregando(false);
      }
    } catch (err) {
      setErro("Falha na comunicação com o backend.");
      setCarregando(false);
    }
  };

  return (
    <div className="container" style={{ padding: "10px" }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem', color: "#3d2b1f" }}>
        Cadastrar Novo Item
      </h1>

      <div className="card" style={{
        maxWidth: "500px",
        margin: "0 auto",
        border: "1px solid #d4b896",
        backgroundColor: "#fff8f0",
        boxSizing: "border-box",
        padding: "20px"
      }}>

        {/* Mensagem de erro */}
        {erro && (
          <div style={{
            backgroundColor: "#fdf0e0",
            border: "1px solid #8b2020",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
            color: "#8b2020",
            fontWeight: "bold",
            textAlign: "center"
          }}>
            ⚠️ {erro}
          </div>
        )}

        {/* Nome do Produto */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontWeight: "bold", display: "block", color: "#3d2b1f" }}>
            Nome do Produto
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Camiseta"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            style={inputStyleBase}
          />
        </div>

        {/* Categoria */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontWeight: "bold", display: "block", color: "#3d2b1f" }}>
            Categoria
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Vestuário"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            style={inputStyleBase}
          />
        </div>

        {/* Preço e Estoque */}
        <div style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap"
        }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ fontWeight: "bold", display: "block", color: "#3d2b1f" }}>
              Preço
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
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
            <label style={{ fontWeight: "bold", display: "block", color: "#3d2b1f" }}>
              Estoque Inicial
            </label>
            <input
              type="number"
              min="0"
              required
              placeholder="0"
              value={form.estoque}
              onChange={(e) => {
                const val = e.target.value;
                if (val.includes("-") || val.includes(".") || val.includes(",")) return;
                setForm({ ...form, estoque: val });
              }}
              style={inputStyleBase}
            />
          </div>
        </div>

        {/* Botão salvar */}
        <button
          onClick={handleSubmit}
          disabled={carregando}
          style={{
            width: "100%",
            padding: "1rem",
            fontWeight: "bold",
            color: "#fff8f0",
            border: "none",
            borderRadius: "8px",
            cursor: carregando ? "not-allowed" : "pointer",
            backgroundColor: carregando ? "#d4b896" : "#c4622d",
            transition: "background 0.3s",
            fontSize: "1rem"
          }}
        >
          {carregando ? "Salvando..." : "Salvar Produto"}
        </button>
      </div>
    </div>
  );
}

// ===== ESTILO BASE DOS INPUTS =====
const inputStyleBase = {
  width: "100%",
  padding: "0.8rem",
  marginTop: "0.5rem",
  border: "1px solid #d4b896",
  borderRadius: "8px",
  boxSizing: "border-box" as "border-box",
  backgroundColor: "#fdf3e7",
  color: "#3d2b1f",
  fontSize: "1rem"
};