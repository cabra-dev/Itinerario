import { useState } from 'react';
import { useData } from '../context/DataContext';

export default function Vendas() {
  const { produtos, registrarVenda } = useData();
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [enviando, setEnviando] = useState(false);

  const produtoSelecionado = produtos.find((p: any) => p.id === parseInt(produtoId));

  const handleVenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoId) return alert("⚠️ Selecione um produto");
    
    if (produtoSelecionado && quantidade > produtoSelecionado.estoque) {
      return alert(`❌ Estoque insuficiente! Máximo disponível: ${produtoSelecionado.estoque}`);
    }

    setEnviando(true);
    try {
      const sucesso = await registrarVenda(parseInt(produtoId), quantidade);
      if (sucesso) {
        alert("💰 Venda realizada com sucesso!");
        setProdutoId('');
        setQuantidade(1);
      } else {
        alert("❌ Erro ao processar venda no servidor.");
      }
    } catch (err) {
      alert("❌ Falha de rede ao conectar com o backend.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Lançar Venda</h1>
      
      <div className="card" style={{ width: '100%', maxWidth: '450px', marginTop: '1rem', border: '1px solid #cbd5e1' }}>
        <form onSubmit={handleVenda}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Produto</label>
            <select 
              className="form-control"
              value={produtoId}
              onChange={(e) => {
                setProdutoId(e.target.value);
                setQuantidade(1);
              }}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
              <option value="">Selecione o produto...</option>
              {produtos.map((p: any) => (
                <option key={p.id} value={p.id} disabled={p.estoque <= 0}>
                  {p.nome} {p.estoque <= 0 ? "(ESGOTADO)" : `(Qtd: ${p.estoque})`}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Quantidade</label>
            <input 
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value))}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          {produtoSelecionado && (
            <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bbf7d0', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#166534' }}>Total: <strong>R$ {(produtoSelecionado.preco * quantidade).toFixed(2)}</strong></p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={enviando || !produtoId || (produtoSelecionado?.estoque || 0) <= 0}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              backgroundColor: (enviando || !produtoId) ? '#94a3b8' : '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: enviando ? 'not-allowed' : 'pointer'
            }}
          >
            {enviando ? "Processando..." : "Finalizar Venda"}
          </button>
        </form>
      </div>
    </div>
  );
}