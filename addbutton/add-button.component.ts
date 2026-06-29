import { Component, input, output } from '@angular/core';

/**
 * Circular "+" add button shown in the table header's right-most column.
 *
 * Usage:
 *   <app-add-button [label]="'Add skill group'" (add)="onAdd()" />
 */
@Component({
  selector: 'app-add-button',
  standalone: true,
  templateUrl: './add-button.component.html',
  styleUrl: './add-button.component.css',
})
export class AddButtonComponent {
  /** Accessible label for the icon-only button. */
  readonly label = input<string>('Add');

  /** Optional: disable the button. */
  readonly disabled = input<boolean>(false);

  readonly add = output<void>();

  onClick(): void {
    if (!this.disabled()) {
      this.add.emit();
    }
  }
}
