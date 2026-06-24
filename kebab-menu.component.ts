import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * Reusable row-action menu: a "..." trigger that opens an Edit / Remove popover.
 *
 * Usage:
 *   <app-kebab-menu
 *     [label]="'Actions for ' + row.name"
 *     (edit)="onEdit(row)"
 *     (remove)="onRemove(row)" />
 */
@Component({
  selector: 'app-kebab-menu',
  standalone: true,
  template: `
    <div class="kebab">
      <button
        type="button"
        class="kebab__trigger"
        [class.is-open]="open()"
        [attr.aria-label]="label()"
        [attr.aria-expanded]="open()"
        aria-haspopup="menu"
        (click)="toggle($event)"
        (keydown.arrowDown)="open.set(true); $event.preventDefault()"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <circle cx="4" cy="10" r="1.7" />
          <circle cx="10" cy="10" r="1.7" />
          <circle cx="16" cy="10" r="1.7" />
        </svg>
      </button>

      @if (open()) {
        <div class="kebab__menu" role="menu" [attr.aria-label]="label()">
          <button type="button" class="kebab__item" role="menuitem" (click)="onEdit()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit</span>
          </button>

          <button type="button" class="kebab__item" role="menuitem" (click)="onRemove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            <span>Remove</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .kebab { position: relative; display: inline-flex; }

    .kebab__trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: #5f6368;
      cursor: pointer;
      transition: background-color .12s ease;
    }
    .kebab__trigger:hover,
    .kebab__trigger.is-open { background: #eceef1; }
    .kebab__trigger:focus-visible {
      outline: 2px solid #1a73e8;
      outline-offset: 1px;
    }

    .kebab__menu {
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      z-index: 30;
      min-width: 168px;
      padding: 6px;
      background: #fff;
      border: 1px solid #e3e5e8;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, .14);
    }

    .kebab__item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 9px 12px;
      border: none;
      border-radius: 6px;
      background: transparent;
      font: inherit;
      font-size: 14px;
      color: #1f2329;
      text-align: left;
      cursor: pointer;
    }
    .kebab__item:hover { background: #f3f4f6; }
    .kebab__item:focus-visible {
      outline: 2px solid #1a73e8;
      outline-offset: -2px;
    }
    .kebab__item svg { flex: 0 0 auto; color: #5f6368; }
  `,
})
export class KebabMenuComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Accessible label for the trigger and menu. */
  readonly label = input<string>('Row actions');

  readonly edit = output<void>();
  readonly remove = output<void>();

  protected readonly open = signal(false);

  toggle(event: Event): void {
    event.stopPropagation();
    this.open.update((v) => !v);
  }

  onEdit(): void {
    this.open.set(false);
    this.edit.emit();
  }

  onRemove(): void {
    this.open.set(false);
    this.remove.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}
