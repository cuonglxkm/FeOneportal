import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { FormCreateIpsecPolicy, FormDeleteIpsecPolicy, FormEditIpsecPolicy, FormSearchIpsecPolicy, IpsecPolicyDetail } from '../models/ipsec-policy';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root',
})

export class IpsecPolicyService extends BaseService {

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  getIpsecpolicy(formSearch: FormSearchIpsecPolicy) {
    let params = new HttpParams()
    if (formSearch.regionId != undefined || formSearch.regionId != null) {
      params = params.append('regionId', formSearch.regionId)
    }
    if (formSearch.name != undefined || formSearch.name != null) {
      params = params.append('name', formSearch.name)
    }
    if (formSearch.vpcId != undefined || formSearch.vpcId != null) {
      params = params.append('vpcId', formSearch.vpcId)
    }
    if (formSearch.pageSize != undefined || formSearch.pageSize != null) {
      params = params.append('pageSize', formSearch.pageSize)
    }
    if (formSearch.currentPage != undefined || formSearch.currentPage != null) {
      params = params.append('currentPage', formSearch.currentPage)
    }

    return this.http.get<BaseResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/ipsecpolicy/paging', {
      headers: this.getHeaders(),
      params: params
    })
  }

  create(formCreate: FormCreateIpsecPolicy) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/ipsecpolicy',
        Object.assign(formCreate), {headers: this.getHeaders()})
  }

  getIpsecPoliciesById(id: number, vpcid: number, region: number){
    return this.http.get<IpsecPolicyDetail>(this.baseUrl + this.ENDPOINT.provisions +
      `/vpn-sitetosite/ipsecpolicy/${id}?vpcId=${vpcid}&regionId=${region}`, {headers: this.getHeaders()}).pipe(
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

  deleteIpsecPolicy(formDelete: FormDeleteIpsecPolicy) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/vpn-sitetosite/ipsecpolicy/${formDelete.id}?vpcId=${formDelete.vpcId}&regionId=${formDelete.regionId}`, {headers: this.getHeaders()}).pipe(
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

  edit(id: string, formEdit: FormEditIpsecPolicy) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/vpn-sitetosite/ipsecpolicy/${id}`,
      Object.assign(formEdit), {headers: this.getHeaders()}).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }


}
