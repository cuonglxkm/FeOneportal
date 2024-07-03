import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({
  providedIn: 'root',
})
export class ActionHistoryService extends BaseService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    Authorization: 'Bearer ' + this.tokenService.get()?.token,
  };

  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    super();
  }

  getData(
    pageSize: number,
    pageNumber: number,
    fromDate: string,
    toDate: string,
    action: string,
    resourceName: string,
    resourceType: string
  ): Observable<any> {
    return this.http.get<any>(
      this.baseUrl +
        '/actionlogs?pageSize=' +
        pageSize +
        '&pageNumber=' +
        pageNumber +
        '&fromDate=' +
        fromDate +
        '&toDate=' +
        toDate +
        '&action=' +
        action +
        '&resourceName=' +
        resourceName +
        '&resourceType=' +
        resourceType,
      this.httpOptions
    );
  }
}
