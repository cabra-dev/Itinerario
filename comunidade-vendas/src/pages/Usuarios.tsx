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

  // Cria uma nova categoria no banco
  const cadastrarCategoria = async () => {
    if (!novaCategoria) {
      setErroCat("Preencha o nome da categoria.");
      return;
    }
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

  // Remove uma categoria (também remove vínculos com usuários)
  const deletarCategoria = async (id: number) => {
    try {
      await api.delete(`/categorias/${id}`);
      await carregarCategorias();
    } catch (error: any) {
      console.error("Erro ao remover categoria:", error);
    }
  };

  // ===== AÇÕES DE USUÁRIOS =====

  // Cadastra novo usuário com categorias selecionadas
  const cadastrarUsuario = async () => {
    if (!nome || !login || !senha) {
      setErro("Preencha todos os campos.");
      return;
    }
    setErro("");
    try {
      await api.post("/auth/usuarios", { nome, login, senha, perfil, categorias: categoriasSelected });
      setMensagem("Usuário cadastrado com sucesso!");
      setNome("");
      setLogin("");
      setSenha("");
      setPerfil("usuario");
      setCategoriasSelected([]);
      await carregarUsuarios();
      setTimeout(() => setMensagem(""), 3000);
    } catch (error: any) {
      setErro(error.response?.data?.detail || "Erro ao cadastrar usuário.");
    }
  };

  // Abre o modal de confirmação de remoção
  const confirmarDelecao = (id: number) => {
    setUsuarioParaDeletar(id);
    setModalAberto(true);
  };

  // Remove usuário e seus vínculos de categorias
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

  // Salva as categorias editadas de um usuário
  const salvarCategorias = async (usuarioId: number) => {
    try {
      await api.post("/auth/atribuir-categorias", {
        usuario_id: usuarioId,
        categoria_ids: catsEdit
      });
      setEditandoCats(null);
      await carregarUsuarios();
    } catch (error) {
      console.error("Erro ao atribuir categorias:", error);
    }
  };

  // Abre o modal de alterar senha
  const abrirModalSenha = (u: any) => {
    setUsuarioParaSenha(u);
    setNovaSenha("");
    setConfirmarSenha("");
    setErroSenha("");
    setMensagemSenha("");
    setModalSenhaAberto(true);
  };

  // Altera a senha do usuário selecionado
  const alterarSenha = async () => {
    if (!novaSenha || !confirmarSenha) {
      setErroSenha("Preencha todos os campos.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErroSenha("As senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 4) {
      setErroSenha("A senha deve ter no mínimo 4 caracteres.");
      return;
    }
    setErroSenha("");
    try {
      await api.put(`/auth/usuarios/${usuarioParaSenha.id}/senha`, {
        usuario_id: usuarioParaSenha.id,
        nova_senha: novaSenha
      });
      setMensagemSenha("Senha alterada com sucesso!");
      setNovaSenha("");
      setConfirmarSenha("");
      setTimeout(() => {
        setModalSenhaAberto(false);
        setUsuarioParaSenha(null);
        setMensagemSenha("");
      }, 2000);
    } catch (error: any) {
      setErroSenha(error.response?.data?.detail || "Erro ao alterar senha.");
    }
  };

  // Alterna seleção de categoria (marca/desmarca)
  const toggleCategoria = (id: number, lista: number[], setLista: (v: number[]) => void) => {
    if (lista.includes(id)) {
      setLista(lista.filter(c => c !== id));
    } else {
      setLista([...lista, id]);
    }
  };

  // Bloqueia acesso para não-admins
  if (usuario?.perfil !== 'admin') {
    return <p style={{ padding: '2rem', color: 'white' }}>Acesso negado.</p>;
  }

  return (
    <div style={{ padding: '2rem 5%', color: 'white' }}>
      <h1 style={{ marginBottom: '2rem' }}>Gerenciar Usuários</h1>

      {/* ===== SEÇÃO DE CATEGORIAS ===== */}
      <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Categorias</h2>

        {/* Formulário de nova categoria */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            placeholder="Nome da categoria (ex: Comidas, Artesanato)"
            value={novaCategoria}
            onChange={e => setNovaCategoria(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && cadastrarCategoria()}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={cadastrarCategoria} style={{
            backgroundColor: '#deff9a',
            color: '#0f172a',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Criar
          </button>
        </div>

        {erroCat && <p style={{ color: '#ef4444' }}>{erroCat}</p>}
        {mensagemCat && <p style={{ color: '#4ade80' }}>{mensagemCat}</p>}

        {/* Lista de categorias existentes */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
          {categorias.map(cat => (
            <span key={cat.id} style={{
              backgroundColor: '#334155',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {cat.nome}
              <button onClick={() => deletarCategoria(cat.id)} style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: 0
              }}>✕</button>
            </span>
          ))}
          {categorias.length === 0 && (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Nenhuma categoria criada ainda.</p>
          )}
        </div>
      </div>

      {/* ===== SEÇÃO DE NOVO USUÁRIO ===== */}
      <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Novo Usuário</h2>

        {/* Campos do formulário */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} />
          <input placeholder="Login" value={login} onChange={e => setLogin(e.target.value)} style={inputStyle} />
          <input placeholder="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} style={inputStyle} />
          <select value={perfil} onChange={e => setPerfil(e.target.value)} style={inputStyle}>
            <option value="usuario">Usuário</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Seleção de categorias — só aparece para perfil "usuario" */}
        {perfil === 'usuario' && categorias.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Categorias com acesso:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {categorias.map(cat => (
                <button key={cat.id} onClick={() => toggleCategoria(cat.id, categoriasSelected, setCategoriasSelected)} style={{
                  backgroundColor: categoriasSelected.includes(cat.id) ? '#deff9a' : '#334155',
                  color: categoriasSelected.includes(cat.id) ? '#0f172a' : 'white',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: categoriasSelected.includes(cat.id) ? 'bold' : 'normal'
                }}>
                  {cat.nome}
                </button>
              ))}
            </div>
          </div>
        )}

        {erro && <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>{erro}</p>}
        {mensagem && <p style={{ color: '#4ade80', marginTop: '0.5rem' }}>{mensagem}</p>}

        <button onClick={cadastrarUsuario} style={{
          marginTop: '1rem',
          backgroundColor: '#deff9a',
          color: '#0f172a',
          border: 'none',
          padding: '10px 24px',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          Cadastrar
        </button>
      </div>

      {/* ===== TABELA DE USUÁRIOS CADASTRADOS ===== */}
      <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Usuários Cadastrados</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Login</th>
              <th style={thStyle}>Perfil</th>
              <th style={thStyle}>Categorias</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #0f172a' }}>
                <td style={tdStyle}>{u.nome}</td>
                <td style={tdStyle}>{u.login}</td>
                <td style={tdStyle}>
                  <span style={{
                    backgroundColor: u.perfil === 'admin' ? '#7c3aed' : '#334155',
                    padding: '2px 10px',
                    borderRadius: '20px',
                    fontSize: '0.8rem'
                  }}>
                    {u.perfil}
                  </span>
                </td>
                <td style={tdStyle}>
                  {/* Modo edição de categorias */}
                  {editandoCats === u.id ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {categorias.map(cat => (
                        <button key={cat.id} onClick={() => toggleCategoria(cat.id, catsEdit, setCatsEdit)} style={{
                          backgroundColor: catsEdit.includes(cat.id) ? '#deff9a' : '#334155',
                          color: catsEdit.includes(cat.id) ? '#0f172a' : 'white',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}>
                          {cat.nome}
                        </button>
                      ))}
                      <button onClick={() => salvarCategorias(u.id)} style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}>Salvar</button>
                      <button onClick={() => setEditandoCats(null)} style={{
                        backgroundColor: '#64748b',
                        color: 'white',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}>Cancelar</button>
                    </div>
                  ) : (
                    /* Modo visualização de categorias */
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                      {u.categorias?.length > 0
                        ? u.categorias.map((c: string) => (
                          <span key={c} style={{
                            backgroundColor: '#334155',
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontSize: '0.75rem'
                          }}>{c}</span>
                        ))
                        : <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Nenhuma</span>
                      }
                      {/* Botão editar categorias — só para usuários comuns */}
                      {u.perfil !== 'admin' && (
                        <button onClick={() => {
                          setEditandoCats(u.id);
                          const ids = categorias
                            .filter(cat => u.categorias?.includes(cat.nome))
                            .map((cat: any) => cat.id);
                          setCatsEdit(ids);
                        }} style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}>Editar</button>
                      )}
                    </div>
                  )}
                </td>
                <td style={tdStyle}>
                  {/* Botão alterar senha — aparece para todos os usuários */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => abrirModalSenha(u)} style={{
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}>
                      Senha
                    </button>
                    {/* Botão remover — não aparece para o admin */}
                    {u.login !== 'admin' && (
                      <button onClick={() => confirmarDelecao(u.id)} style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
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
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Confirmar remoção</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Tem certeza que deseja remover este usuário?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={deletarUsuario} style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                Confirmar
              </button>
              <button onClick={() => { setModalAberto(false); setUsuarioParaDeletar(null); }} style={{
                backgroundColor: '#334155',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DE ALTERAR SENHA ===== */}
      {modalSenhaAberto && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Alterar Senha</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Usuário: <strong style={{ color: 'white' }}>{usuarioParaSenha?.nome}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="password"
                placeholder="Nova senha"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Confirmar nova senha"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && alterarSenha()}
                style={inputStyle}
              />
            </div>

            {erroSenha && <p style={{ color: '#ef4444', marginTop: '0.75rem', fontSize: '0.9rem' }}>{erroSenha}</p>}
            {mensagemSenha && <p style={{ color: '#4ade80', marginTop: '0.75rem', fontSize: '0.9rem' }}>{mensagemSenha}</p>}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={alterarSenha} style={{
                flex: 1,
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                Salvar
              </button>
              <button onClick={() => { setModalSenhaAberto(false); setUsuarioParaSenha(null); }} style={{
                flex: 1,
                backgroundColor: '#334155',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                Cancelar
              </button>
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
  border: '1px solid #334155',
  backgroundColor: '#0f172a',
  color: 'white',
  fontSize: '1rem',
  width: '100%'
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.75rem',
  color: '#94a3b8',
  fontWeight: '500'
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem',
  color: 'white'
};