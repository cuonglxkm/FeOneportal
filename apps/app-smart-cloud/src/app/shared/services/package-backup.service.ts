import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  BackupPackageRequestModel,
  BackupPackageResponseModel,
  FormUpdate, OrderItemTotalAmount,
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
              @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService,
              private notification: NzNotificationService) {
    super(tokenService);
  }

  search(packageName: string, status: string, project: number, region: number, pageSize: number, currentPage: number) {
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
      + `/backups/packages?packageName=${packageName}&status=${status}&regionId=${region}&projectId=${project}&pageSize=${pageSize}&currentPage=${currentPage}`, {
      headers: this.getHeaders().headers
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

  // update(form: FormUpdatePackage) {
  //   return this.http.put(this.baseUrl + this.ENDPOINT.provisions
  //     + `/backups/packages/${form.id}`,
  //     Object.assign(form),
  //     {headers: this.getHeaders()})
  // }

  detail(id: number, projectId: number) {
    return this.http.get<PackageBackupModel>(this.baseUrl + this.ENDPOINT.provisions
      + `/backups/packages/${id}?projectId=${projectId}`, {headers: this.getHeaders().headers}).pipe(
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

  delete(id: number, regionId: number, projectId: number) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions
      + `/backups/packages/${id}?regionId=${regionId}&projectId=${projectId}`, {headers: this.getHeaders().headers}).pipe(
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
      Object.assign(request), {headers: this.getHeaders().headers}).pipe(
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
      + `/backups/packages/${form.packageId}`, Object.assign(form), {headers: this.getHeaders().headers}).pipe(
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
    return this.http.get<ServiceInPackage>(this.baseUrl + this.ENDPOINT.provisions + `/backups/packages/${id}/services`, {headers: this.getHeaders().headers})
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

  getTotalAmount(orderItem: OrderItemTotalAmount) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.orders + '/totalamount', Object.assign(orderItem),{headers: this.getHeaders().headers})
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
