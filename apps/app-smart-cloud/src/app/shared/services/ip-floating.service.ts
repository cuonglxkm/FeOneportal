import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FormSearchIpFloating, IpFloating } from '../models/ip-floating.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';

@Injectable({
  providedIn: 'root',
})

export class IpFloatingService extends BaseService {

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
      headers: this.getHeaders(),
      params: params
    })
  }


}
