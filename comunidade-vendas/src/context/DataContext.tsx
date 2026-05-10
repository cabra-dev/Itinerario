import { createContext, useState, useContext, useEffect } from 'react';
// IMPORTANTE: Usamos a instância centralizada que já tem a lógica do Vite/Vercel
import api from "../api"; 

const DataContext = createContext<any>(null);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  // 1. Função para carregar produtos
  const carregarProdutos = async () => {
    try {
      const response = await api.get('/produtos');
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Função para carregar estatísticas
  const carregarStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  // 3. Efeito inicial (Busca os dados assim que o app abre)
  useEffect(() => {
    const buscarDadosIniciais = async () => {
      setLoading(true);
      await Promise.all([carregarProdutos(), carregarStats()]);
      setLoading(false);
    };
    buscarDadosIniciais();
  }, []);

  // 4. Função para cadastrar produto
  const cadastrarProduto = async (novoProduto: any) => {
    try {
      await api.post('/produtos', novoProduto);
      // Atualiza os dados locais após o sucesso
      await carregarProdutos();
      await carregarStats();
      return true;
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      return false;
    }
  };

  // 5. Função para registrar venda
  const registrarVenda = async (produtoId: number, quantidade: number) => {
    try {
      await api.post('/vendas', { 
        produto_id: produtoId, 
        quantidade: quantidade 
      });
      await carregarProdutos();
      await carregarStats();
      return true;
    } catch (error) {
      console.error("Erro ao realizar venda:", error);
      return false;
    }
  };

  // 6. Função para deletar produto
  const deletarProduto = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return false;
    try {
      await api.delete(`/produtos/${id}`);
      await carregarProdutos();
      await carregarStats();
      return true;
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Não é possível deletar um produto que já possui vendas registradas.");
      return false;
    }
  };

  // 7. Função para editar produto
  const editarProduto = async (id: number, dadosAtualizados: any) => {
    try {
      await api.put(`/produtos/${id}`, dadosAtualizados);
      await carregarProdutos();
      await carregarStats();
      return true;
    } catch (error) {
      console.error("Erro ao editar:", error);
      return false;
    }
  };

  return (
    <DataContext.Provider value={{ 
      produtos, 
      registrarVenda, 
      cadastrarProduto, 
      deletarProduto,
      editarProduto,
      loading, 
      stats, 
      carregarStats 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);