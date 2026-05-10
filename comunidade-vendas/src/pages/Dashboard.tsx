import { useState } from "react";
import { useData } from "../context/DataContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Inventario() {
  const { produtos, loading, deletarProduto, editarProduto } = useData();
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formEdit, setFormEdit] = useState<any>({});

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(5);

  // QA: Lógica de Paginação Segura (Garante que o total de páginas seja no mínimo 1)
  const totalPaginas = Math.max(1, Math.ceil(produtos.length / itensPorPagina));
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const produtosPaginados = produtos.slice(indicePrimeiroItem, indiceUltimoItem);

  // FUNÇÃO DE EXPORTAÇÃO PDF
  const exportarPDF = () => {
    if (produtos.length === 0) return alert("Não há dados para exportar.");
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Relatório de Inventário - Comunidade Gestor", 14, 20);

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
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 5 },
    });

    const totalPatrimonio = produtos.reduce(
      (acc: number, p: any) => acc + p.preco * p.estoque,
      0,
    );
    doc.text(
      `Patrimônio Total: R$ ${totalPatrimonio.toFixed(2)}`,
      14,
      (doc as any).lastAutoTable.finalY + 10,
    );

    doc.save("inventario-comunidade.pdf");
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
        <h2 style={{ color: "#64748b", fontWeight: "normal" }}>Buscando dados do inventário...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ color: "#000000" }}>Inventário de Produtos</h1>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            onClick={exportarPDF}
            disabled={produtos.length === 0}
            style={{
              backgroundColor: produtos.length === 0 ? "#cbd5e1" : "#000000",
              color: "#ffffff",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "bold",
              cursor: produtos.length === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "opacity 0.2s"
            }}
          >
            📥 Exportar PDF
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1rem", color: "#000000", fontWeight: "bold" }}>
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
                border: "2px solid #000000",
                color: "#000000",
                fontWeight: "600",
                backgroundColor: "#fff"
              }}
            >
              <option value={5}>5 itens</option>
              <option value={10}>10 itens</option>
              <option value={50}>50 itens</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lógica de Quadro Branco (Estado Vazio) */}
      {produtos.length === 0 ? (
        <div 
          style={{
            backgroundColor: "#ffffff",
            padding: "60px",
            textAlign: "center",
            borderRadius: "12px",
            border: "2px dashed #e2e8f0",
            color: "#64748b"
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📦</div>
          <h2 style={{ color: "#334155", marginBottom: "10px" }}>Seu inventário está vazio</h2>
          <p>Adicione produtos na tela de cadastro para começar a gerenciar seu estoque.</p>
        </div>
      ) : (
        <div
          className="card"
          style={{ padding: "0", overflowX: "auto", border: "1px solid #cbd5e1" }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", color: "#374151" }}>Produto</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", color: "#374151" }}>Categoria</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", color: "#374151" }}>Preço</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", color: "#374151" }}>Estoque</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", color: "#374151" }}>Total</th>
                <th style={{ padding: "12px", textAlign: "center", fontWeight: "bold", color: "#374151" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtosPaginados.map((produto: any) => (
                <tr key={produto.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px" }}>
                    {editandoId === produto.id ? (
                      <input
                        type="text"
                        value={formEdit.nome ?? produto.nome}
                        onChange={(e) => setFormEdit({ ...formEdit, nome: e.target.value })}
                        style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      />
                    ) : (
                      produto.nome
                    )}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {editandoId === produto.id ? (
                      <input
                        type="text"
                        value={formEdit.categoria ?? produto.categoria}
                        onChange={(e) => setFormEdit({ ...formEdit, categoria: e.target.value })}
                        style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      />
                    ) : (
                      produto.categoria
                    )}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {editandoId === produto.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={formEdit.preco ?? produto.preco}
                        onChange={(e) => setFormEdit({ ...formEdit, preco: parseFloat(e.target.value) })}
                        style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      />
                    ) : (
                      `R$ ${produto.preco.toFixed(2)}`
                    )}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {editandoId === produto.id ? (
                      <input
                        type="number"
                        value={formEdit.estoque ?? produto.estoque}
                        onChange={(e) => setFormEdit({ ...formEdit, estoque: parseInt(e.target.value) })}
                        style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      />
                    ) : (
                      `${produto.estoque} un.`
                    )}
                  </td>
                  <td style={{ padding: "12px" }}>
                    R$ {(produto.preco * produto.estoque).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {editandoId === produto.id ? (
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button
                          onClick={() => {
                            editarProduto(produto.id, formEdit);
                            setEditandoId(null);
                            setFormEdit({});
                          }}
                          style={{ backgroundColor: "#10b981", color: "#ffffff", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setEditandoId(null);
                            setFormEdit({});
                          }}
                          style={{ backgroundColor: "#6b7280", color: "#ffffff", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button
                          onClick={() => {
                            setEditandoId(produto.id);
                            setFormEdit(produto);
                          }}
                          style={{ backgroundColor: "#3b82f6", color: "#ffffff", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deletarProduto(produto.id)}
                          style={{ backgroundColor: "#ef4444", color: "#ffffff", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}
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
      )}

      {/* Paginação visível apenas se houver produtos */}
      {produtos.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
            disabled={paginaAtual === 1}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              backgroundColor: paginaAtual === 1 ? "#f3f4f6" : "#ffffff",
              color: paginaAtual === 1 ? "#9ca3af" : "#374151",
              cursor: paginaAtual === 1 ? "not-allowed" : "pointer",
            }}
          >
            Anterior
          </button>
          <span style={{ fontWeight: "bold", color: "#374151" }}>
            Página {paginaAtual} de {totalPaginas}
          </span>
          <button
            onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
            disabled={paginaAtual === totalPaginas}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              backgroundColor: paginaAtual === totalPaginas ? "#f3f4f6" : "#ffffff",
              color: paginaAtual === totalPaginas ? "#9ca3af" : "#374151",
              cursor: paginaAtual === totalPaginas ? "not-allowed" : "pointer",
            }}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}