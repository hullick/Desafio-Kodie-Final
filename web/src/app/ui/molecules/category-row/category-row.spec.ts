import { limpo, renderizar } from '../../../../testing/renderizar';
import { NbCategoryRow } from './category-row';

describe('NbCategoryRow', () => {
  it('mostra rótulo, percentual e valor', async () => {
    const r = await renderizar(NbCategoryRow, {
      fatia: { id: 'alimentacao', rotulo: 'Alimentação', icone: 'utensils', cor: '#00A3A6', fundo: '#E6FAFA', centavos: 32000, percentual: 41.6 },
    });
    expect(limpo(r.texto())).toBe('Alimentação 41,6% R$ 320,00');
  });
});
