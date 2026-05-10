import { useState } from 'react';
import { useData } from '../context/DataContext';

export default function Vendas() {
  const { produtos, registrarVenda } = useData();
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  const produtoSelecionado = produtos.find((p: any) => p.id === parseInt(produtoId));

  const handleVenda = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // QA: Validação de segurança no Front-end
    if (!produtoId) return alert("Selecione um produto");
    
    if (produtoSelecionado && quantidade > produtoSelecionado.estoque) {
      return alert(`Estoque insuficiente! Você tem apenas ${produtoSelecionado.estoque} unidades.`);
    }

    const sucesso = await registrarVenda(parseInt(produtoId), quantidade);
    if (sucesso) {
      alert("Venda realizada com sucesso!");
      setProdutoId('');
      setQuantidade(1);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Lançar Venda</h1>
      
      <div className="card" style={{ width: '100%', maxWidth: '450px', marginTop: '1rem' }}>
        <form onSubmit={handleVenda}>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>
              Produto
            </label>
            <select 
              className="form-control"
              value={produtoId}
              onChange={(e) => {
                setProdutoId(e.target.value);
                setQuantidade(1); // Reseta a quantidade ao trocar de produto
              }}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
              <option value="">Selecione o produto...</option>
              {produtos.map((p: any) => (
                <option key={p.id} value={p.id} disabled={p.estoque <= 0}>
                  {p.nome} {p.estoque <= 0 ? "(ESGOTADO)" : `(Estoque: ${p.estoque})`}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>
              Quantidade
            </label>
            <input 
              type="number"
              min="1"
              max={produtoSelecionado?.estoque || 1}
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value))}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          {/* Feedback de Valor Total (UX de Qualidade) */}
          {produtoSelecionado && (
            <div style={{ 
              backgroundColor: '#f0fdf4', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              border: '1px solid #bbf7d0',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, color: '#166534', fontSize: '0.9rem' }}>
                Valor Unitário: R$ {produtoSelecionado.preco.toFixed(2)}
              </p>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#166534', fontSize: '1.1rem' }}>
                Total: R$ {(produtoSelecionado.preco * quantidade).toFixed(2)}
              </p>
              {produtoSelecionado.estoque < 5 && produtoSelecionado.estoque > 0 && (
                <p style={{ color: '#9a3412', fontSize: '0.8rem', marginTop: '5px' }}>
                  ⚠️ Atenção: Estoque baixo!
                </p>
              )}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={!produtoId || (produtoSelecionado?.estoque || 0) <= 0}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              backgroundColor: (!produtoId || (produtoSelecionado?.estoque || 0) <= 0) ? '#94a3b8' : '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: (!produtoId || (produtoSelecionado?.estoque || 0) <= 0) ? 'not-allowed' : 'pointer'
            }}
          >
            { (produtoSelecionado?.estoque || 0) <= 0 && produtoId ? "Produto Esgotado" : "Finalizar Venda" }
          </button>
        </form>
      </div>
    </div>
  );
}