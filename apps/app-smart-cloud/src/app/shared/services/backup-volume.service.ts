import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import {
  BackupVolume,
  CreateBackupVolumeOrderData,
  FormUpdateBackupVolume
} from '../../pages/volume/component/backup-volume/backup-volume.model';
import { BaseService } from './base.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
  providedIn: 'root'
})
export class BackupVolumeService extends BaseService {
  receivedData: BehaviorSubject<BackupVolume> = new BehaviorSubject<BackupVolume>(null);
  sharedData$ = this.receivedData.asObservable();

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  };

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  // get all
  getbackupVolumeKeys(projectId: any, regionId: any, page: any, size: any, search: any, status: any): Observable<BaseResponse<BackupVolume[]>> {
    let param = new HttpParams();
    if (search != undefined || search != null) param = param.append('volumeBackupName', search);
    if (status != undefined || status != null) param = param.append('status', status);
    param = param.append('projectId', projectId);
    param = param.append('regionId', regionId);
    param = param.append('pageSize', size);
    param = param.append('currentPage', page);

    return this.http.get<BaseResponse<BackupVolume[]>>(this.baseUrl + this.ENDPOINT.provisions + '/backups/volumes', {
      headers: this.httpOptions.headers,
      params: param
    });
  }

  //getAll
  getListBackupVolume(regionId: number, projectId: number, status: string, volumeBackupName: string, pageSize: number, currentPage: number) {
    let param = new HttpParams();
    if (regionId != undefined || regionId != null) param = param.append('regionId', regionId);
    if (projectId != undefined || projectId != null) param = param.append('projectId', projectId);
    if (status != undefined || status != null) param = param.append('status', status);
    if (volumeBackupName != undefined || volumeBackupName != null) param = param.append('volumeBackupName', volumeBackupName);
    if (pageSize != undefined || pageSize != null) param = param.append('pageSize', pageSize);
    if (currentPage != undefined || currentPage != null) param = param.append('currentPage', currentPage);
    return this.http.get<BaseResponse<BackupVolume[]>>(this.baseUrl + this.ENDPOINT.provisions + '/backups/volumes', {
      params: param
    });
  }

  //delete
  deleteVolume(id: any) {
    return this.http.delete<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + `/backups/volumes/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
    ;
  }

  //restore
  restoreVolume(data: any): Observable<HttpResponse<any>> {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/backups/volumes/restore', data, this.httpOptions);
  }

  //create
  createBackupVolume(data: CreateBackupVolumeOrderData) {
    return this.http.post(this.baseUrl + this.ENDPOINT.orders, Object.assign(data))
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  //detail
  detail(id) {
    return this.http.get<BackupVolume>(this.baseUrl + this.ENDPOINT.provisions + `/backups/volumes/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  //update
  updateBackupVolume(formUpdate: FormUpdateBackupVolume) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + '/backups/volumes', Object.assign(formUpdate))
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }
}
