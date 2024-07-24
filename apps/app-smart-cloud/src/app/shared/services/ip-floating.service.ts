import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FormAction, FormCreateIp, FormSearchIpFloating, IpFloating } from '../models/ip-floating.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { head } from 'lodash';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
  providedIn: 'root',
})

export class IpFloatingService extends BaseService {

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  getListIpFloating(formSearch: FormSearchIpFloating) {
    let params = new HttpParams()
    if(formSearch.projectId != undefined || formSearch.projectId != null) {
      params = params.append('projectId', formSearch.projectId)
    }
    if(formSearch.regionId != undefined || formSearch.regionId != null) {
      params = params.append('regionId', formSearch.regionId)
    }
    if(formSearch.customerId != undefined || formSearch.customerId != null){
      params = params.append('customerId', formSearch.customerId)
    }
    if(formSearch.instanceName != undefined || formSearch.instanceName != null){
      params = params.append('instanceName', formSearch.instanceName)
    }
    if(formSearch.ipAddress != undefined || formSearch.ipAddress != null) {
      params = params.append('ipAddress', formSearch.ipAddress)
    }
    if(formSearch.pageSize != undefined || formSearch.pageSize != null) {
      params = params.append('pageSize', formSearch.pageSize)
    }
    if(formSearch.currentPage != undefined || formSearch.currentPage != null) {
      params = params.append('currentPage', formSearch.currentPage)
    }
    return this.http.get<BaseResponse<IpFloating[]>>(this.baseUrl + this.ENDPOINT.provisions + '/ip-internet-vpc',{
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

  createIp(formCreate: FormCreateIp) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/vpc-wan', Object.assign(formCreate))
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

  deleteIp(id) {
    let params = new HttpParams()
    if(id != undefined || id != null) {
      params = params.append('id', id)
    }
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + '/ip-internet-vpc', {
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


  action(formAction: FormAction) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions+'/ip-internet-vpc', Object.assign(formAction))
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
