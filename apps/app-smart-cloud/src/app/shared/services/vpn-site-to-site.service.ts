import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { VpnSiteToSiteDTO } from '../models/vpn-site-to-site';
import { BaseService } from './base.service';
@Injectable({
  providedIn: 'root',
})

export class VpnSiteToSiteService extends BaseService {

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Project-Id': localStorage.getItem('projectId') && Number(localStorage.getItem('projectId')) > 0 ? Number(localStorage.getItem('projectId')) : 0,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  getVpnSiteToSite(vpcId) {
    return this.http.get<VpnSiteToSiteDTO>(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/byVpc/' + vpcId, { headers: this.getHeaders(),observe: 'response'})
  }

  vpnSiteToSite(id): Observable<any> {
    return this.http.get<BaseResponse<VpnSiteToSiteDTO>>(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/' + id, {
      headers: this.getHeaders(),
    })
  }

  deteleVpnSiteToSite(id): Observable<any> {
    return this.http.delete<BaseResponse<VpnSiteToSiteDTO>>(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/' + id, {
      headers: this.getHeaders(),
    })
  }
}
