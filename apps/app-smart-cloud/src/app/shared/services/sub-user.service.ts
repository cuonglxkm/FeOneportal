import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { FormCreateSubUser, FormDeleteSubUser, FormUpdateSubUser, SubUser } from '../models/sub-user.model';
import { catchError, throwError } from 'rxjs';
import { BaseResponse } from '../../../../../../libs/common-utils/src';

@Injectable({
  providedIn: 'root'
})

export class SubUserService extends BaseService {

  constructor(public http: HttpClient) {
    super();
  }

  getListSubUser(pageSize: number, currentPage: number) {
    let params = new HttpParams()
    params = params.append('pageSize', pageSize)
    params = params.append('currentPage', currentPage)
    return this.http.get<BaseResponse<SubUser[]>>(this.baseUrl + this.ENDPOINT.provisions + `/object-storage/subuser`, {
      params: params
    }).pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          // this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  updateSubUser(formUpdate: FormUpdateSubUser) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/subuser', Object.assign(formUpdate))
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          // this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  deleteSubUser(formDelete: FormDeleteSubUser) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/subuser', {
      body: Object.assign(formDelete)
    }).pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          // this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  createSubUser(formCreate: FormCreateSubUser) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/subuser',
      Object.assign(formCreate)).pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          // this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }


}
