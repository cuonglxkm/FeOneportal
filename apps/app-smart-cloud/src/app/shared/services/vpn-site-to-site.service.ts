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
              @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  getVpnSiteToSite(vpcId) {
    return this.http.get<VpnSiteToSiteDTO>(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/byVpc/' + vpcId, { headers: this.getHeaders().headers,observe: 'response'})
  }

  vpnSiteToSite(id): Observable<any> {
    return this.http.get<BaseResponse<VpnSiteToSiteDTO>>(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/' + id, {
      headers: this.getHeaders().headers,
    })
  }

  deteleVpnSiteToSite(id): Observable<any> {
    return this.http.delete<BaseResponse<VpnSiteToSiteDTO>>(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/' + id, {
      headers: this.getHeaders().headers,
    })
  }
}
