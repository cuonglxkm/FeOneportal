import {Inject, Injectable} from '@angular/core';
import {environment} from "@env/environment";
import {HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {throwError} from "rxjs";
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';


export abstract class BaseService {

  ENDPOINT = {
    provisions: '/provisions',
    configurations: '/configurations',
    orders: '/orders',
    subscriptions: '/subscriptions',
    users: '/users',
    catalogs: '/catalogs',
    actionlogs: '/actionlogs',
    iam: '/iam',
    payments: '/payments'
  }
  public baseUrl: string;

  public constructor(@Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    this.baseUrl = environment.baseUrl;
  }

  protected errorCode(error: HttpErrorResponse) {
    if (error.status === 401) {
      // Handle 401 Unauthorized error
      console.error('Unauthorized:', error.message);
    } else if (error.status === 404) {
      // Handle 404 Not Found error
      console.error('Not Found:', error.message);
    } else if (error.status === 500) {
      // Handle 500 Internal Server Error
      console.error('Internal Server Error:', error.message);
    } else if (error.status === 400) {
      // Handle 400 Bad Request error
      console.error('Bad Request:', error.message);
    } else {
      // Handle other errors
      console.error('An unexpected error occurred:', error.message);
    }
    // Return an observable with a user-friendly error message
    return throwError(() => new Error('Đã có lỗi xảy ra, vui lòng thử lại sau!'));
  }

  public getHeaders() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.tokenService.get()?.token,
        'User-Root-Id':
          localStorage.getItem('UserRootId') &&
          Number(localStorage.getItem('UserRootId')) > 0
            ? Number(localStorage.getItem('UserRootId'))
            : this.tokenService.get()?.userId,
        'Project-Id': localStorage.getItem('projectId') && Number(localStorage.getItem('projectId')) > 0 ? Number(localStorage.getItem('projectId')) : 0,
        'RegionId': localStorage.getItem('regionId') && Number(localStorage.getItem('regionId')) > 0 ? Number(localStorage.getItem('regionId')) : 0,
      }),
    };
  }
}
