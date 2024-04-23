import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { PaymentCostUse, SubscriptionsDashboard, SubscriptionsNearExpire } from '../models/dashboard.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseService {
  constructor(private http: HttpClient,
              private router: Router) {
    super();
  }

  getSubscriptionsDashboard() {
    return this.http.get<SubscriptionsDashboard>(this.baseUrl + this.ENDPOINT.subscriptions + '/dashboard')
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
    return this.http.get<BaseResponse<SubscriptionsNearExpire[]>>(this.baseUrl + this.ENDPOINT.subscriptions + `/near-expire?pageSize=${pageSize}&currentPage=${pageIndex}`)
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
    return this.http.get<BaseResponse<PaymentCostUse[]>>(this.baseUrl + this.ENDPOINT.payments + `/cost-use?pageSize=${pageSize}&pageNumber=${pageIndex}`)
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
