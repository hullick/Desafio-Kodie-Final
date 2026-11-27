import { CATEGORIAS, categoria, categoriasDe, ehCategoriaEntrada, ehCategoriaGasto } from './categorias';

describe('categorias (R-02.4)', () => {
  it('tem 8 categorias de gasto e 4 de entrada, com ids únicos', () => {
    expect(categoriasDe('gasto')).toHaveLength(8);
    expect(categoriasDe('entrada')).toHaveLength(4);
    expect(new Set(CATEGORIAS.map((c) => c.id)).size).toBe(CATEGORIAS.length);
  });

  it('busca por id e classifica', () => {
    expect(categoria('alimentacao').rotulo).toBe('Alimentação');
    expect(ehCategoriaGasto('lazer')).toBe(true);
    expect(ehCategoriaEntrada('salario')).toBe(true);
    expect(() => categoria('xpto' as never)).toThrow();
  });
});
