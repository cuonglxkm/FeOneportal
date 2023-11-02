import { Injectable } from '@angular/core';
import { User, UserPsd } from '@app/core/models/interfaces/user';
import { Observable } from 'rxjs';

import { PageInfo, SearchCommonVO } from '../../../models/interfaces/types';
import { BaseHttpService } from '../base-http.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(public http: BaseHttpService) {}

  public getAccount(param: SearchCommonVO<User>): Observable<PageInfo<User>> {
    return this.http.post('/user/list/', param);
  }

  public getAccountDetail(id: number): Observable<User> {
    return this.http.get(`/user/${id}/`);
  }

  public addAccount(param: User): Observable<void> {
    return this.http.post('/user/', param);
  }

  public delAccount(ids: number[]): Observable<void> {
    return this.http.post('/user/del/', { ids });
  }

  public editAccount(param: User): Observable<void> {
    return this.http.put('/user/', param);
  }

  public editAccountPsd(param: UserPsd): Observable<void> {
    return this.http.put('/user/psd', param);
  }
}
