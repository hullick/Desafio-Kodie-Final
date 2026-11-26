import { TestBed } from '@angular/core/testing';
import { mesAtual, somarMeses } from '../../tempo/mes';
import { proverDadosEmMemoria } from '../prover-dados';
import {
  CaixinhasRepositorio, ErroCaixinha, LancamentosRepositorio, PerfilRepositorio, ResumoRepositorio,
} from '../repositorios';
import { BancoMemoria } from './banco-memoria';

describe('repositórios em memória', () => {
  let lanc: LancamentosRepositorio;
  let cx: CaixinhasRepositorio;
  let resumo: ResumoRepositorio;
  let perfil: PerfilRepositorio;
  const mes = mesAtual();

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [proverDadosEmMemoria()] });
    lanc = TestBed.inject(LancamentosRepositorio);
    cx = TestBed.inject(CaixinhasRepositorio);
    resumo = TestBed.inject(ResumoRepositorio);
    perfil = TestBed.inject(PerfilRepositorio);
  });

  it('semente reproduz o painel do mockup (R$ 642,30)', async () => {
    const r = await resumo.resumoDoMes(mes);
    expect(r.entradas).toBe(141200);
    expect(r.gastos).toBe(76970);
    expect(r.saldo).toBe(64230);
  });

  it('lista, cria, atualiza e exclui lançamentos do mês', async () => {
    const antes = (await lanc.listarDoMes(mes)).length;
    const novo = await lanc.criar({ tipo: 'gasto', categoria: 'saude', valorCentavos: 1000, descricao: null, data: (await lanc.listarDoMes(mes))[0].data });
    expect((await lanc.listarDoMes(mes)).length).toBe(antes + 1);
    const atualizado = await lanc.atualizar(novo.id, { ...novo, valorCentavos: 2000 });
    expect(atualizado.valorCentavos).toBe(2000);
    expect((await lanc.obter(novo.id)).valorCentavos).toBe(2000);
    await lanc.excluir(novo.id);
    await expect(lanc.obter(novo.id)).rejects.toThrow();
    expect(await lanc.listarDoMes(somarMeses(mes, 1))).toEqual([]);
  });

  it('ordena caixinhas por prazo e calcula saldo', async () => {
    const lista = await cx.listar();
    expect(lista.map((c) => c.id)).toEqual(['c1', 'c4', 'c2', 'c3']);
    expect(lista.find((c) => c.id === 'c3')?.saldoCentavos).toBe(80000);
  });

  it('bloqueia retirada acima do saldo (R-04.5)', async () => {
    await expect(cx.movimentar('c1', { tipo: 'retirar', valorCentavos: 45001, data: '2026-01-01' }))
      .rejects.toEqual(new ErroCaixinha('saldo_insuficiente'));
    await cx.movimentar('c1', { tipo: 'retirar', valorCentavos: 45000, data: '2026-01-01' });
    expect((await cx.obter('c1')).saldoCentavos).toBe(0);
  });

  it('só exclui caixinha com saldo zero (R-04.7)', async () => {
    await expect(cx.excluir('c2')).rejects.toBeInstanceOf(ErroCaixinha);
    const nova = await cx.criar({ nome: '  Curso  ', icone: 'estudos', metaCentavos: 1000, prazo: mes });
    expect(nova.nome).toBe('Curso');
    const editada = await cx.editar(nova.id, { nome: 'Curso de inglês', icone: 'estudos', metaCentavos: 2000, prazo: mes });
    expect(editada.metaCentavos).toBe(2000);
    expect(await cx.movimentos(nova.id)).toEqual([]);
    await cx.excluir(nova.id);
    await expect(cx.obter(nova.id)).rejects.toBeInstanceOf(ErroCaixinha);
  });

  it('lê e atualiza o perfil', async () => {
    expect((await perfil.obter()).nome).toBe('Larissa Santos');
    expect((await perfil.atualizarNome('  Lari ')).nome).toBe('Lari');
  });

  it('simula latência quando pedido', async () => {
    const banco = TestBed.inject(BancoMemoria);
    await expect(banco.latencia({ a: 1 }, 1)).resolves.toEqual({ a: 1 });
    expect(banco.novoId('x')).toMatch(/^x-/);
  });
});
