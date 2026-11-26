import { AfterViewInit, Component, ElementRef, OnDestroy, inject, input, output } from '@angular/core';

/**
 * Organismo: bottom sheet modal. Esc ou toque no fundo fecham (U-02.6); o foco entra no sheet
 * ao abrir e volta para quem o abriu ao fechar. Quem usa decide quando renderizar (@if).
 */
@Component({
  selector: 'nb-bottom-sheet',
  template: `
    <div class="absolute inset-0 bg-ink/40" aria-hidden="true" (click)="fechar.emit()"></div>
    <section role="dialog" aria-modal="true" [attr.aria-label]="rotulo()" tabindex="-1"
      class="relative mx-auto max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-card bg-surface px-5 pb-6 pt-3 shadow-n2 outline-none">
      <div class="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" aria-hidden="true"></div>
      <ng-content />
    </section>
  `,
  host: { class: 'fixed inset-0 z-40 flex items-end', '(document:keydown.escape)': 'fechar.emit()' },
})
export class NbBottomSheet implements AfterViewInit, OnDestroy {
  readonly rotulo = input.required<string>();
  readonly fechar = output<void>();
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly anterior = document.activeElement as HTMLElement | null;

  ngAfterViewInit(): void {
    this.el.nativeElement.querySelector<HTMLElement>('[role=dialog]')?.focus();
  }

  ngOnDestroy(): void {
    this.anterior?.focus?.();
  }
}
