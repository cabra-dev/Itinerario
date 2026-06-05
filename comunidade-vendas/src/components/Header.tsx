import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { usuario, logout } = useAuth();

  return (
    <header style={{ 
      backgroundColor: '#1e293b', 
      padding: '1rem 5%',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '15px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      width: '100%',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#deff9a' }}>Comunidade</span> Gestor
        </h2>
      </div>

      <nav style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px', 
        flexWrap: 'wrap',
        justifyContent: 'center' 
      }}>
        <Link to="/" style={navItemStyle}>Início</Link>
        <Link to="/inventario" style={navItemStyle}>Estoque</Link>
        <Link to="/vendas" style={navItemStyle}>Vendas</Link>

        {usuario?.perfil === 'admin' && (
          <>
            <Link to="/cadastro" style={{
              ...navItemStyle,
              backgroundColor: '#deff9a',
              color: '#0f172a',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content'
            }}>
              + Novo Item
            </Link>

            <Link to="/usuarios" style={{
              ...navItemStyle,
              backgroundColor: '#334155',
              padding: '8px 16px',
              borderRadius: '8px',
              whiteSpace: 'nowrap'
            }}>
              Usuários
            </Link>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {usuario?.nome}
          </span>
          <button onClick={logout} style={{
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 'bold'
          }}>
            Sair
          </button>
        </div>
      </nav>
    </header>
  );
}

const navItemStyle = {
  color: 'white',
  textDecoration: 'none',
  fontWeight: '500',
  fontSize: '0.9rem',
  padding: '5px'
};