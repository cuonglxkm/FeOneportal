import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NzSafeAny } from 'ng-zorro-antd/core/types';

import { PageInfo, SearchCommonVO } from '../../../models/interfaces/types';
import { BaseHttpService } from '../base-http.service';
import { PutPermissionParam, Role } from '@app/core/models/interfaces/role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(public http: BaseHttpService) { }

  public getRoles(param: SearchCommonVO<Role>): Observable<PageInfo<Role>> {
    const { pageNum, pageSize, filters } = param
    let q = []
    if (pageNum) q.push(`_page=${pageNum}`)
    if (pageSize) q.push(`_limit=${pageSize}`)
    if (filters?.roleName) q.push(`name=${filters.roleName}`)
    let uri = q.length > 0 ? `/role?${q.join('&')}` : '/role'
    return this.http.get(uri);
  }

  public getRolesDetail(id: number): Observable<Role> {
    return this.http.get(`/role/${id}/`);
  }

  public addRoles(param: Role): Observable<void> {
    return this.http.post('/role/', param);
  }

  public delRoles(ids: number[]): Observable<void> {
    return this.http.post('/role/del/', { ids });
  }

  public editRoles(param: Role): Observable<void> {
    return this.http.put('/role/', param);
  }

  public getPermissionById(id: number): Observable<string[]> {
    return this.http.get(`/permission/${id}/`);
  }

  public updatePermission(param: PutPermissionParam): Observable<NzSafeAny> {
    return this.http.put('/permission/', param);
  }
}
