import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { stats, produtos, loading } = useData();
  const { usuario } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
        <h2 style={{ color: "#64748b", fontWeight: "normal" }}>Carregando dados...</h2>
      </div>
    );
  }

  const cards = [
    {
      titulo: "Faturamento Total",
      valor: `R$ ${(stats?.faturamento_total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: "💰",
      cor: "#10b981"
    },
    {
      titulo: "Valor em Estoque",
      valor: `R$ ${(stats?.total_estoque_valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: "📦",
      cor: "#3b82f6"
    },
    {
      titulo: "Itens Vendidos",
      valor: stats?.total_itens_vendidos || 0,
      icon: "🛍️",
      cor: "#8b5cf6"
    },
    {
      titulo: "Produtos Cadastrados",
      valor: stats?.total_produtos_cadastrados || 0,
      icon: "📋",
      cor: "#f59e0b"
    },
    {
      titulo: "Itens com Baixo Estoque",
      valor: stats?.itens_baixo_estoque || 0,
      icon: "⚠️",
      cor: stats?.itens_baixo_estoque > 0 ? "#ef4444" : "#10b981"
    },
  ];

  const produtosBaixoEstoque = produtos.filter((p: any) => p.estoque < 5);

  return (
    <div className="container">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "#000", marginBottom: "0.25rem" }}>
          Bem-vindo, {usuario?.nome}! 👋
        </h1>
        <p style={{ color: "#64748b" }}>Aqui está um resumo do seu negócio.</p>
      </div>

      {/* Cards de estatísticas */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        {cards.map((card, index) => (
          <div key={index} style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "1.5rem",
            borderLeft: `4px solid ${card.cor}`
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{card.icon}</div>
            <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0 0 0.25rem 0" }}>{card.titulo}</p>
            <p style={{ color: "#0f172a", fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>{card.valor}</p>
          </div>
        ))}
      </div>

      {/* Produtos com baixo estoque */}
      {produtosBaixoEstoque.length > 0 && (
        <div style={{
          backgroundColor: "#fff7ed",
          border: "1px solid #fed7aa",
          borderRadius: "12px",
          padding: "1.5rem"
        }}>
          <h2 style={{ color: "#c2410c", marginBottom: "1rem", fontSize: "1rem" }}>
            ⚠️ Produtos com Baixo Estoque (menos de 5 unidades)
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #fed7aa" }}>
                <th style={{ textAlign: "left", padding: "8px", color: "#92400e" }}>Produto</th>
                <th style={{ textAlign: "left", padding: "8px", color: "#92400e" }}>Categoria</th>
                <th style={{ textAlign: "left", padding: "8px", color: "#92400e" }}>Estoque</th>
              </tr>
            </thead>
            <tbody>
              {produtosBaixoEstoque.map((p: any) => (
                <tr key={p.id}>
                  <td style={{ padding: "8px", color: "#7c2d12" }}>{p.nome}</td>
                  <td style={{ padding: "8px", color: "#7c2d12" }}>{p.categoria}</td>
                  <td style={{ padding: "8px", color: "#ef4444", fontWeight: "bold" }}>{p.estoque} un.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Estado vazio */}
      {produtos.length === 0 && (
        <div style={{
          backgroundColor: "#ffffff",
          border: "2px dashed #e2e8f0",
          borderRadius: "12px",
          padding: "3rem",
          textAlign: "center",
          color: "#64748b"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
          <h2 style={{ color: "#334155" }}>Nenhum dado ainda</h2>
          <p>Cadastre produtos para ver as estatísticas aqui.</p>
        </div>
      )}
    </div>
  );
}