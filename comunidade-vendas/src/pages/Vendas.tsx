import { useState } from 'react';
import { useData } from '../context/DataContext';

export default function Vendas() {
  const { produtos, registrarVenda } = useData();
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const produtoSelecionado = produtos.find((p: any) => p.id === parseInt(produtoId));

  const handleVenda = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações sem alert
    if (!produtoId) {
      setErro("Selecione um produto.");
      return;
    }
    if (produtoSelecionado && quantidade > produtoSelecionado.estoque) {
      setErro(`Estoque insuficiente! Máximo disponível: ${produtoSelecionado.estoque}`);
      return;
    }

    setEnviando(true);
    setErro('');
    setMensagem('');

    try {
      const sucesso = await registrarVenda(parseInt(produtoId), quantidade);
      if (sucesso) {
        setMensagem("Venda realizada com sucesso!");
        setProdutoId('');
        setQuantidade(1);
        setTimeout(() => setMensagem(''), 3000);
      } else {
        setErro("Erro ao processar venda no servidor.");
      }
    } catch (err) {
      setErro("Falha de rede ao conectar com o backend.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ color: '#3d2b1f', marginBottom: '1rem' }}>Lançar Venda</h1>

      <div className="card" style={{
        width: '100%',
        maxWidth: '450px',
        marginTop: '1rem',
        border: '1px solid #d4b896',
        backgroundColor: '#fff8f0'
      }}>

        {/* Mensagem de sucesso */}
        {mensagem && (
          <div style={{
            backgroundColor: '#f0f7e6',
            border: '1px solid #4a5c3a',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            color: '#4a5c3a',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            ✅ {mensagem}
          </div>
        )}

        {/* Mensagem de erro */}
        {erro && (
          <div style={{
            backgroundColor: '#fdf0e0',
            border: '1px solid #8b2020',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            color: '#8b2020',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            ⚠️ {erro}
          </div>
        )}

        {/* Seleção de produto */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#3d2b1f' }}>
            Produto
          </label>
          <select
            value={produtoId}
            onChange={(e) => {
              setProdutoId(e.target.value);
              setQuantidade(1);
              setErro('');
            }}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '8px',
              border: '1px solid #d4b896',
              backgroundColor: '#fdf3e7',
              color: '#3d2b1f',
              fontSize: '1rem'
            }}
          >
            <option value="">Selecione o produto...</option>
            {produtos.map((p: any) => (
              <option key={p.id} value={p.id} disabled={p.estoque <= 0}>
                {p.nome} {p.estoque <= 0 ? "(ESGOTADO)" : `(Qtd: ${p.estoque})`}
              </option>
            ))}
          </select>
        </div>

        {/* Quantidade */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#3d2b1f' }}>
            Quantidade
          </label>
          <input
            type="number"
            min="1"
            value={quantidade}
            onChange={(e) => {
              setQuantidade(parseInt(e.target.value));
              setErro('');
            }}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '8px',
              border: '1px solid #d4b896',
              backgroundColor: '#fdf3e7',
              color: '#3d2b1f',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Preview do total */}
        {produtoSelecionado && (
          <div style={{
            backgroundColor: '#fdf0e0',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #c9a84c',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, color: '#3d2b1f' }}>
              Total: <strong style={{ color: '#c4622d', fontSize: '1.2rem' }}>
                R$ {(produtoSelecionado.preco * quantidade).toFixed(2)}
              </strong>
            </p>
          </div>
        )}

        {/* Botão finalizar */}
        <button
          onClick={handleVenda}
          disabled={enviando || !produtoId || (produtoSelecionado?.estoque || 0) <= 0}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: (enviando || !produtoId) ? '#d4b896' : '#c4622d',
            color: '#fff8f0',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: (enviando || !produtoId) ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {enviando ? "Processando..." : "Finalizar Venda"}
        </button>
      </div>
    </div>
  );
}