import {Inject, Injectable} from '@angular/core';
import {BaseService} from "./base.service";
import {BehaviorSubject, Observable} from "rxjs";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";
import {IpPublicModel} from "../models/ip-public.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Injectable({
  providedIn: 'root'
})
export class IpPublicService extends BaseService{

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json' ,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token,
      'user_root_id': this.tokenService.get()?.userId,
    })
  };

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  getData( ipAddress: any, status: any, customerId: any, regionId: any, isCheckState: any, pageSize: any, currentPage: any): Observable<BaseResponse<IpPublicModel[]>> {
    return this.http.get<BaseResponse<IpPublicModel[]>>(this.baseUrl + this.ENDPOINT.provisions + '/Ip?ipAddress=' + ipAddress + '&status=' + status+ '&customerId=' + customerId+
      '&regionId=' + regionId+ '&isCheckState=' + isCheckState+ '&pageSize=' + pageSize+ '&currentPage=' + currentPage);
  }

  getTest() : Observable<BaseResponse<IpPublicModel[]>> {
    return this.http.get<BaseResponse<IpPublicModel[]>>("/ip");
  }
  createIpPublic(IP: any): Observable<HttpResponse<any>>  {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.orders, IP, this.httpOptions);
  }

  remove(id: any) :Observable<HttpResponse<any>>  {
    return this.http.delete<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + "/Ip?id="+ id);
  }

  attachIpPublic(IP: any): Observable<HttpResponse<any>>  {
    return this.http.put<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + "/Ip", IP, this.httpOptions);
  }

  getDetailIpPublic(id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + '/Ip/'+id);
  }
}
