import { useState } from "react";
import { useData } from "../context/DataContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Inventario() {
  const { produtos, loading, deletarProduto, editarProduto } = useData();

  // ===== ESTADOS DE EDIÇÃO =====
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formEdit, setFormEdit] = useState<any>({});

  // ===== ESTADOS DE PAGINAÇÃO =====
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(5);

  // ===== ESTADO DO MODAL DE CONFIRMAÇÃO =====
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoParaDeletar, setProdutoParaDeletar] = useState<number | null>(null);
  const [erroDelecao, setErroDelecao] = useState("");

  // Lógica de Paginação Segura
  const totalPaginas = Math.max(1, Math.ceil(produtos.length / itensPorPagina));
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const produtosPaginados = produtos.slice(indicePrimeiroItem, indiceUltimoItem);

  // Abre o modal de confirmação
  const confirmarDelecao = (id: number) => {
    setProdutoParaDeletar(id);
    setModalAberto(true);
  };

  // Executa a deleção após confirmação no modal
  const executarDelecao = async () => {
    if (!produtoParaDeletar) return;
    const sucesso = await deletarProduto(produtoParaDeletar);
    if (!sucesso) {
      setErroDelecao("Não é possível deletar um produto com vendas registradas.");
      return;
    }
    setErroDelecao("");
    setModalAberto(false);
    setProdutoParaDeletar(null);
  };

  // Exporta relatório PDF com todos os produtos
  const exportarPDF = () => {
    if (produtos.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Relatório de Estoque - Comunidade Gestor", 14, 20);

    const tableData = produtos.map((p: any) => [
      p.nome,
      p.categoria,
      `R$ ${p.preco.toFixed(2)}`,
      `${p.estoque} un.`,
      `R$ ${(p.preco * p.estoque).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Produto", "Categoria", "Preço", "Estoque", "Total"]],
      body: tableData,
      headStyles: { fillColor: [196, 98, 45], textColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 5 },
    });

    const totalPatrimonio = produtos.reduce(
      (acc: number, p: any) => acc + p.preco * p.estoque, 0
    );
    doc.text(
      `Patrimônio Total: R$ ${totalPatrimonio.toFixed(2)}`,
      14,
      (doc as any).lastAutoTable.finalY + 10,
    );

    doc.save("estoque-comunidade.pdf");
  };

  if (loading)
    return (
      <div className="container" style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ color: "#7a5c45" }}>Carregando estoque...</p>
      </div>
    );

  return (
    <div className="container">

      {/* ===== CABEÇALHO ===== */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px",
        marginBottom: "1.5rem",
      }}>
        <h1 style={{ color: "#3d2b1f" }}>Estoque de Produtos</h1>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* Botão exportar PDF */}
          <button
            onClick={exportarPDF}
            disabled={produtos.length === 0}
            style={{
              backgroundColor: produtos.length === 0 ? "#d4b896" : "#c4622d",
              color: "#fff8f0",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "bold",
              cursor: produtos.length === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📥 Exportar PDF
          </button>

          {/* Seletor de itens por página */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1rem", color: "#3d2b1f", fontWeight: "bold" }}>
              Mostrar:
            </span>
            <select
              value={itensPorPagina}
              onChange={(e) => {
                setItensPorPagina(Number(e.target.value));
                setPaginaAtual(1);
              }}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "2px solid #c4622d",
                color: "#3d2b1f",
                fontWeight: "600",
                backgroundColor: "#fff8f0"
              }}
            >
              <option value={5}>5 itens</option>
              <option value={10}>10 itens</option>
              <option value={50}>50 itens</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== ESTADO VAZIO ===== */}
      {produtos.length === 0 ? (
        <div style={{
          backgroundColor: "#fff8f0",
          border: "2px dashed #d4b896",
          borderRadius: "12px",
          padding: "3rem",
          textAlign: "center",
          color: "#7a5c45",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
          <h2 style={{ color: "#3d2b1f" }}>Seu estoque está vazio</h2>
          <p>Cadastre produtos para que eles apareçam aqui.</p>
        </div>
      ) : (
        <>
          {/* ===== TABELA DE PRODUTOS ===== */}
          <div className="card" style={{ padding: "0", overflowX: "auto", border: "1px solid #d4b896" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#fdf0e0", borderBottom: "2px solid #d4b896" }}>
                  <th style={thStyle}>Produto</th>
                  <th style={thStyle}>Categoria</th>
                  <th style={thStyle}>Preço</th>
                  <th style={thStyle}>Estoque</th>
                  <th style={thStyle}>Total</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosPaginados.map((produto: any) => (
                  <tr key={produto.id} style={{ borderBottom: "1px solid #f5e6d0" }}>

                    {/* Coluna Nome */}
                    <td style={tdStyle}>
                      {editandoId === produto.id ? (
                        <input type="text" value={formEdit.nome || produto.nome}
                          onChange={(e) => setFormEdit({ ...formEdit, nome: e.target.value })}
                          style={inputEditStyle} />
                      ) : produto.nome}
                    </td>

                    {/* Coluna Categoria */}
                    <td style={tdStyle}>
                      {editandoId === produto.id ? (
                        <input type="text" value={formEdit.categoria || produto.categoria}
                          onChange={(e) => setFormEdit({ ...formEdit, categoria: e.target.value })}
                          style={inputEditStyle} />
                      ) : produto.categoria}
                    </td>

                    {/* Coluna Preço */}
                    <td style={tdStyle}>
                      {editandoId === produto.id ? (
                        <input type="number" step="0.01" value={formEdit.preco ?? produto.preco}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") { setFormEdit({ ...formEdit, preco: "" }); return; }
                            if (parseFloat(val) < 0) return;
                            setFormEdit({ ...formEdit, preco: val });
                          }}
                          onBlur={() => {
                            const val = parseFloat(formEdit.preco);
                            if (isNaN(val) || val <= 0) {
                              setFormEdit({ ...formEdit, preco: produto.preco });
                            }
                          }}
                          style={inputEditStyle} />
                      ) : `R$ ${produto.preco.toFixed(2)}`}
                    </td>

                    {/* Coluna Estoque */}
                    <td style={tdStyle}>
                      {editandoId === produto.id ? (
                        <input type="number" value={formEdit.estoque || produto.estoque}
                          onChange={(e) => setFormEdit({ ...formEdit, estoque: parseInt(e.target.value) })}
                          style={inputEditStyle} />
                      ) : `${produto.estoque} un.`}
                    </td>

                    {/* Coluna Total */}
                    <td style={tdStyle}>
                      R$ {(produto.preco * produto.estoque).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>

                    {/* Coluna Ações */}
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      {editandoId === produto.id ? (
                        <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                          <button
                            onClick={() => { editarProduto(produto.id, formEdit); setEditandoId(null); setFormEdit({}); }}
                            style={{ backgroundColor: "#4a5c3a", color: "#fff8f0", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => { setEditandoId(null); setFormEdit({}); }}
                            style={{ backgroundColor: "#7a5c45", color: "#fff8f0", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                          <button
                            onClick={() => { setEditandoId(produto.id); setFormEdit(produto); }}
                            style={{ backgroundColor: "#2c3e6b", color: "#fff8f0", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => confirmarDelecao(produto.id)}
                            style={{ backgroundColor: "#8b2020", color: "#fff8f0", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}
                          >
                            Deletar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== PAGINAÇÃO ===== */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginTop: "1.5rem",
          }}>
            <button
              onClick={() => setPaginaAtual(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              style={{
                padding: "8px 16px",
                borderRadius: "4px",
                border: "1px solid #d4b896",
                backgroundColor: paginaAtual === 1 ? "#f5e6d0" : "#fff8f0",
                color: paginaAtual === 1 ? "#d4b896" : "#3d2b1f",
                cursor: paginaAtual === 1 ? "not-allowed" : "pointer",
              }}
            >
              Anterior
            </button>
            <span style={{ fontWeight: "bold", color: "#3d2b1f" }}>
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaAtual(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              style={{
                padding: "8px 16px",
                borderRadius: "4px",
                border: "1px solid #d4b896",
                backgroundColor: paginaAtual === totalPaginas ? "#f5e6d0" : "#fff8f0",
                color: paginaAtual === totalPaginas ? "#d4b896" : "#3d2b1f",
                cursor: paginaAtual === totalPaginas ? "not-allowed" : "pointer",
              }}
            >
              Próxima
            </button>
          </div>
        </>
      )}

      {/* ===== MODAL DE CONFIRMAÇÃO DE DELEÇÃO ===== */}
      {modalAberto && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(61, 43, 31, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: "#fff8f0",
            padding: "2rem",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "400px",
            textAlign: "center",
            border: "1px solid #d4b896"
          }}>
            <h3 style={{ marginBottom: "1rem", color: "#3d2b1f" }}>Confirmar exclusão</h3>
            <p style={{ color: "#7a5c45", marginBottom: "1rem" }}>
              Tem certeza que deseja excluir este produto?
            </p>
            {erroDelecao && (
              <p style={{ color: "#8b2020", marginBottom: "1rem", fontSize: "0.9rem" }}>
                {erroDelecao}
              </p>
            )}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button onClick={executarDelecao} style={{
                backgroundColor: "#8b2020",
                color: "#fff8f0",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold"
              }}>
                Confirmar
              </button>
              <button onClick={() => { setModalAberto(false); setProdutoParaDeletar(null); setErroDelecao(""); }} style={{
                backgroundColor: "#d4b896",
                color: "#3d2b1f",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold"
              }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== ESTILOS REUTILIZÁVEIS =====
const thStyle: React.CSSProperties = {
  padding: "12px",
  textAlign: "left",
  fontWeight: "bold",
  color: "#3d2b1f"
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
  maxWidth: "200px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  color: "#3d2b1f"
};

const inputEditStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px",
  border: "1px solid #d4b896",
  borderRadius: "4px",
  backgroundColor: "#fdf3e7",
  color: "#3d2b1f"
};