import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { LookupOption } from './entity-filter.model';

/**
 * Fetches the lists backing the lookup textbox.
 *
 * The endpoints below are placeholders — point `baseUrl` and the paths at the
 * real PayRiva API. The `map` calls show where to normalise whatever shape the
 * backend returns into `LookupOption` (`{ id, label }`); delete them if the API
 * already returns that shape.
 */
@Injectable({ providedIn: 'root' })
export class EntityLookupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  getOrganizations(): Observable<LookupOption[]> {
    return this.http
      .get<Array<{ code: string; name: string }>>(`${this.baseUrl}/organizations`)
      .pipe(map((rows) => rows.map((r) => ({ id: r.code, label: r.name }))));
  }

  getSkillGroups(): Observable<LookupOption[]> {
    return this.http
      .get<Array<{ id: string; name: string }>>(`${this.baseUrl}/skill-groups`)
      .pipe(map((rows) => rows.map((r) => ({ id: r.id, label: r.name }))));
  }
}
