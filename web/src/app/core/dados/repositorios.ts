import { Signal } from '@angular/core';
import { Mes } from '../tempo/mes';
import {
  Caixinha, DadosCaixinha, Lancamento, MovimentoCaixinha, NovoLancamento, NovoMovimento, Perfil, ResumoMes,
} from '../dominio/tipos';

/*
 * Contratos de acesso a dados. Os componentes e facades dependem SÓ destas classes abstratas
 * (usadas como tokens de DI). Há duas implementações: HTTP (core/dados/http, a API real em
 * /api/*, contrato em docs/api/openapi.yaml) e em memória (core/dados/memoria, demonstração e
 * testes). A escolha fica em app.config.ts, via environment.dados.
 */

export abstract class LancamentosRepositorio {
  abstract listarDoMes(m: Mes): Promise<Lancamento[]>;
  /** Os `limite` mais recentes do mês ("Últimos lançamentos" do Início, R-03.6). */
  abstract ultimos(m: Mes, limite: number): Promise<Lancamento[]>;
  abstract obter(id: string): Promise<Lancamento>;
  abstract criar(dados: NovoLancamento): Promise<Lancamento>;
  abstract atualizar(id: string, dados: NovoLancamento): Promise<Lancamento>;
  abstract excluir(id: string): Promise<void>;
}

export abstract class CaixinhasRepositorio {
  abstract listar(): Promise<Caixinha[]>;
  abstract obter(id: string): Promise<Caixinha>;
  abstract criar(dados: DadosCaixinha): Promise<Caixinha>;
  abstract editar(id: string, dados: DadosCaixinha): Promise<Caixinha>;
  abstract excluir(id: string): Promise<void>;
  abstract movimentos(caixinhaId: string): Promise<MovimentoCaixinha[]>;
  abstract movimentar(caixinhaId: string, mov: NovoMovimento): Promise<void>;
}

export abstract class ResumoRepositorio {
  abstract resumoDoMes(m: Mes): Promise<ResumoMes>;
}

export abstract class PerfilRepositorio {
  abstract obter(): Promise<Perfil>;
  abstract atualizarNome(nome: string): Promise<Perfil>;
}

export type CodigoErroCaixinha = 'saldo_insuficiente' | 'caixinha_com_saldo' | 'nao_encontrada';

export class ErroCaixinha extends Error {
  constructor(readonly codigo: CodigoErroCaixinha) {
    super(codigo);
  }
}

export interface NovaConta {
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
}

/** Sessão do usuário (spec 01 e spec 05), sobre o Better Auth em /api/auth/*. */
export abstract class SessaoRepositorio {
  abstract readonly autenticado: Signal<boolean>;
  /**
   * Consulta a sessão no servidor (cookie HttpOnly) e atualiza `autenticado`. A primeira chamada
   * vai à rede; as seguintes reaproveitam o resultado até entrar, sair ou a sessão expirar.
   */
  abstract verificar(): Promise<boolean>;
  /** Rejeita com ErroSessao('credenciais_invalidas') sem dizer qual campo errou (R-01.7). */
  abstract entrar(email: string, senha: string): Promise<void>;
  /** Cria a conta e já entra nela (sem confirmação de e-mail). */
  abstract cadastrar(conta: NovaConta): Promise<void>;
  abstract sair(): Promise<void>;
  /** "Esqueci a senha": resposta sempre neutra (R-01.8). */
  abstract pedirRedefinicao(email: string): Promise<void>;
  /** Nova senha com o token do link do e-mail. Encerra as sessões da conta. */
  abstract redefinirSenha(token: string, novaSenha: string): Promise<void>;
  /** Troca a senha conferindo a atual e encerra os outros aparelhos (R-05.3). */
  abstract alterarSenha(atual: string, nova: string): Promise<void>;
  /** Apaga a conta e todos os dados, de forma definitiva (R-05.6). */
  abstract excluirConta(senha: string): Promise<void>;
  /** A API respondeu 401 (sessão expirou ou foi encerrada em outro lugar): esquece a sessão local. */
  abstract encerrarLocalmente(): void;
}

export type CodigoErroSessao =
  | 'credenciais_invalidas'
  | 'email_em_uso'
  | 'senha_fraca'
  | 'nome_invalido'
  | 'aceite_obrigatorio'
  | 'senha_atual_incorreta'
  | 'token_invalido'
  | 'muitas_tentativas'
  | 'falha';

export class ErroSessao extends Error {
  constructor(readonly codigo: CodigoErroSessao) {
    super(codigo);
  }
}
