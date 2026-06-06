import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Usuarios() {
  const { usuario } = useAuth();

  // ===== ESTADOS DE USUÁRIOS =====
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [nome, setNome] = useState("");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("usuario");
  const [categoriasSelected, setCategoriasSelected] = useState<number[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  // ===== ESTADOS DE CATEGORIAS =====
  const [categorias, setCategorias] = useState<any[]>([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [mensagemCat, setMensagemCat] = useState("");
  const [erroCat, setErroCat] = useState("");

  // ===== ESTADOS DE EDIÇÃO DE CATEGORIAS DO USUÁRIO =====
  const [editandoCats, setEditandoCats] = useState<number | null>(null);
  const [catsEdit, setCatsEdit] = useState<number[]>([]);

  // ===== ESTADO DO MODAL DE CONFIRMAÇÃO DE REMOÇÃO =====
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioParaDeletar, setUsuarioParaDeletar] = useState<number | null>(null);

  // ===== ESTADO DO MODAL DE ALTERAR SENHA =====
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [usuarioParaSenha, setUsuarioParaSenha] = useState<any>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagemSenha, setMensagemSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");

  // ===== CARREGAMENTO INICIAL =====
  const carregarUsuarios = async () => {
    try {
      const response = await api.get("/auth/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Erro ao carregar usuarios:", error);
    }
  };

  const carregarCategorias = async () => {
    try {
      const response = await api.get("/categorias");
      setCategorias(response.data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  useEffect(() => {
    carregarUsuarios();
    carregarCategorias();
  }, []);

  // ===== AÇÕES DE CATEGORIAS =====

  const cadastrarCategoria = async () => {
    if (!novaCategoria) { setErroCat("Preencha o nome da categoria."); return; }
    setErroCat("");
    try {
      await api.post("/categorias", { nome: novaCategoria });
      setMensagemCat("Categoria criada com sucesso!");
      setNovaCategoria("");
      await carregarCategorias();
      setTimeout(() => setMensagemCat(""), 3000);
    } catch (error: any) {
      setErroCat(error.response?.data?.detail || "Erro ao criar categoria.");
    }
  };

  const deletarCategoria = async (id: number) => {
    try {
      await api.delete(`/categorias/${id}`);
      await carregarCategorias();
    } catch (error: any) {
      console.error("Erro ao remover categoria:", error);
    }
  };

  // ===== AÇÕES DE USUÁRIOS =====

  const cadastrarUsuario = async () => {
    if (!nome || !login || !senha) { setErro("Preencha todos os campos."); return; }
    setErro("");
    try {
      await api.post("/auth/usuarios", { nome, login, senha, perfil, categorias: categoriasSelected });
      setMensagem("Usuário cadastrado com sucesso!");
      setNome(""); setLogin(""); setSenha(""); setPerfil("usuario"); setCategoriasSelected([]);
      await carregarUsuarios();
      setTimeout(() => setMensagem(""), 3000);
    } catch (error: any) {
      setErro(error.response?.data?.detail || "Erro ao cadastrar usuário.");
    }
  };

  const confirmarDelecao = (id: number) => {
    setUsuarioParaDeletar(id);
    setModalAberto(true);
  };

  const deletarUsuario = async () => {
    if (!usuarioParaDeletar) return;
    try {
      await api.delete(`/auth/usuarios/${usuarioParaDeletar}`);
      setModalAberto(false);
      setUsuarioParaDeletar(null);
      await carregarUsuarios();
    } catch (error: any) {
      console.error("Erro ao remover usuario:", error);
    }
  };

  const salvarCategorias = async (usuarioId: number) => {
    try {
      await api.post("/auth/atribuir-categorias", { usuario_id: usuarioId, categoria_ids: catsEdit });
      setEditandoCats(null);
      await carregarUsuarios();
    } catch (error) {
      console.error("Erro ao atribuir categorias:", error);
    }
  };

  const abrirModalSenha = (u: any) => {
    setUsuarioParaSenha(u);
    setNovaSenha(""); setConfirmarSenha(""); setErroSenha(""); setMensagemSenha("");
    setModalSenhaAberto(true);
  };

  const alterarSenha = async () => {
    if (!novaSenha || !confirmarSenha) { setErroSenha("Preencha todos os campos."); return; }
    if (novaSenha !== confirmarSenha) { setErroSenha("As senhas não coincidem."); return; }
    if (novaSenha.length < 4) { setErroSenha("A senha deve ter no mínimo 4 caracteres."); return; }
    setErroSenha("");
    try {
      await api.put(`/auth/usuarios/${usuarioParaSenha.id}/senha`, {
        usuario_id: usuarioParaSenha.id,
        nova_senha: novaSenha
      });
      setMensagemSenha("Senha alterada com sucesso!");
      setNovaSenha(""); setConfirmarSenha("");
      setTimeout(() => { setModalSenhaAberto(false); setUsuarioParaSenha(null); setMensagemSenha(""); }, 2000);
    } catch (error: any) {
      setErroSenha(error.response?.data?.detail || "Erro ao alterar senha.");
    }
  };

  const toggleCategoria = (id: number, lista: number[], setLista: (v: number[]) => void) => {
    if (lista.includes(id)) { setLista(lista.filter(c => c !== id)); }
    else { setLista([...lista, id]); }
  };

  if (usuario?.perfil !== 'admin') {
    return <p style={{ padding: '2rem', color: '#3d2b1f' }}>Acesso negado.</p>;
  }

  return (
    <div style={{ padding: '2rem 5%', color: '#3d2b1f' }}>
      <h1 style={{ marginBottom: '2rem', color: '#3d2b1f' }}>Gerenciar Usuários</h1>

      {/* ===== SEÇÃO DE CATEGORIAS ===== */}
      <div style={{ backgroundColor: '#fdf0e0', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #d4b896' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#c4622d' }}>Categorias</h2>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            placeholder="Nome da categoria (ex: Comidas, Artesanato)"
            value={novaCategoria}
            onChange={e => setNovaCategoria(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && cadastrarCategoria()}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={cadastrarCategoria} style={{
            backgroundColor: '#c9a84c', color: '#3d2b1f',
            border: 'none', padding: '10px 24px', borderRadius: '8px',
            fontWeight: 'bold', cursor: 'pointer'
          }}>
            Criar
          </button>
        </div>

        {erroCat && <p style={{ color: '#8b2020' }}>{erroCat}</p>}
        {mensagemCat && <p style={{ color: '#4a5c3a' }}>{mensagemCat}</p>}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
          {categorias.map(cat => (
            <span key={cat.id} style={{
              backgroundColor: '#f5e6d0', padding: '4px 12px', borderRadius: '20px',
              fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px',
              border: '1px solid #d4b896', color: '#3d2b1f'
            }}>
              {cat.nome}
              <button onClick={() => deletarCategoria(cat.id)} style={{
                background: 'none', border: 'none', color: '#8b2020',
                cursor: 'pointer', fontSize: '0.9rem', padding: 0
              }}>✕</button>
            </span>
          ))}
          {categorias.length === 0 && (
            <p style={{ color: '#7a5c45', fontSize: '0.9rem' }}>Nenhuma categoria criada ainda.</p>
          )}
        </div>
      </div>

      {/* ===== SEÇÃO DE NOVO USUÁRIO ===== */}
      <div style={{ backgroundColor: '#fdf0e0', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #d4b896' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#c4622d' }}>Novo Usuário</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} />
          <input placeholder="Login" value={login} onChange={e => setLogin(e.target.value)} style={inputStyle} />
          <input placeholder="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} style={inputStyle} />
          <select value={perfil} onChange={e => setPerfil(e.target.value)} style={inputStyle}>
            <option value="usuario">Usuário</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {perfil === 'usuario' && categorias.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ color: '#7a5c45', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Categorias com acesso:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {categorias.map(cat => (
                <button key={cat.id} onClick={() => toggleCategoria(cat.id, categoriasSelected, setCategoriasSelected)} style={{
                  backgroundColor: categoriasSelected.includes(cat.id) ? '#c9a84c' : '#f5e6d0',
                  color: categoriasSelected.includes(cat.id) ? '#3d2b1f' : '#7a5c45',
                  border: '1px solid #d4b896', padding: '6px 14px', borderRadius: '20px',
                  cursor: 'pointer', fontSize: '0.85rem',
                  fontWeight: categoriasSelected.includes(cat.id) ? 'bold' : 'normal'
                }}>
                  {cat.nome}
                </button>
              ))}
            </div>
          </div>
        )}

        {erro && <p style={{ color: '#8b2020', marginTop: '0.5rem' }}>{erro}</p>}
        {mensagem && <p style={{ color: '#4a5c3a', marginTop: '0.5rem' }}>{mensagem}</p>}

        <button onClick={cadastrarUsuario} style={{
          marginTop: '1rem', backgroundColor: '#c4622d', color: '#fff8f0',
          border: 'none', padding: '10px 24px', borderRadius: '8px',
          fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem'
        }}>
          Cadastrar
        </button>
      </div>

      {/* ===== TABELA DE USUÁRIOS CADASTRADOS ===== */}
      <div style={{ backgroundColor: '#fdf0e0', padding: '1.5rem', borderRadius: '12px', border: '1px solid #d4b896' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#c4622d' }}>Usuários Cadastrados</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #d4b896' }}>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Login</th>
              <th style={thStyle}>Perfil</th>
              <th style={thStyle}>Categorias</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f5e6d0' }}>
                <td style={tdStyle}>{u.nome}</td>
                <td style={tdStyle}>{u.login}</td>
                <td style={tdStyle}>
                  <span style={{
                    backgroundColor: u.perfil === 'admin' ? '#2c3e6b' : '#c4622d',
                    color: '#fff8f0', padding: '2px 10px',
                    borderRadius: '20px', fontSize: '0.8rem'
                  }}>
                    {u.perfil}
                  </span>
                </td>
                <td style={tdStyle}>
                  {editandoCats === u.id ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {categorias.map(cat => (
                        <button key={cat.id} onClick={() => toggleCategoria(cat.id, catsEdit, setCatsEdit)} style={{
                          backgroundColor: catsEdit.includes(cat.id) ? '#c9a84c' : '#f5e6d0',
                          color: catsEdit.includes(cat.id) ? '#3d2b1f' : '#7a5c45',
                          border: '1px solid #d4b896', padding: '4px 10px',
                          borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem'
                        }}>
                          {cat.nome}
                        </button>
                      ))}
                      <button onClick={() => salvarCategorias(u.id)} style={{
                        backgroundColor: '#4a5c3a', color: '#fff8f0', border: 'none',
                        padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'
                      }}>Salvar</button>
                      <button onClick={() => setEditandoCats(null)} style={{
                        backgroundColor: '#7a5c45', color: '#fff8f0', border: 'none',
                        padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'
                      }}>Cancelar</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                      {u.categorias?.length > 0
                        ? u.categorias.map((c: string) => (
                          <span key={c} style={{
                            backgroundColor: '#f5e6d0', padding: '2px 8px',
                            borderRadius: '20px', fontSize: '0.75rem',
                            border: '1px solid #d4b896', color: '#3d2b1f'
                          }}>{c}</span>
                        ))
                        : <span style={{ color: '#7a5c45', fontSize: '0.8rem' }}>Nenhuma</span>
                      }
                      {u.perfil !== 'admin' && (
                        <button onClick={() => {
                          setEditandoCats(u.id);
                          const ids = categorias.filter(cat => u.categorias?.includes(cat.nome)).map((cat: any) => cat.id);
                          setCatsEdit(ids);
                        }} style={{
                          backgroundColor: '#2c3e6b', color: '#fff8f0', border: 'none',
                          padding: '2px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem'
                        }}>Editar</button>
                      )}
                    </div>
                  )}
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => abrirModalSenha(u)} style={{
                      backgroundColor: '#c9a84c', color: '#3d2b1f', border: 'none',
                      padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold'
                    }}>
                      Senha
                    </button>
                    {u.login !== 'admin' && (
                      <button onClick={() => confirmarDelecao(u.id)} style={{
                        backgroundColor: '#8b2020', color: '#fff8f0', border: 'none',
                        padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem'
                      }}>
                        Remover
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== MODAL DE CONFIRMAÇÃO DE REMOÇÃO ===== */}
      {modalAberto && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(61, 43, 31, 0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff8f0', padding: '2rem', borderRadius: '12px',
            width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid #d4b896'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#3d2b1f' }}>Confirmar remoção</h3>
            <p style={{ color: '#7a5c45', marginBottom: '1.5rem' }}>
              Tem certeza que deseja remover este usuário?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={deletarUsuario} style={{
                backgroundColor: '#8b2020', color: '#fff8f0', border: 'none',
                padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
              }}>Confirmar</button>
              <button onClick={() => { setModalAberto(false); setUsuarioParaDeletar(null); }} style={{
                backgroundColor: '#d4b896', color: '#3d2b1f', border: 'none',
                padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
              }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DE ALTERAR SENHA ===== */}
      {modalSenhaAberto && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(61, 43, 31, 0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff8f0', padding: '2rem', borderRadius: '12px',
            width: '100%', maxWidth: '400px', border: '1px solid #d4b896'
          }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#3d2b1f' }}>Alterar Senha</h3>
            <p style={{ color: '#7a5c45', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Usuário: <strong style={{ color: '#c4622d' }}>{usuarioParaSenha?.nome}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="password" placeholder="Nova senha" value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)} style={inputStyle} />
              <input type="password" placeholder="Confirmar nova senha" value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && alterarSenha()} style={inputStyle} />
            </div>

            {erroSenha && <p style={{ color: '#8b2020', marginTop: '0.75rem', fontSize: '0.9rem' }}>{erroSenha}</p>}
            {mensagemSenha && <p style={{ color: '#4a5c3a', marginTop: '0.75rem', fontSize: '0.9rem' }}>{mensagemSenha}</p>}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={alterarSenha} style={{
                flex: 1, backgroundColor: '#c9a84c', color: '#3d2b1f',
                border: 'none', padding: '10px', borderRadius: '8px',
                cursor: 'pointer', fontWeight: 'bold'
              }}>Salvar</button>
              <button onClick={() => { setModalSenhaAberto(false); setUsuarioParaSenha(null); }} style={{
                flex: 1, backgroundColor: '#d4b896', color: '#3d2b1f',
                border: 'none', padding: '10px', borderRadius: '8px',
                cursor: 'pointer', fontWeight: 'bold'
              }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== ESTILOS REUTILIZÁVEIS =====
const inputStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid #d4b896',
  backgroundColor: '#fdf3e7',
  color: '#3d2b1f',
  fontSize: '1rem',
  width: '100%'
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.75rem',
  color: '#7a5c45',
  fontWeight: '600'
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem',
  color: '#3d2b1f'
};