import {Inject, Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class PolicyCoreService extends BaseService {

  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Project-Id': localStorage.getItem('projectId') && Number(localStorage.getItem('projectId')) > 0 ? Number(localStorage.getItem('projectId')) : 0,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  getShareUsers(baseUrl: string, userRootId?: number): Observable<any> {
    localStorage.removeItem('ShareUsers')
    return this.http.get<any>(baseUrl + this.ENDPOINT.iam + '/permissions/share-users', { headers: this.getHeaders() } );
  }
}
