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
  getCloudBackups(
    pageSize: number,
    currentPage: number,
    status: string,
    name: string
  ) {
    let param = new HttpParams();
    if (status != undefined || status != null)
      param = param.append('status', status);
    if (name != undefined || name != null) param = param.append('name', name);
    if (pageSize != undefined || pageSize != null)
      param = param.append('pageSize', pageSize);
    if (currentPage != undefined || currentPage != null)
      param = param.append('currentPage', currentPage);

    return this.http
      .get<BaseResponse<CloudBackup[]>>(
        this.baseUrl + this.ENDPOINT.provisions + '/endpoint/endpoints',
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
  createAccessRule(accessRule: CreateAccessRule): Observable<AccessRule> {
    return new BehaviorSubject<AccessRule>(null);
  }
  updateAccessRule(accessRule: AccessRule): Observable<AccessRule> {
    return new BehaviorSubject<AccessRule>(null);
  }

  deleteAccessRule(id: number): Observable<AccessRule> {
    return new BehaviorSubject<AccessRule>(null);
  }

  deleteCloudBackup(id: number): Observable<AccessRule> {
    return new BehaviorSubject<AccessRule>(null);
  }

  getCloudBackup(): Observable<CloudBackup> {
    return new BehaviorSubject<CloudBackup>({name:"ahihi",status:"ACTIVE",id:1,customerId:1,createDate:new Date(),expiredDate:new Date(),storage:1});
  }
  getCloudBackupById(id: number): Observable<CloudBackup> {
    return new BehaviorSubject<CloudBackup>({name:"ahihi",status:"ACTIVE",id:1,customerId:1,createDate:new Date(),createdDate:new Date(),expiredDate:new Date(),storage:1});
  }

  getOfferById(id: number): Observable<any> {
    return new BehaviorSubject<any>(null);
  }
}
