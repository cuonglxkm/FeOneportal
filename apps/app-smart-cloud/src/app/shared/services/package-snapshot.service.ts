import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  BackupPackageRequestModel,
  BackupPackageResponseModel,
  FormUpdate,
  PackageBackupModel,
  ServiceInPackage
} from '../models/package-backup.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs';
import { FormSearchPackageSnapshot, PackageSnapshotModel } from '../models/package-snapshot.model';
import { FormSearchVpnConnection } from '../models/vpn-connection';

@Injectable({
  providedIn: 'root'
})

export class PackageSnapshotService extends BaseService {
  constructor(public http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  getPackageSnapshot(formSearch: FormSearchPackageSnapshot) {
    let params = new HttpParams()
    if (formSearch.regionId != undefined || formSearch.regionId != null) {
      params = params.append('regionId', formSearch.regionId)
    }
    if (formSearch.packageName != undefined || formSearch.packageName != null) {
      params = params.append('packageName', formSearch.packageName)
    }
    if (formSearch.status != undefined || formSearch.status != null) {
        params = params.append('status', formSearch.status)
      }
    if (formSearch.projectId != undefined || formSearch.projectId != null) {
      params = params.append('projectId', formSearch.projectId)
    }
    if (formSearch.pageSize != undefined || formSearch.pageSize != null) {
      params = params.append('pageSize', formSearch.pageSize)
    }
    if (formSearch.currentPage != undefined || formSearch.currentPage != null) {
      params = params.append('currentPage', formSearch.currentPage)
    }

    return this.http.get<BaseResponse<PackageSnapshotModel[]>>(this.baseUrl + this.ENDPOINT.provisions + '/snapshots/packages', {
      headers: this.getHeaders(),
      params: params
    })
  }

  // update(form: FormUpdatePackage) {
  //   return this.http.put(this.baseUrl + this.ENDPOINT.provisions
  //     + `/backups/packages/${form.id}`,
  //     Object.assign(form),
  //     {headers: this.getHeaders()})
  // }

  detail(id: number) {
    return this.http.get<PackageSnapshotModel>(this.baseUrl + this.ENDPOINT.provisions
      + `/snapshots/packages/${id}`).pipe(
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
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions
      + `/snapshots/packages/${id}`).pipe(
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

  createOrder(request: BackupPackageRequestModel) {
    return this.http.post<BackupPackageResponseModel>(this.baseUrl + this.ENDPOINT.orders,
      Object.assign(request)).pipe(
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

  update(form: FormUpdate) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions
      + `/backups/packages/${form.packageId}`, Object.assign(form)).pipe(
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

  getServiceInPackage(id: number) {
    console.log('url', this.baseUrl + this.ENDPOINT.provisions + '/backups/packages/' +id +'/services')
    return this.http.get<ServiceInPackage>(this.baseUrl + this.ENDPOINT.provisions + `/backups/packages/${id}/services`)
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
