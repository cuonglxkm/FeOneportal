import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FormAction, FormCreateIp, FormSearchIpFloating, IpFloating } from '../models/ip-floating.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { head } from 'lodash';
import { FormCreateFileSystemSnapShot, FormSearchFileSystemSnapshot } from '../models/filesystem-snapshot';
import { FormCreateIpsecPolicy, FormDeleteIpsecPolicy, FormEditIpsecPolicy, FormSearchIpsecPolicy, IpsecPolicyDetail } from '../models/ipsec-policy';
import { FormCreateVpnConnection, FormSearchVpnConnection } from '../models/vpn-connection';
@Injectable({
  providedIn: 'root',
})

export class VpnConnectionService extends BaseService {

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

  getVpnConnection(formSearch: FormSearchVpnConnection) {
    let params = new HttpParams()
    if (formSearch.regionId != undefined || formSearch.regionId != null) {
      params = params.append('regionId', formSearch.regionId)
    }
    if (formSearch.searchValue != undefined || formSearch.searchValue != null) {
      params = params.append('searchValue', formSearch.searchValue)
    }
    if (formSearch.projectId != undefined || formSearch.projectId != null) {
      params = params.append('projectId', formSearch.projectId)
    }
    if (formSearch.pageSize != undefined || formSearch.pageSize != null) {
      params = params.append('pageSize', formSearch.pageSize)
    }
    if (formSearch.currentPage != undefined || formSearch.currentPage != null) {
      params = params.append('currentPage', formSearch.currentPage)
    }

    return this.http.get<BaseResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/vpnconnection/paging', {
      headers: this.getHeaders(),
      params: params
    })
  }

  create(formCreate: FormCreateVpnConnection) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/provisions/vpn-sitetosite',
        Object.assign(formCreate), {headers: this.getHeaders()})
  }

  getIpsecPoliciesById(id: number, vpcid: number, region: number){
    return this.http.get<IpsecPolicyDetail>(this.baseUrl + this.ENDPOINT.provisions +
      `/vpn-sitetosite/ipsecpolicy/${id}?vpcId=${vpcid}&regionId=${region}`).pipe(
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
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/vpn-sitetosite/ipsecpolicy/${formDelete.id}?vpcId=${formDelete.vpcId}&regionId=${formDelete.regionId}`).pipe(
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
      Object.assign(formEdit)).pipe(
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
