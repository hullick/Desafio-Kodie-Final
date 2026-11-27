import { CodigoErroSessao, ErroSessao } from '../../core/dados/repositorios';

/** Mensagens para a pessoa por código de erro da sessão (as telas de conta e senha usam). */
export const MENSAGENS_SESSAO: Partial<Record<CodigoErroSessao, string>> = {
  credenciais_invalidas: 'E-mail ou senha incorretos.',
  email_em_uso: 'Já existe uma conta com esse e-mail. Entre ou recupere a senha.',
  senha_fraca: 'A senha precisa de 8+ caracteres, 1 número e 1 símbolo.',
  nome_invalido: 'O nome precisa ter de 2 a 40 caracteres.',
  senha_atual_incorreta: 'Senha atual incorreta.',
  token_invalido: 'Este link é inválido ou já expirou. Peça um novo.',
  muitas_tentativas: 'Muitas tentativas. Espere um minuto e tente de novo.',
};

export const ERRO_GENERICO_SESSAO = 'Não foi possível concluir agora. Tente de novo.';

export function mensagemDeErroSessao(e: unknown, generica = ERRO_GENERICO_SESSAO): string {
  return (e instanceof ErroSessao && MENSAGENS_SESSAO[e.codigo]) || generica;
}

/** Avisos que outras telas deixam para o login mostrar (`/entrar?aviso=...`). */
export const AVISOS_LOGIN = {
  'conta-excluida': 'Sua conta e seus dados foram apagados.',
  'senha-redefinida': 'Senha redefinida. Entre com a nova senha.',
} as const;
export type AvisoLogin = keyof typeof AVISOS_LOGIN;
