import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Observable } from 'rxjs';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { IpPublicModel } from '../models/ip-public.model';

@Injectable({
  providedIn: 'root'
})

export class ListenerService extends BaseService{
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json' ,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token,
      'user_root_id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
    })
  };

  listenerUrl = '/loadbalancer/listener';

  poolUrl = '/loadbalancer/pool';

  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  getData( ipAddress: any, status: any, customerId: any, projectId: any, regionId: any, isCheckState: any, pageSize: any, currentPage: any): Observable<BaseResponse<IpPublicModel[]>> {
    return this.http.get<BaseResponse<IpPublicModel[]>>(this.baseUrl + this.ENDPOINT.provisions + '/Ip?ipAddress=' + ipAddress + '&serviceStatus=' + status+ '&customerId=' + customerId+
      '&regionId=' + regionId+ '&isCheckState=' + isCheckState+ '&pageSize=' + pageSize+ '&currentPage=' + currentPage+ '&projectId=' + projectId);
  }

  getTest() : Observable<BaseResponse<IpPublicModel[]>> {
    return this.http.get<BaseResponse<IpPublicModel[]>>("/ip");
  }
  createIpPublic(IP: any): Observable<any>  {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.orders, IP, this.httpOptions);
  }


  createListener(data: any): Observable<any> {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + this.listenerUrl, data, this.httpOptions);
  }

  createPool(data: any): Observable<any> {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + this.poolUrl, data, this.httpOptions);
  }

  createHealth(data: any) {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/loadbalancer/createHealth', data, this.httpOptions);
  }

  getDetail(id: string, lbId: string) {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + this.listenerUrl + '?listenerId=' + id + '&lbId=' + lbId);
  }

  updateListener(data: any) {
    return this.http.put<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + this.listenerUrl, data, this.httpOptions);
  }

  getPool(id: string, region: any) {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + '/loadbalancer/pool/listpool' + '?listenerId=' + id + '&regionId=' + region + '&pageSize=99999&currentPage=1');
  }

  getL7Policy(id: string, regionId: any, projectId: any) {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + '/loadbalancer/l7policy' + '?listenerId=' + id + '&regionId=' + regionId + '&vpcId='+projectId);
  }
}
