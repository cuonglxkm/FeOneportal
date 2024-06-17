import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {BaseService} from "../../shared/services/base.service";
import { BaseResponse } from '../models/base-response';
import { SshKey } from '../models/dto/ssh-key';

@Injectable({
  providedIn: 'root'
})
export class SshKeyService extends BaseService{

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { super() }

  // get all
  getSshKeys( userId: any, vpcId: any, regionId: any, page: any, size: any, search: any): Observable<BaseResponse<SshKey[]>> {
    return this.http.get<BaseResponse<SshKey[]>>(this.baseUrl + this.ENDPOINT.provisions + "/keypair" + '?userId=' + userId + '&vpcId=' + vpcId+ '&regionId=' + regionId+
      '&pageSize=' + size+ '&currentPage=' + page+ '&name=' + search);
  }

  // create key
  createSshKey(keypair: any): Observable<HttpResponse<any>>  {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + "/keypair", keypair, this.httpOptions);
  }

  // delete key
  deleteSshKey(userId: number) : Observable<HttpResponse<any>> {
    return this.http.delete<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + "/keypair" + '/' + userId);
  }

}
