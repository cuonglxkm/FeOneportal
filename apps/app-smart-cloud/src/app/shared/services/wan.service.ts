import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BehaviorSubject, throwError } from 'rxjs';
import { FormAction, FormCreate, FormSearch, WanIP } from '../models/wan.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
  providedIn: 'root',
})

export class WanService extends BaseService {
  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  search(formSearch: FormSearch) {
    let params = new HttpParams()
    if(formSearch.customerId != undefined || formSearch.customerId != null) {
      params = params.append('customerId', formSearch.customerId)
    }
    if(formSearch.childChannels != undefined || formSearch.childChannels != null) {
      params = params.append('childChannels', formSearch.childChannels)
    }
    if(formSearch.regionId != undefined || formSearch.regionId != null) {
      params = params.append('regionId', formSearch.regionId)
    }
    if(formSearch.customerId != undefined || formSearch.customerId != null) {
      params = params.append('customerId', formSearch.customerId)
    }
    if(formSearch.ipAddress != undefined || formSearch.ipAddress != null) {
      params = params.append('ipAddress', formSearch.ipAddress)
    }
    if(formSearch.instanceName != undefined || formSearch.instanceName != null) {
      params = params.append('instanceName', formSearch.instanceName)
    }
    if(formSearch.netName != undefined || formSearch.netName != null) {
      params = params.append('netName', formSearch.netName)
    }
    if(formSearch.pageSize != undefined || formSearch.pageSize != null) {
      params = params.append('pageSize', formSearch.pageSize)
    }
    if(formSearch.currentPage != undefined || formSearch.currentPage != null) {
      params = params.append('currentPage', formSearch.currentPage)
    }

    return this.http.get<BaseResponse<WanIP[]>>(this.baseUrl + this.ENDPOINT.provisions + '/vpc-wan/ips', {
      headers: this.getHeaders(),
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

  create(formCreate: FormCreate) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/vpc-wan', Object.assign(formCreate), {
      headers: this.getHeaders()
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
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + '/vpc-wan', Object.assign(formAction), {
      headers: this.getHeaders()
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

  delete(id) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/vpc-wan?id=${id}`, {
      headers: this.getHeaders()
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

}
