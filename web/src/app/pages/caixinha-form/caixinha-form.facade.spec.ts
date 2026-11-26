import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { abrirRota } from '../../../testing/abrir-rota';
import { proverDadosEmMemoria } from '../../core/dados/prover-dados';
import { CaixinhasRepositorio } from '../../core/dados/repositorios';
import { ToastService } from '../../core/estado/toast';
import { CaixinhaFormFacade } from './caixinha-form.facade';

@Component({ template: '', providers: [CaixinhaFormFacade] })
class Pagina {}
@Component({ template: '' })
class Vazio {}

describe('CaixinhaFormFacade', () => {
  const abrir = async (url: string) => {
    const { servico: f, router } = await abrirRota(url, [
      { path: 'caixinhas/nova', component: Pagina },
      { path: 'caixinhas/:id/editar', component: Pagina },
      { path: 'caixinhas/:id', component: Vazio },
    ], CaixinhaFormFacade, [proverDadosEmMemoria()]);
    return { f, router };
  };
  const dados = { nome: 'Bike', icone: 'outro' as const, metaCentavos: 150000, prazo: { ano: 2030, mes: 1 } };

  it('cria e vai para o detalhe (R-04.3)', async () => {
    const { f, router } = await abrir('/caixinhas/nova');
    expect([f.editando(), f.pronto(), f.inicial()]).toEqual([false, true, null]);
    await f.salvar(dados);
    expect(router.url).toMatch(/^\/caixinhas\/c-/);
    expect(TestBed.inject(ToastService).atual()?.mensagem).toBe('Caixinha criada');
  });

  it('edita a caixinha da rota (R-04.7)', async () => {
    const { f, router } = await abrir('/caixinhas/c3/editar');
    expect(f.inicial()?.nome).toBe('Celular novo');
    expect(f.saldoCentavos()).toBe(80000);
    await f.salvar({ ...dados, nome: 'Celular top' });
    expect((await TestBed.inject(CaixinhasRepositorio).obter('c3')).nome).toBe('Celular top');
    expect(router.url).toBe('/caixinhas/c3');
  });
});
