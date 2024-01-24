import {Injectable} from '@angular/core';
import {environment} from "@env/environment";
import {HttpErrorResponse} from "@angular/common/http";
import {throwError} from "rxjs";


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
  protected baseUrl: string;

  protected constructor() {
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
}
