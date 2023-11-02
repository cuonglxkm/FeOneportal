import { Injectable } from '@angular/core';
import { Dept } from '@app/core/models/interfaces/department';
import { Observable } from 'rxjs';

import { PageInfo, SearchCommonVO } from '../../../models/interfaces/types';
import { BaseHttpService } from '../base-http.service';

@Injectable({
  providedIn: 'root'
})
export class DeptService {
  constructor(public http: BaseHttpService) {}

  public getDepts(param: SearchCommonVO<Dept>): Observable<PageInfo<Dept>> {
    return this.http.post('/department/list/', param);
  }

  public getDeptsDetail(id: number): Observable<Dept> {
    return this.http.get(`/department/${id}/`);
  }

  public addDepts(param: Dept): Observable<void> {
    return this.http.post('/department/', param);
  }

  public delDepts(ids: number[]): Observable<void> {
    return this.http.post('/department/del/', { ids });
  }

  public editDepts(param: Dept): Observable<void> {
    return this.http.put('/department/', param);
  }
}
