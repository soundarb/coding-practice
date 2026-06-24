import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import type { Proficiency, SkillFilter } from './skill-group.model';

/**
 * "Filter" button that opens a popover to filter the table by name and proficiency.
 * Emits the current filter whenever Apply/Clear is pressed.
 *
 * Usage:
 *   <app-table-filter (filterChange)="filter.set($event)" />
 */
@Component({
  selector: 'app-table-filter',
  standalone: true,
  template: `
    <div class="filter">
      <button
        type="button"
        class="filter__trigger"
        [class.is-active]="activeCount() > 0"
        [attr.aria-expanded]="open()"
        aria-haspopup="dialog"
        (click)="toggle($event)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span>Filter</span>
        @if (activeCount() > 0) {
          <span class="filter__badge">{{ activeCount() }}</span>
        }
      </button>

      @if (open()) {
        <div class="filter__panel" role="dialog" aria-label="Filter skill groups">
          <label class="filter__field">
            <span class="filter__label">Name</span>
            <input
              type="text"
              class="filter__input"
              placeholder="Search by name"
              [value]="search()"
              (input)="search.set($any($event.target).value)"
            />
          </label>

          <fieldset class="filter__field">
            <legend class="filter__label">Proficiency</legend>
            @for (p of allProficiencies; track p) {
              <label class="filter__check">
                <input
                  type="checkbox"
                  [checked]="selected().includes(p)"
                  (change)="toggleProficiency(p)"
                />
                <span>{{ p }}</span>
              </label>
            }
          </fieldset>

          <div class="filter__actions">
            <button type="button" class="filter__btn filter__btn--ghost" (click)="clear()">
              Clear
            </button>
            <button type="button" class="filter__btn filter__btn--primary" (click)="apply()">
              Apply
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .filter { position: relative; display: inline-flex; }

    .filter__trigger {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 10px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: #3c4043;
      font: inherit;
      font-size: 14px;
      cursor: pointer;
    }
    .filter__trigger:hover { background: #eceef1; }
    .filter__trigger.is-active { color: #1a73e8; }
    .filter__trigger:focus-visible { outline: 2px solid #1a73e8; outline-offset: 1px; }

    .filter__badge {
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9px;
      background: #1a73e8;
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      line-height: 18px;
      text-align: center;
    }

    .filter__panel {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      z-index: 30;
      width: 260px;
      padding: 16px;
      background: #fff;
      border: 1px solid #e3e5e8;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, .14);
    }

    .filter__field { display: block; margin: 0 0 14px; padding: 0; border: 0; }
    .filter__label {
      display: block;
      margin-bottom: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #5f6368;
    }
    .filter__input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid #d2d5da;
      border-radius: 6px;
      font: inherit;
      font-size: 14px;
      box-sizing: border-box;
    }
    .filter__input:focus { outline: none; border-color: #1a73e8; }

    .filter__check {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 14px;
      color: #1f2329;
      cursor: pointer;
    }

    .filter__actions { display: flex; justify-content: flex-end; gap: 8px; }
    .filter__btn {
      padding: 7px 14px;
      border-radius: 6px;
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .filter__btn--ghost { border: 1px solid #d2d5da; background: #fff; color: #3c4043; }
    .filter__btn--ghost:hover { background: #f3f4f6; }
    .filter__btn--primary { border: 1px solid #1a73e8; background: #1a73e8; color: #fff; }
    .filter__btn--primary:hover { background: #1666d0; }
  `,
})
export class TableFilterComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly allProficiencies: Proficiency[] = ['CORE', 'EXTENDED'];

  readonly filterChange = output<SkillFilter>();

  protected readonly open = signal(false);
  protected readonly search = signal('');
  protected readonly selected = signal<Proficiency[]>([]);

  protected readonly activeCount = computed(
    () => (this.search().trim() ? 1 : 0) + this.selected().length,
  );

  toggle(event: Event): void {
    event.stopPropagation();
    this.open.update((v) => !v);
  }

  toggleProficiency(p: Proficiency): void {
    this.selected.update((list) =>
      list.includes(p) ? list.filter((x) => x !== p) : [...list, p],
    );
  }

  apply(): void {
    this.filterChange.emit({ search: this.search().trim(), proficiencies: this.selected() });
    this.open.set(false);
  }

  clear(): void {
    this.search.set('');
    this.selected.set([]);
    this.filterChange.emit({ search: '', proficiencies: [] });
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
