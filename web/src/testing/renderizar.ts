import { Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

export interface Renderizado<T> {
  fixture: ComponentFixture<T>;
  el: HTMLElement;
  instancia: T;
  /** Altera inputs e espera a renderização. */
  definir(entradas: Record<string, unknown>): Promise<void>;
  /** Atalho para querySelector com erro claro. */
  q<E extends Element = HTMLElement>(seletor: string): E;
  qs<E extends Element = HTMLElement>(seletor: string): E[];
  texto(): string;
}

/** Renderiza um componente standalone com inputs e providers. */
export async function renderizar<T>(
  tipo: Type<T>,
  entradas: Record<string, unknown> = {},
  providers: Provider[] = [],
): Promise<Renderizado<T>> {
  TestBed.configureTestingModule({ imports: [tipo], providers });
  const fixture = TestBed.createComponent(tipo);
  const definir = async (e: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(e)) fixture.componentRef.setInput(k, v);
    await fixture.whenStable();
  };
  await definir(entradas);
  const el = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    el,
    instancia: fixture.componentInstance,
    definir,
    q: <E extends Element>(s: string) => {
      const achado = el.querySelector<E>(s);
      if (!achado) throw new Error(`Elemento não encontrado: ${s}`);
      return achado;
    },
    qs: <E extends Element>(s: string) => Array.from(el.querySelectorAll<E>(s)),
    texto: () => el.textContent?.replace(/\s+/g, ' ').trim() ?? '',
  };
}

/** Normaliza NBSP e espaços para comparar textos com valores monetários. */
export const limpo = (s: string | null | undefined) => (s ?? '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
