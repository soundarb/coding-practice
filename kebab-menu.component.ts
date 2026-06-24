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
  templateUrl: './kebab-menu.component.html',
  styleUrl: './kebab-menu.component.css',
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

  openMenu(): void {
    this.open.set(true);
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
