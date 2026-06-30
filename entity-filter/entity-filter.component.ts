import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EntityLookupService } from './entity-lookup.service';
import {
  EntityFilterSelection,
  LookupOption,
  LookupType,
} from './entity-filter.model';

@Component({
  selector: 'app-entity-filter',
  standalone: true,
  templateUrl: './entity-filter.component.html',
  styleUrl: './entity-filter.component.css',
})
export class EntityFilterComponent {
  private readonly lookup = inject(EntityLookupService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  private readonly queryInput =
    viewChild<ElementRef<HTMLInputElement>>('queryInput');

  /** Emitted on every pick or clear, so the parent table can re-filter. */
  readonly filterChange = output<EntityFilterSelection>();

  // ---- UI state -----------------------------------------------------------
  readonly mode = signal<LookupType>('organization');
  readonly query = signal('');
  readonly selected = signal<LookupOption | null>(null);
  readonly loading = signal(false);
  readonly open = signal(false);
  readonly modeMenuOpen = signal(false);
  readonly activeIndex = signal(-1);

  /** Full list returned by the API, cached per mode. */
  private readonly options = signal<LookupOption[]>([]);
  private fetchedMode: LookupType | null = null;

  readonly modeLabel = computed(() =>
    this.mode() === 'organization' ? 'Organization' : 'Skill Group'
  );

  readonly placeholder = computed(() =>
    this.mode() === 'organization'
      ? 'Find organization…'
      : 'Find skillgroup…'
  );

  /** Locally narrowed list as the user types; matches id or label. */
  readonly filtered = computed<LookupOption[]>(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.options();
    if (!q) {
      return all;
    }
    return all.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
    );
  });

  readonly showClear = computed(() => !!this.query() || !!this.selected());

  // ---- Scope dropdown (custom menu with tick marks) -----------------------
  toggleModeMenu(): void {
    this.modeMenuOpen.update((v) => !v);
    this.open.set(false);
  }

  selectMode(mode: LookupType): void {
    this.modeMenuOpen.set(false);
    if (mode === this.mode()) {
      return;
    }
    this.mode.set(mode);
    // Switching scope invalidates any current pick and the cached list.
    this.query.set('');
    this.selected.set(null);
    this.options.set([]);
    this.fetchedMode = null;
    this.activeIndex.set(-1);
    this.open.set(false);
    this.filterChange.emit({ type: mode, option: null });
  }

  // ---- Textbox ------------------------------------------------------------
  /** On focus, fetch the list for the current mode (once per mode). */
  onFocus(): void {
    this.modeMenuOpen.set(false);
    this.open.set(true);
    if (this.fetchedMode !== this.mode()) {
      this.fetch();
    }
  }

  onInput(value: string): void {
    this.query.set(value);
    this.selected.set(null);
    this.open.set(true);
    this.activeIndex.set(-1);
  }

  select(option: LookupOption): void {
    this.selected.set(option);
    this.query.set(option.label);
    this.open.set(false);
    this.activeIndex.set(-1);
    this.filterChange.emit({ type: this.mode(), option });
  }

  clear(): void {
    this.query.set('');
    this.selected.set(null);
    this.open.set(false);
    this.activeIndex.set(-1);
    this.filterChange.emit({ type: this.mode(), option: null });
    this.queryInput()?.nativeElement.focus();
  }

  onKeydown(event: KeyboardEvent): void {
    const items = this.filtered();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.open.set(true);
        this.activeIndex.set(Math.min(this.activeIndex() + 1, items.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.set(Math.max(this.activeIndex() - 1, 0));
        break;
      case 'Enter': {
        const active = items[this.activeIndex()];
        if (this.open() && active) {
          event.preventDefault();
          this.select(active);
        }
        break;
      }
      case 'Escape':
        this.open.set(false);
        this.activeIndex.set(-1);
        break;
    }
  }

  // ---- Data fetch ---------------------------------------------------------
  private fetch(): void {
    const mode = this.mode();
    this.loading.set(true);
    const request$ =
      mode === 'organization'
        ? this.lookup.getOrganizations()
        : this.lookup.getSkillGroups();

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (opts) => {
        this.options.set(opts);
        this.fetchedMode = mode;
        this.loading.set(false);
      },
      error: () => {
        this.options.set([]);
        this.loading.set(false);
      },
    });
  }

  // ---- Close on outside click ---------------------------------------------
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
      this.modeMenuOpen.set(false);
    }
  }
}
