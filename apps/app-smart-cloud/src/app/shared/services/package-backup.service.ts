import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root'
})

export class PackageBackupService extends BaseService {
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

  search(packageName: string, status: string, pageSize: number, currentPage: number) {
    if (packageName == undefined) {
      packageName = ''
    }
    if(status == undefined || status == 'ALL') {
      status = ''
    }
    if(pageSize == undefined) {
      pageSize = 9999
    }
    if(currentPage == undefined) {
      currentPage = 1
    }
    return this.http.get<BaseResponse<PackageBackupModel[]>>(this.baseUrl + this.ENDPOINT.provisions
      + `/backups/packages?packageName=${packageName}&status=${status}&pageSize=${pageSize}&currentPage=${currentPage}`,
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

  // update(form: FormUpdatePackage) {
  //   return this.http.put(this.baseUrl + this.ENDPOINT.provisions
  //     + `/backups/packages/${form.id}`,
  //     Object.assign(form),
  //     {headers: this.getHeaders()})
  // }

  detail(id: number) {
    return this.http.get<PackageBackupModel>(this.baseUrl + this.ENDPOINT.provisions
      + `/backups/packages/${id}`,
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

  delete(id: number) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions
      + `/backups/packages/${id}`, {headers: this.getHeaders()}).pipe(
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
      Object.assign(request), {headers: this.getHeaders()}).pipe(
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
      + `/backups/packages/${form.packageId}`, Object.assign(form),
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

  getServiceInPackage(id: number) {
    console.log('url', this.baseUrl + this.ENDPOINT.provisions + '/backups/packages/' +id +'/services')
    return this.http.get<ServiceInPackage>(this.baseUrl + this.ENDPOINT.provisions + `/backups/packages/${id}/services`,
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

}
