import { createContext, useState, useContext, useEffect } from 'react';
import api from "../api";
import { useAuth } from "./AuthContext";

const DataContext = createContext<any>(null);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { usuario } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const getParams = () => {
    if (usuario?.perfil === 'admin') {
      return { perfil: 'admin', categorias: '' };
    }
    return {
      perfil: 'usuario',
      categorias: (usuario?.categorias || []).join(',')
    };
  };

  const carregarProdutos = async () => {
    try {
      const params = getParams();
      const response = await api.get('/produtos', { params });
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarStats = async () => {
    try {
      const params = getParams();
      const response = await api.get('/dashboard/stats', { params });
      setStats(response.data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  useEffect(() => {
    const buscarDadosIniciais = async () => {
      setLoading(true);
      await Promise.all([carregarProdutos(), carregarStats()]);
      setLoading(false);
    };
    buscarDadosIniciais();
  }, [usuario]);

  const cadastrarProduto = async (novoProduto: any) => {
    try {
      await api.post('/produtos', novoProduto);
      await carregarProdutos();
      await carregarStats();
      return true;
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      return false;
    }
  };

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

  const deletarProduto = async (id: number) => {
    try {
      await api.delete(`/produtos/${id}`);
      await carregarProdutos();
      await carregarStats();
      return true;
    } catch (error) {
      console.error("Erro ao deletar:", error);
      return false;
    }
  };
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