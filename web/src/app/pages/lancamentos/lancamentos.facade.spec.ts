import { Component } from '@angular/core';
import { abrirRota } from '../../../testing/abrir-rota';
import { estabilizar } from '../../../testing/estabilizar';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { mesAtual, somarMeses } from '../../core/tempo/mes';
import { LancamentosFacade } from './lancamentos.facade';

@Component({ template: '', providers: [LancamentosFacade] })
class Pagina {}

describe('LancamentosFacade (R-02.8)', () => {
  const abrir = async (url: string) => {
    const { servico: f, router } = await abrirRota(url, [{ path: 'lancamentos', component: Pagina }], LancamentosFacade, [proverDadosEmMemoria()]);
    return { f, router };
  };

  it('agrupa o mês atual por dia, do mais recente para o mais antigo', async () => {
    const { f } = await abrir('/lancamentos');
    const grupos = f.grupos()!;
    expect(grupos[0].rotulo).toBe('Hoje');
    expect(grupos.flatMap((g) => g.itens)).toHaveLength(9);
  });

  it('lê o mês da URL e a atualiza ao trocar', async () => {
    const ant = somarMeses(mesAtual(), -1);
    const { f, router } = await abrir(`/lancamentos?ano=${ant.ano}&mes=${ant.mes}`);
    expect(f.mes.mes()).toEqual(ant);
    expect(f.grupos()).toEqual([]);
    f.mes.proximo();
    await estabilizar();
    const m = mesAtual();
    expect(router.url).toBe(`/lancamentos?ano=${m.ano}&mes=${m.mes}`);
  });
});
