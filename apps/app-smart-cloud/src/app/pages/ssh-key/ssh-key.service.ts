import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { SshKey } from './dto/ssh-key';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {BaseService} from "../../shared/services/base.service";

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
      '&pageSize=' + size+ '&currentPage=' + page+ '&name=' + search).pipe(
      catchError(this.handleError<BaseResponse<SshKey[]>>('get shh-key error'))
    );
  }

  // create key
  createSshKey(keypair: any) {
    return this.http.post<SshKey>(this.baseUrl + this.ENDPOINT.provisions + "/keypair", keypair, this.httpOptions).pipe(
      catchError(this.handleError<SshKey[]>('create shh-key error'))
    );
  }

  // delete key
  deleteSshKey(userId: number) {
    return this.http.delete<SshKey[]>(this.baseUrl + this.ENDPOINT.provisions + "/keypair" + '/' + userId).pipe(
      catchError(this.handleError<SshKey[]>('delete shh-key error'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
