import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import {
  BackupPackage,
  BackupVm,
  BackupVMFormSearch,
  CreateBackupVmOrderData, FormUpdateBackupVm,
  RestoreFormCurrent,
  VolumeAttachment
} from '../models/backup-vm';
import Pagination from "../models/pagination";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {catchError} from "rxjs/internal/operators/catchError";
import { throwError } from 'rxjs';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { BackupSchedule } from '../models/schedule.model';

@Injectable({
    providedIn: 'root'
})

export class BackupVmService extends BaseService {

    constructor(public http: HttpClient,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private notification: NzNotificationService) {
        super();
    }

    private getHeaders() {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
            'Authorization': 'Bearer ' + this.tokenService.get()?.token
        })
    }

    search(form: BackupVMFormSearch) {
        let params = new HttpParams();
        // if (form.customerId != null || form.customerId != undefined) {
        //     params = params.append('customerId', form.customerId);
        // }
        if (form.projectId != null) {
            params = params.append('projectId', form.projectId);
        }
        if (form.regionId != null) {
            params = params.append('regionId', form.regionId);
        }
        if (form.status != null) {
            params = params.append('status', form.status);
        }
        if (form.instanceBackupName != null) {
            params = params.append('instanceBackupName', form.instanceBackupName);
        }
        params = params.append('pageSize', form.pageSize);
        params = params.append('currentPage', form.currentPage);

        return this.http.get<Pagination<BackupVm>>(this.baseUrl + this.ENDPOINT.provisions + '/backups/intances', {
            headers: this.getHeaders(),
            params: params
        }).pipe(
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

    detail(id: number) {
        return this.http.get<BackupVm>(this.baseUrl + this.ENDPOINT.provisions + `/backups/intances/${id}`, {
            headers: this.getHeaders()
        }).pipe(
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

    delete(id: number) {
        return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/backups/intances/${id}`, {
            headers: this.getHeaders()
        }).pipe(
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

    restoreCurrentBackupVm(form: RestoreFormCurrent) {
        return this.http.post(this.baseUrl + this.ENDPOINT.provisions + `/backups/intances/restore`, form, {
            headers: this.getHeaders()
        });
    }

    getVolumeInstanceAttachment(id: number) {
        return this.http.get<VolumeAttachment[]>(this.baseUrl + this.ENDPOINT.provisions
          + `/instances/${id}/instance-attachments?includeVolumeRoot=false`,
          {headers: this.getHeaders()}).pipe(
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

    getBackupPackages() {
        return this.http.get<BaseResponse<BackupPackage[]>>(this.baseUrl + this.ENDPOINT.provisions + `/backups/packages`, {headers: this.getHeaders()})
          .pipe(catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              console.error('login');
            } else if (error.status === 404) {
              // Handle 404 Not Found error
              console.error('Resource not found');
            }
            return throwError(error);
          }))
    }

    create(data: CreateBackupVmOrderData) {
        return this.http.post<BackupVm>(this.baseUrl + this.ENDPOINT.orders, Object.assign(data), {
          headers: this.getHeaders()
        })
          .pipe(catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              console.error('login');
            } else if (error.status === 404) {
              // Handle 404 Not Found error
              console.error('Resource not found');
            }
            return throwError(error);
          }))
    }

    update(formUpdate: FormUpdateBackupVm) {
      return this.http.put(this.baseUrl + this.ENDPOINT.provisions + '/backups/intances', Object.assign(formUpdate), {
        headers: this.getHeaders()
      })
        .pipe(catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('login');
          } else if (error.status === 404) {
            // Handle 404 Not Found error
            console.error('Resource not found');
          }
          return throwError(error);
        }))
    }
}
