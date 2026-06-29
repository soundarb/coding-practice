/**
 * Shared types for the Organization / Skill Group lookup filter.
 * Mirrors the shared-model convention used by `skill-group.model.ts`.
 */

/** Which list the textbox is searching against. */
export type LookupType = 'organization' | 'skillGroup';

/** A single autocomplete row, rendered as `id – label`. */
export interface LookupOption {
  id: string;
  label: string;
}

/** Emitted whenever the user picks an option or clears the textbox. */
export interface EntityFilterSelection {
  type: LookupType;
  /** `null` when the filter has been cleared. */
  option: LookupOption | null;
}
