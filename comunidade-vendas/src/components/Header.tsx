import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header style={{ 
      backgroundColor: '#1e293b', 
      padding: '1rem 5%', // Usa porcentagem para as laterais
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap', // Permite que o menu desça se não houver espaço
      gap: '15px', // Mantém distância entre logo e botões quando quebrar
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
        flexWrap: 'wrap', // Faz os links se organizarem em telas pequenas
        justifyContent: 'center' 
      }}>
        <Link to="/" style={navItemStyle}>Dashboard</Link>
        <Link to="/inventario" style={navItemStyle}>Inventário</Link>
        <Link to="/vendas" style={navItemStyle}>Vendas</Link>
        
        {/* Botão Novo Item com largura mínima garantida */}
        <Link to="/cadastro" style={{
          ...navItemStyle,
          backgroundColor: '#deff9a',
          color: '#0f172a',
          padding: '8px 16px',
          borderRadius: '8px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap', // Impede que o texto "Novo Item" quebre em duas linhas
          minWidth: 'fit-content'
        }}>
          + Novo Item
        </Link>
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