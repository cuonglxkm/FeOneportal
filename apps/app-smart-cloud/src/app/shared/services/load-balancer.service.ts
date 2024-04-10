import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, throwError } from 'rxjs';
import { FormCreate, FormSearchListBalancer, LoadBalancerModel } from '../models/load-balancer.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoadBalancerService extends BaseService{
  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");
  constructor(private http: HttpClient,
              private router: Router) {
    super();
  }

  search(formSearch: FormSearchListBalancer) {
    let params = new HttpParams()
    if(formSearch.vpcId != undefined || formSearch.vpcId != null) {
      params = params.append('vpcId', formSearch.vpcId)
    }
    if(formSearch.regionId != undefined || formSearch.regionId != null) {
      params = params.append('regionId', formSearch.regionId)
    }
    if(formSearch.name != undefined || formSearch.name != null) {
      params = params.append('name', formSearch.name)
    }
    if(formSearch.pageSize != undefined || formSearch.pageSize != null) {
      params = params.append('pageSize', formSearch.pageSize)
    }
    if(formSearch.currentPage != undefined || formSearch.currentPage != null) {
      params = params.append('currentPage', formSearch.currentPage)
    }
    formSearch.isCheckState = true;
    params = params.append('isCheckState', formSearch.isCheckState)

    return this.http.get<BaseResponse<LoadBalancerModel[]>>(this.baseUrl + this.ENDPOINT.provisions + '/loadbalancer/list-paging', {
      params: params
    }).pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  totalAmount(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.orders + '/totalamount', data).pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
          // Redirect to login page or show unauthorized message
          this.router.navigate(['/passport/login']);
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      })
    );
  }

  createLoadBalancerVpc(formCreate: FormCreate) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.orders, formCreate)
  }
}
