import { Injectable, computed, inject } from '@angular/core';
import {
  CaixinhasRepositorio, LancamentosRepositorio, PerfilRepositorio, ResumoRepositorio,
} from '../../core/dados/repositorios';
import { carregavel } from '../../core/estado/carregavel';
import { DadosAlterados } from '../../core/estado/dados-alterados';
import { Preferencias } from '../../core/estado/preferencias';
import { LancamentoSheet } from '../../core/estado/sheets';
import { primeiroNome } from '../../core/formatacao/texto';
import { hojeISO } from '../../core/tempo/mes';
import { paraCaixinhaVM, paraFatiasVM, paraTransacaoVM } from '../compartilhado/mapeadores';
import { mesNavegavel } from '../compartilhado/mes-navegavel';

const ULTIMOS = 4;
const CAIXINHAS_NO_PAINEL = 2;

/** Monta o painel do mês (spec 03): saudação, saldo, categorias, caixinhas e últimos lançamentos. */
@Injectable()
export class InicioFacade {
  private readonly lancamentos = inject(LancamentosRepositorio);
  private readonly caixinhas = inject(CaixinhasRepositorio);
  private readonly resumo = inject(ResumoRepositorio);
  private readonly perfil = inject(PerfilRepositorio);
  private readonly alterados = inject(DadosAlterados);
  private readonly preferencias = inject(Preferencias);
  private readonly sheet = inject(LancamentoSheet);

  readonly mes = mesNavegavel();
  readonly oculto = this.preferencias.ocultarValores;

  private readonly dados = carregavel(
    () => ({ mes: this.mes.mes(), versao: this.alterados.versao() }),
    async ({ mes }) => {
      const [perfil, resumo, lancs, caixinhas] = await Promise.all([
        this.perfil.obter(), this.resumo.resumoDoMes(mes), this.lancamentos.ultimos(mes, ULTIMOS), this.caixinhas.listar(),
      ]);
      const hoje = hojeISO();
      return {
        nome: primeiroNome(perfil.nome),
        saldo: resumo.saldo,
        entradas: resumo.entradas,
        gastos: resumo.gastos,
        fatias: paraFatiasVM(resumo.porCategoria),
        caixinhas: caixinhas.map((c) => paraCaixinhaVM(c, hoje)).filter((c) => c.estado === 'ativa').slice(0, CAIXINHAS_NO_PAINEL),
        ultimos: [{ rotulo: '', itens: lancs.map((l) => paraTransacaoVM(l, hoje)) }].filter((g) => g.itens.length),
      };
    },
  );

  readonly vm = this.dados.valor;
  readonly carregando = this.dados.carregando;
  readonly falhou = this.dados.falhou;
  readonly linkVerTodos = computed(() => ({ ano: this.mes.mes().ano, mes: this.mes.mes().mes }));

  alternarOculto(): void {
    this.preferencias.alternarOcultarValores();
  }

  editar(id: string): void {
    this.sheet.abrir(id);
  }
}
