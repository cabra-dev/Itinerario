import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { stats, produtos, loading } = useData();
  const { usuario } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
        <h2 style={{ color: "#7a5c45", fontWeight: "normal" }}>Carregando dados...</h2>
      </div>
    );
  }

  // ===== CARDS DE ESTATÍSTICAS COM PALETA NORDESTINA =====
  const cards = [
    {
      titulo: "Faturamento Total",
      valor: `R$ ${(stats?.faturamento_total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: "💰",
      cor: "#4a5c3a"  // Verde seco
    },
    {
      titulo: "Valor em Estoque",
      valor: `R$ ${(stats?.total_estoque_valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: "📦",
      cor: "#2c3e6b"  // Azul sertão
    },
    {
      titulo: "Itens Vendidos",
      valor: stats?.total_itens_vendidos || 0,
      icon: "🛍️",
      cor: "#c4622d"  // Terracota
    },
    {
      titulo: "Produtos Cadastrados",
      valor: stats?.total_produtos_cadastrados || 0,
      icon: "📋",
      cor: "#c9a84c"  // Mostarda
    },
    {
      titulo: "Itens com Baixo Estoque",
      valor: stats?.itens_baixo_estoque || 0,
      icon: "⚠️",
      cor: stats?.itens_baixo_estoque > 0 ? "#8b2020" : "#4a5c3a"
    },
  ];

  const produtosBaixoEstoque = produtos.filter((p: any) => p.estoque < 5);

  return (
    <div className="container">

      {/* ===== BOAS VINDAS ===== */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "#3d2b1f", marginBottom: "0.25rem" }}>
          Bem-vindo, {usuario?.nome}! 👋
        </h1>
        <p style={{ color: "#7a5c45" }}>Aqui está um resumo do seu negócio.</p>
      </div>

      {/* ===== CARDS DE ESTATÍSTICAS ===== */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        {cards.map((card, index) => (
          <div key={index} style={{
            backgroundColor: "#fff8f0",
            border: "1px solid #d4b896",
            borderRadius: "12px",
            padding: "1.5rem",
            borderLeft: `4px solid ${card.cor}`,
            boxShadow: "0 2px 8px rgba(61, 43, 31, 0.08)"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{card.icon}</div>
            <p style={{ color: "#7a5c45", fontSize: "0.85rem", margin: "0 0 0.25rem 0" }}>{card.titulo}</p>
            <p style={{ color: "#3d2b1f", fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>{card.valor}</p>
          </div>
        ))}
      </div>

      {/* ===== PRODUTOS COM BAIXO ESTOQUE ===== */}
      {produtosBaixoEstoque.length > 0 && (
        <div style={{
          backgroundColor: "#fdf0e0",
          border: "1px solid #c4622d",
          borderRadius: "12px",
          padding: "1.5rem"
        }}>
          <h2 style={{ color: "#c4622d", marginBottom: "1rem", fontSize: "1rem" }}>
            ⚠️ Produtos com Baixo Estoque (menos de 5 unidades)
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #d4b896" }}>
                <th style={{ textAlign: "left", padding: "8px", color: "#7a5c45" }}>Produto</th>
                <th style={{ textAlign: "left", padding: "8px", color: "#7a5c45" }}>Categoria</th>
                <th style={{ textAlign: "left", padding: "8px", color: "#7a5c45" }}>Estoque</th>
              </tr>
            </thead>
            <tbody>
              {produtosBaixoEstoque.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f5e6d0" }}>
                  <td style={{ padding: "8px", color: "#3d2b1f" }}>{p.nome}</td>
                  <td style={{ padding: "8px", color: "#3d2b1f" }}>{p.categoria}</td>
                  <td style={{ padding: "8px", color: "#8b2020", fontWeight: "bold" }}>{p.estoque} un.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== ESTADO VAZIO ===== */}
      {produtos.length === 0 && (
        <div style={{
          backgroundColor: "#fff8f0",
          border: "2px dashed #d4b896",
          borderRadius: "12px",
          padding: "3rem",
          textAlign: "center",
          color: "#7a5c45"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
          <h2 style={{ color: "#3d2b1f" }}>Nenhum dado ainda</h2>
          <p>Cadastre produtos para ver as estatísticas aqui.</p>
        </div>
      )}
    </div>
  );
}