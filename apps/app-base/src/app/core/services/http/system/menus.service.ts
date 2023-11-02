import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Menu, PageInfo, SearchCommonVO } from '@app/core/models/interfaces/types';
import { BaseHttpService } from '@services/base-http.service';
import { MenuListObj } from '@app/core/models/interfaces/menu';

@Injectable({
  providedIn: 'root'
})
export class MenusService {
  constructor(public http: BaseHttpService) {}

  public getMenuList(param: SearchCommonVO<any>): Observable<PageInfo<Menu>> {
    return this.http.post('/sysPermission/list', param);
  }

  public addMenus(param: MenuListObj): Observable<void> {
    return this.http.post('/sysPermission', param, { needSuccessInfo: true });
  }

  public editMenus(param: MenuListObj): Observable<void> {
    return this.http.put('/sysPermission', param, { needSuccessInfo: true });
  }

  public delMenus(id: number): Observable<void> {
    return this.http.post('/sysPermission/del', { ids: [id] }, { needSuccessInfo: true });
  }

  public getMenuDetail(id: number): Observable<MenuListObj> {
    return this.http.get(`/sysPermission/${id}`);
  }
}
