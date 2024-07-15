import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { BehaviorSubject, throwError } from 'rxjs';
import {
  BackupVolume,
  CreateBackupVolumeOrderData, FormOrderRestoreBackupVolume,
  FormRestoreCurrentBackupVolume, FormRestoreNewBackupVolume,
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
      'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  };

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
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
      params: param,
      headers: this.httpOptions.headers
    }).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }));;
  }

  //delete
  deleteVolume(idBackupVolume) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/backups/volumes/${idBackupVolume}`, {
      headers: this.httpOptions.headers
    })
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

  //create
  createBackupVolume(data: CreateBackupVolumeOrderData) {
    return this.http.post(this.baseUrl + this.ENDPOINT.orders, Object.assign(data), {
      headers: this.httpOptions.headers
    })
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
    return this.http.get<BackupVolume>(this.baseUrl + this.ENDPOINT.provisions + `/backups/volumes/${id}`, {
      headers: this.httpOptions.headers
    })
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
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + '/backups/volumes', Object.assign(formUpdate), {
      headers: this.httpOptions.headers
    })
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

  //restore current
  restoreBackupVolumeCurrent(formRestoreCurrent: FormRestoreCurrentBackupVolume) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/backups/volumes/restore', Object.assign(formRestoreCurrent), {
      headers: this.httpOptions.headers
    })
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

  //restore new
  restoreBackupVolumeNew(formRestoreNew: FormOrderRestoreBackupVolume) {
    return this.http.post(this.baseUrl + this.ENDPOINT.orders, Object.assign(formRestoreNew), {
      headers: this.httpOptions.headers
    })
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
