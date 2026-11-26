import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { abrirRota } from '../../../testing/abrir-rota';
import { limpo } from '../../../testing/renderizar';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { CaixinhasRepositorio } from '../../core/dados/repositorios';
import { MovimentoSheet } from '../../core/estado/sheets';
import { hojeISO } from '../../core/tempo/mes';
import { CaixinhaDetalheFacade } from './caixinha-detalhe.facade';

@Component({ template: '', providers: [CaixinhaDetalheFacade] })
class Pagina {}
@Component({ template: '' })
class Vazio {}

describe('CaixinhaDetalheFacade (R-04.4, R-04.7)', () => {
  const abrir = async (id: string) => {
    const { servico: f, router } = await abrirRota(`/caixinhas/${id}`,
      [{ path: 'caixinhas/:id', component: Pagina }, { path: 'caixinhas', component: Vazio }], CaixinhaDetalheFacade, [proverDadosEmMemoria()]);
    return { f, router };
  };

  it('monta caixinha e histórico mais recente primeiro', async () => {
    const { f } = await abrir('c3');
    const vm = f.vm()!;
    expect(vm.caixinha).toMatchObject({ nome: 'Celular novo', percentual: 40 });
    expect(vm.movimentos).toHaveLength(3);
    expect(vm.movimentos[0].centavos).toBe(30000);
    f.retirar();
    expect(TestBed.inject(MovimentoSheet).pedido()).toEqual({ caixinhaId: 'c3', tipo: 'retirar' });
  });

  it('com saldo não exclui e pede para retirar antes', async () => {
    const { f, router } = await abrir('c2');
    await f.excluir();
    expect(limpo(f.erro())).toBe('Retire os R$ 300,00 antes de excluir esta caixinha.');
    expect(router.url).toBe('/caixinhas/c2');
  });

  it('com saldo zero exclui e volta para a lista', async () => {
    const { f, router } = await abrir('c2');
    await TestBed.inject(CaixinhasRepositorio).movimentar('c2', { tipo: 'retirar', valorCentavos: 30000, data: hojeISO() });
    await f.excluir();
    expect(router.url).toBe('/caixinhas');
  });

  it('id inexistente marca não encontrada', async () => {
    const { f } = await abrir('nada');
    expect(f.naoEncontrada()).toBe(true);
  });
});
