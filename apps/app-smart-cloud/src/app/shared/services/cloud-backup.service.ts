import { Inject, Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { BaseService } from './base.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { AccessRule, CloudBackup, CreateAccessRule } from 'src/app/pages/cloud-backup/cloud-backup.model';

@Injectable({
  providedIn: 'root',
})
export class CloudBackupService extends BaseService {
  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService
  ) {
    super(tokenService);
  }
  getAccessRules(
    cloudBackupId: number,
    pageSize: number,
    currentPage: number,
    name: string
  ) {
    let param = new HttpParams();
    if (name != undefined || name != null) param = param.append('source', name);
    if (pageSize != undefined || pageSize != null)
      param = param.append('pageSize', pageSize);
    if (currentPage != undefined || currentPage != null)
      param = param.append('pageNumber', currentPage);

    return this.http
      .get<BaseResponse<CloudBackup[]>>(
        this.baseUrl + this.ENDPOINT.provisions + `/cloud-backup/${cloudBackupId}/pagingsgrule`,
        {
          params: param,
          headers: this.getHeaders().headers,
        }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('login');
          } else if (error.status === 404) {
            // Handle 404 Not Found error
            console.error('Resource not found');
          }
          return throwError(error);
        })
      );
  }

  checkExitName(name: string): Observable<boolean> {
    return this.http.get<boolean>(
      this.baseUrl + this.ENDPOINT.provisions + `/endpoint/check-name-exist?name=${name}`,
      {
        headers: this.getHeaders().headers,
      }
    );
  }
  checkExitUsername(username: string): Observable<boolean> {
    return this.http.get<boolean>(
      this.baseUrl + this.ENDPOINT.provisions + `/endpoint/check-username-exist?username=${username}`,
      { headers: this.getHeaders().headers }
    );
  }

  hasCloudBackup(): Observable<boolean> {
    return new BehaviorSubject<boolean>(false);
  }

  findCloudBackupByProject(regoin:number, project:number): Observable<CloudBackup> {
    return this.http.get<CloudBackup>(
      this.baseUrl + this.ENDPOINT.provisions + `/cloud-backup/find-by-project?regoinId=${regoin}&projectId=${project}`,
      { headers: this.getHeaders().headers }
    );
  }
  createAccessRule(cloudBackupId:number,accessRule: CreateAccessRule): Observable<AccessRule> {
    return this.http.post<AccessRule>(this.baseUrl + this.ENDPOINT.provisions + `/cloud-backup/${cloudBackupId}/sgrule?port=${accessRule.port}&source=${accessRule.source}`, null, {headers: this.getHeaders().headers})
  }
  updateAccessRule(accessRule: AccessRule): Observable<AccessRule> {
    return new BehaviorSubject<AccessRule>(null);
  }

  deleteAccessRule(id: number, ruleId:number): Observable<object> {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/cloud-backup/${id}/sgrule/${ruleId}`, {headers: this.getHeaders().headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  deleteCloudBackup(id: number): Observable<object> {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/cloud-backup/${id}`, {headers: this.getHeaders().headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  getCloudBackup(): Observable<CloudBackup> {
    var a = {name:"ahihi",status:"ACTIVE",id:1,customerId:1,creationDate:new Date(),expirationDate:new Date(),storage:1};
    return new BehaviorSubject<CloudBackup>(a as CloudBackup);
  }
  getCloudBackupById(id: number): Observable<CloudBackup> {
    return this.http.get<CloudBackup>(
      this.baseUrl + this.ENDPOINT.provisions + `/cloud-backup/find-by-id?id=${id}`,
      { headers: this.getHeaders().headers }
    );
  }

  getOfferByName(name: string): Observable<any> {
    return new BehaviorSubject<any>(null);
  }
}
