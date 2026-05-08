import { useData } from "../context/DataContext";

export default function Dashboard() {
  const { stats, loading, produtos } = useData();

  // 1. A função deve ficar ANTES do return
  const compartilharRelatorio = () => {
    if (!stats) return;

    const mensagem =
      `*RELATÓRIO DE VENDAS - COMUNIDADE* 📊%0A%0A` +
      `💰 *Faturamento Total:* R$ ${stats.faturamento_total.toFixed(2)}%0A` +
      `📦 *Itens Vendidos:* ${stats.total_itens_vendidos}%0A` +
      `⚠️ *Produtos em Alerta:* ${stats.itens_baixo_estoque}%0A%0A` +
      `_Gerado em: ${new Date().toLocaleDateString("pt-BR")}_`;

    window.open(`https://wa.me/?text=${mensagem}`, "_blank");
  };

  if (loading || !stats)
    return <div className="container">Carregando dados...</div>;

  return (
    <div className="container">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1>Painel de Gestão</h1>
          <p>Visão geral da produção e vendas da comunidade.</p>
        </div>

        {/* 2. Botão adicionado para disparar o compartilhamento */}
        <button
          onClick={compartilharRelatorio}
          style={{
            backgroundColor: "#25D366",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Enviar Relatório WhatsApp
        </button>
      </header>

      {/* Grid de Métricas Principais */}
      <div className="grid-stats">
        <div className="card border-left-blue">
          <small>FATURAMENTO TOTAL</small>
          <h2>R$ {stats.faturamento_total.toFixed(2)}</h2> {/* Adicionado R$ */}
        </div>

        <div className="card border-left-green">
          <small>VALOR EM ESTOQUE</small>
          <h2>R$ {stats.total_estoque_valor.toFixed(2)}</h2>{" "}
          {/* Adicionado R$ */}
        </div>

        <div className="card border-left-orange">
          <small>ALERTAS DE PRODUÇÃO</small>
          <h2
            style={{
              color:
                stats.itens_baixo_estoque > 0 ? "var(--danger)" : "inherit",
            }}
          >
            {stats.itens_baixo_estoque}
          </h2>
          <span className="text-secondary">Itens com menos de 5 un.</span>
        </div>
      </div>

      {/* Seção de Alertas Rápidos */}
      <div className="card" style={{ marginTop: "2rem" }}>
        <h3>Atenção Necessária</h3>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Estoque Atual</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {produtos
              .filter((p: any) => p.estoque < 5)
              .map((p: any) => (
                <tr key={p.id}>
                  <td>{p.nome}</td>
                  <td>{p.estoque} un.</td>
                  <td>
                    <span className="badge-danger">Repor Urgente</span>
                  </td>
                </tr>
              ))}
            {produtos.filter((p: any) => p.estoque < 5).length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Todos os itens com estoque saudável! ✅
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
