// ─── Usuario ─────────────────────────────────────────────────────────────────

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  nivelAcesso?: string;
  foto?: string;
  regiao?: string;
  dataCadastro?: string;
};

export type UsuarioPerfil = {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  totalAnuncios: number;
  totalDoacoes: number;
};

export type UsuarioCreatePayload = {
  nome: string;
  email: string;
  senha: string;
  nivelAcesso?: string;
};

export type UsuarioUpdatePayload = {
  nome?: string;
  email?: string;
};

export type UsuarioSenhaPayload = {
  senhaAtual: string;
  novaSenha: string;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type LoginPayload = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  usuario: Usuario;
};

// ─── Doador ───────────────────────────────────────────────────────────────────

export type Doador = {
  id: number;
  nome: string;
  cpf?: string;
  cep?: string;
  foto?: string;
  cidade?: string;
  estado?: string;
  nomeFantasia?: string;
  dataCadastro: string;
};

// ─── Categoria ────────────────────────────────────────────────────────────────

export type Categoria = {
  id: number;
  nome: string;
};

// ─── Anuncio ──────────────────────────────────────────────────────────────────

export type Anuncio = {
  id: number;
  nome: string;
  descricao: string;
  foto?: string;
  fotos?: string;
  tamanho: string;
  condicao: string;
  regiao?: string;
  statusAnuncio: string;
  categoria: Categoria;
  doador: Doador;
  dataCadastro: string;
};

export type AnuncioCreatePayload = {
  nome: string;
  descricao: string;
  categoriaId: number;
  doadorId: number;
  tamanho: string;
  condicao: string;
};

export type AnuncioUpdatePayload = Partial<AnuncioCreatePayload>;

// ─── Solicitacao ──────────────────────────────────────────────────────────────

export type Solicitacao = {
  id: number;
  dataCadastro: string;
  statusSolicitacao: string;
  telefone?: string;
  usuario: Usuario;
  anuncio: Anuncio;
};

export type SolicitacaoCreatePayload = {
  usuario: { id: number };
  anuncio: { id: number };
  telefone?: string;
};

// ─── Favorito ─────────────────────────────────────────────────────────────────

export type Favorito = {
  anuncioId: number;
  usuarioId: number;
  anuncio: Anuncio;
};

// ─── Utilitários ──────────────────────────────────────────────────────────────

export type ColorScheme = 'light' | 'dark';

export type ApiError = {
  message: string;
  status: number;
  timestamp?: string;
};
