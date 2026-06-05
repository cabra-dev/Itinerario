import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { usuario, logout } = useAuth();

  return (
    <header style={{ 
      backgroundColor: '#2d1f0e',
      padding: '1rem 5%',
      color: '#f5e6d0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '15px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      width: '100%',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxSizing: 'border-box',
      borderBottom: '2px solid #c4622d'
    }}>
      {/* ===== LOGO ===== */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#c9a84c' }}>Comunidade</span>
          <span style={{ color: '#f5e6d0' }}> Gestor</span>
        </h2>
      </div>

      {/* ===== NAV ===== */}
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
            {/* Botão Novo Item — mostarda */}
            <Link to="/cadastro" style={{
              ...navItemStyle,
              backgroundColor: '#c9a84c',
              color: '#2d1f0e',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content'
            }}>
              + Novo Item
            </Link>

            {/* Botão Usuários — terracota suave */}
            <Link to="/usuarios" style={{
              ...navItemStyle,
              backgroundColor: '#5c3520',
              color: '#f5e6d0',
              padding: '8px 16px',
              borderRadius: '8px',
              whiteSpace: 'nowrap'
            }}>
              Usuários
            </Link>
          </>
        )}

        {/* Nome e botão Sair */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#d4b896' }}>
            {usuario?.nome}
          </span>
          <button onClick={logout} style={{
            backgroundColor: '#c4622d',
            color: '#f5e6d0',
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
  color: '#f5e6d0',
  textDecoration: 'none',
  fontWeight: '500',
  fontSize: '0.9rem',
  padding: '5px'
};