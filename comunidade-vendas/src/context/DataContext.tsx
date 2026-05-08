import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Instância do Axios para centralizar a URL da API
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000'
});

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

  // 3. Efeito inicial para buscar os dados
  useEffect(() => {
    carregarProdutos();
    carregarStats();
  }, []);

  // 4. Função para cadastrar produto
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
      alert("Erro ao realizar venda. Verifique o estoque.");
      return false;
    }
  };

  // 6. Função para deletar produto (NOVO)
  const deletarProduto = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await api.delete(`/produtos/${id}`);
      await carregarProdutos();
      await carregarStats();
      return true;
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Não é possível deletar um produto que já possui vendas.");
      return false;
    }
  };

  // 7. Função para editar produto (NOVO)
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