import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import Vendas from "./pages/Vendas";
import Cadastro from "./pages/Cadastro"; // Importação já estava ok
import "./App.css";

export default function App() {
  return (
    <DataProvider>
      <Router>
        <Header />
        <Routes>
          {/* Página Inicial: Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Listagem de Produtos */}
          <Route path="/inventario" element={<Inventario />} />

          {/* Lançamento de Vendas */}
          <Route path="/vendas" element={<Vendas />} />

          {/* Cadastro de Novos Produtos (Faltava esta linha abaixo) */}
          <Route path="/cadastro" element={<Cadastro />} />
        </Routes>
      </Router>
    </DataProvider>
  );
}
