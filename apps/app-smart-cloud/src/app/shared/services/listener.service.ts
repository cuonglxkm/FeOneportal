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

  listenerUrl = '/loadbalancer/listener';

  poolUrl = '/loadbalancer/pool';

  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  getData( ipAddress: any, status: any, customerId: any, projectId: any, regionId: any, isCheckState: any, pageSize: any, currentPage: any): Observable<BaseResponse<IpPublicModel[]>> {
    return this.http.get<BaseResponse<IpPublicModel[]>>(this.baseUrl + this.ENDPOINT.provisions + '/Ip?ipAddress=' + ipAddress + '&serviceStatus=' + status+ '&customerId=' + customerId+
      '&regionId=' + regionId+ '&isCheckState=' + isCheckState+ '&pageSize=' + pageSize+ '&currentPage=' + currentPage+ '&projectId=' + projectId);
  }

  getTest() : Observable<BaseResponse<IpPublicModel[]>> {
    return this.http.get<BaseResponse<IpPublicModel[]>>("/ip");
  }
  createIpPublic(IP: any): Observable<any>  {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.orders, IP, this.getHeaders());
  }


  createListener(data: any): Observable<any> {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + "/loadbalancer/CreateListenerPoolHealthyMember", data, this.getHeaders());
  }

  createPool(data: any): Observable<any> {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + this.poolUrl, data, this.getHeaders());
  }

  createHealth(data: any) {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/loadbalancer/createHealth', data, this.getHeaders());
  }

  getDetail(id: string, lbId: string) {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + this.listenerUrl + '?listenerId=' + id + '&lbId=' + lbId);
  }

  updateListener(data: any) {
    return this.http.put<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + this.listenerUrl, data, this.getHeaders());
  }

  getPool(id: string, region: any, vpcId: number) {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/pool/listpool?regionId=${region}&vpcId=${vpcId}&listenerId=${id}&pageSize=9999&currentPage=1`);
  }

  getL7Policy(id: string, regionId: any, projectId: any) {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + '/loadbalancer/l7policy' + '?listenerId=' + id + '&regionId=' + regionId + '&vpcId='+projectId);
  }

  deleteListner(listenerId: any, idLB: any) {
    return this.http.delete<any>(this.baseUrl + this.ENDPOINT.provisions + "/loadbalancer/listener/" + listenerId + "?lbId=" + idLB);
  }

  loadSSlCert(userId: any, regionId: any, projectId) {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + '/loadbalancer/ssl' + '?customerId=' + userId + '&region=' + regionId +
      '&vpcId='+projectId+'&currentPage=1&pageSize=9999999');
  }

  validatePoolName(lbCloudId: any, regionId: any, projectId: any, name: any): Observable<any> {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/checkpoolname?lbCloudId=${lbCloudId}
    &regionId=${regionId}&projectId=${projectId}&name=${name}`, null, this.getHeaders());
  }
}
