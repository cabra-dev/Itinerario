import { useState } from 'react';
import { useData } from '../context/DataContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Inventario() {
  const { produtos, loading, deletarProduto, editarProduto } = useData();
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formEdit, setFormEdit] = useState<any>({});

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(5);

  // Lógica de Paginação
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const produtosPaginados = produtos.slice(indicePrimeiroItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(produtos.length / itensPorPagina);

  // FUNÇÃO DE EXPORTAÇÃO PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    
    // Título do PDF
    doc.setFontSize(18);
    doc.text('Relatório de Inventário - Comunidade Gestor', 14, 20);
    
    // Dados da Tabela
    const tableData = produtos.map((p: any) => [
      p.nome,
      p.categoria,
      `R$ ${p.preco.toFixed(2)}`,
      `${p.estoque} un.`,
      `R$ ${(p.preco * p.estoque).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Produto', 'Categoria', 'Preço', 'Estoque', 'Total']],
      body: tableData,
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }, // Alto contraste
      styles: { fontSize: 10, cellPadding: 5 },
    });

    const totalPatrimonio = produtos.reduce((acc: number, p: any) => acc + (p.preco * p.estoque), 0);
    doc.text(`Patrimônio Total: R$ ${totalPatrimonio.toFixed(2)}`, 14, (doc as any).lastAutoTable.finalY + 10);

    doc.save('inventario-comunidade.pdf');
  };

  if (loading) return <div className="container">Carregando...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#000000' }}>Inventário de Produtos</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Botão de Exportar PDF */}
          <button 
            onClick={exportarPDF}
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📥 Exportar PDF
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1rem', color: '#000000', fontWeight: 'bold' }}>Mostrar:</span>
            <select 
              value={itensPorPagina} 
              onChange={(e) => { setItensPorPagina(Number(e.target.value)); setPaginaAtual(1); }}
              style={{ padding: '8px', borderRadius: '4px', border: '2px solid #000000', color: '#000000', fontWeight: '600' }}
            >
              <option value={5}>5 itens</option>
              <option value={10}>10 itens</option>
              <option value={50}>50 itens</option>
            </select>
          </div>
        </div>
      </div>

      {/* O resto da tabela permanece o mesmo do passo anterior... */}
      <div className="card" style={{ padding: '0', overflowX: 'auto', border: '1px solid #cbd5e1' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {/* ... Conteúdo da Tabela que já construímos ... */}
        </table>
      </div>

      {/* Paginação ... */}
    </div>
  );
}