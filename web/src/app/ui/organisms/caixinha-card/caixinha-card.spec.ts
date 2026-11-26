import { provideRouter } from '@angular/router';
import { limpo, renderizar } from '../../../../testing/renderizar';
import { CaixinhaCardVM } from '../../modelos';
import { NbCaixinhaCard } from './caixinha-card';

const base: CaixinhaCardVM = {
  id: 'c3', nome: 'Celular novo', icone: 'smartphone', guardadoCentavos: 80000, metaCentavos: 200000,
  progresso: 0.4, percentual: 40, prazoRotulo: 'mar/2027', sugeridoCentavos: 30000, faltamCentavos: 120000, estado: 'ativa',
};
const render = (entradas: Record<string, unknown>) => renderizar(NbCaixinhaCard, entradas, [provideRouter([])]);

describe('NbCaixinhaCard', () => {
  it('completo mostra valores, prazo, sugestão e guarda a um toque (R-04.2, U-04.3)', async () => {
    const r = await render({ caixinha: base });
    const t = limpo(r.texto());
    expect(t).toContain('R$ 800,00 de R$ 2.000,00 40%');
    expect(t).toContain('Prazo: até mar/2027');
    expect(r.q('a').getAttribute('href')).toBe('/caixinhas/c3');
    expect(r.q('nb-progress-bar').getAttribute('role')).toBe('progressbar');
    let id = '';
    r.instancia.guardar.subscribe((x) => (id = x));
    r.q('button[aria-label="Guardar em Celular novo"]').click();
    expect(id).toBe('c3');
  });

  it('resumo mostra meta, percentual e guardado (R-03.5)', async () => {
    const r = await render({ caixinha: { ...base, percentual: 37.5 }, variante: 'resumo' });
    expect(limpo(r.texto())).toBe('Celular novo Meta: R$ 2.000,00 37,5% Guardado R$ 800,00');
    expect(r.el.querySelector('button')).toBeNull();
  });

  it('meta atingida oferece retirar (R-04.8)', async () => {
    const r = await render({ caixinha: { ...base, estado: 'atingida', sugeridoCentavos: null, faltamCentavos: 0, progresso: 1, percentual: 100 } });
    expect(r.texto()).toContain('Meta atingida');
    let id = '';
    r.instancia.retirar.subscribe((x) => (id = x));
    r.q('button').click();
    expect(id).toBe('c3');
  });

  it('prazo encerrado diz quanto falta e ainda permite guardar', async () => {
    const r = await render({ caixinha: { ...base, estado: 'prazo_encerrado', sugeridoCentavos: null } });
    expect(limpo(r.texto())).toContain('Prazo encerrado. Faltam R$ 1.200,00.');
    expect(r.q('button').getAttribute('aria-label')).toBe('Guardar em Celular novo');
  });
});
