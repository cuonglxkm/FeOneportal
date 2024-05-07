import { Inject, Injectable } from '@angular/core';
import { BaseService } from '../shared/services/base.service';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleService extends BaseService {

  private __refreshUserList$: Observable<void>;
  private __refreshUserSubject = new Subject<void>();

  constructor(
    private http: HttpClient
  ) {
    super();
    this.__refreshUserList$ = this.__refreshUserSubject.asObservable();
  }
  public notifyRefreshUserList() {
    this.__refreshUserSubject.next();
  }

  get refresUserist$(): Observable<void> {
    return this.__refreshUserList$;
  }

  // override baseUrl = 'http://localhost:16008';
  prefix_url = "mongodb-replicaset-service"

  getallRole(service_order_code: string, role: string, page: number, size: number): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/${this.prefix_url}/roles/${service_order_code}?role=${role}&page=${page}&size=${size}`);
  }

  syncData(service_order_code: string): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/${this.prefix_url}/roles/syncData/${service_order_code}`,null);
  }

  addNewRole(requestBody: any) : Observable<any> {
    return this.http.post(`${this.baseUrl}/${this.prefix_url}/roles`,requestBody);
  }

  updateRole(requestBody: any) : Observable<any> {
    return this.http.put(`${this.baseUrl}/${this.prefix_url}/roles`,requestBody);
  }

  deleteRole(name: string, service_order_code: string) {
    return this.http.delete(
      `${this.baseUrl}/${this.prefix_url}/roles/${service_order_code}/${name}`  
    )
  }

  getRoleByName(service_order_code: string, roleName : string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.prefix_url}/roles/`+service_order_code+`/`+roleName);
  }

  getRoleAlreadyUse(service_order_code: string, roleName : string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.prefix_url}/db-user/check/`+service_order_code+`/`+roleName);
  }

}
