import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { FormCreateVpnService, FormDeleteVpnService, FormEditVpnService, FormSearchVpnService, VPNServiceDetail } from '../models/vpn-service';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root',
})

export class VpnServiceService extends BaseService {

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

  getVpnService(formSearch: FormSearchVpnService) {
    let params = new HttpParams()
    if (formSearch.regionId != undefined || formSearch.regionId != null) {
      params = params.append('regionId', formSearch.regionId)
    }
    if (formSearch.name != undefined || formSearch.name != null) {
      params = params.append('name', formSearch.name)
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

    return this.http.get<BaseResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/vpnservice/paging', {
      headers: this.getHeaders(),
      params: params
    })
  }

  getVpnServiceById(id: number, vpcid: number, region: number){
    return this.http.get<VPNServiceDetail>(this.baseUrl + this.ENDPOINT.provisions +
      `/vpn-sitetosite/vpnservice/${id}?projectId=${vpcid}&regionId=${region}`).pipe(
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

  create(formCreate: FormCreateVpnService) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/vpnservice/create',
        Object.assign(formCreate), {headers: this.getHeaders()})
  }

  deleteVpnService(id: any, formDelete: FormDeleteVpnService) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/vpn-sitetosite/vpnservice/${id}`, 
    {body: formDelete, headers: this.getHeaders()}
    ).pipe(
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

  edit(formEdit: FormEditVpnService) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/vpnservice/update',
        Object.assign(formEdit), {headers: this.getHeaders()})
  }
}
