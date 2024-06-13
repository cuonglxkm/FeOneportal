import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { PaymentCostUse, SubscriptionsDashboard, SubscriptionsNearExpire } from '../models/dashboard.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  };

  constructor(private http: HttpClient,
              private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  getSubscriptionsDashboard() {
    return this.http.get<SubscriptionsDashboard>(this.baseUrl + this.ENDPOINT.subscriptions + '/dashboard', {
      headers: this.httpOptions.headers
    })
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  getSubscriptionsNearExpire(pageSize: number, pageIndex: number) {
    return this.http.get<BaseResponse<SubscriptionsNearExpire[]>>(this.baseUrl + this.ENDPOINT.subscriptions + `/near-expire?pageSize=${pageSize}&currentPage=${pageIndex}`, {
      headers: this.httpOptions.headers
    })
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  paymentCostUse(pageSize: number, pageIndex: number) {
    return this.http.get<BaseResponse<PaymentCostUse[]>>(this.baseUrl + this.ENDPOINT.payments + `/cost-use?pageSize=${pageSize}&pageNumber=${pageIndex}`, {
      headers: this.httpOptions.headers
    })
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }));
  }

  getHeader() {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.subscriptions + `/header`, { headers: this.httpOptions.headers} )
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
    }));
  }
}
