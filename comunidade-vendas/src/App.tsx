import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import Vendas from "./pages/Vendas";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import Usuarios from "./pages/Usuarios";
import "./App.css";

function AppRoutes() {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Login />;
  }

  return (
    <DataProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/usuarios" element={<Usuarios />} />
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}