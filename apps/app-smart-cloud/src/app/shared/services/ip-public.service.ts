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

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  getData( ipAddress: any, status: any, customerId: any, projectId: any, regionId: any, isCheckState: any, pageSize: any, currentPage: any): Observable<BaseResponse<IpPublicModel[]>> {
    return this.http.get<BaseResponse<IpPublicModel[]>>(this.baseUrl + this.ENDPOINT.provisions + '/Ip?ipAddress=' + ipAddress + '&serviceStatus=' + status+ '&customerId=' + customerId+
      '&regionId=' + regionId+ '&isCheckState=' + isCheckState+ '&pageSize=' + pageSize+ '&currentPage=' + currentPage+ '&projectId=' + projectId, this.getHeaders());
  }

  getTest() : Observable<BaseResponse<IpPublicModel[]>> {
    return this.http.get<BaseResponse<IpPublicModel[]>>("/ip", this.getHeaders());
  }
  createIpPublic(IP: any): Observable<any>  {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.orders, IP, this.getHeaders());
  }

  extendIpPublic(IP: any): Observable<any>  {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.orders, IP, this.getHeaders());
  }
  remove(id: any) :Observable<HttpResponse<any>>  {
    return this.http.delete<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + "/Ip?id="+ id, this.getHeaders());
  }

  attachIpPublic(IP: any): Observable<HttpResponse<any>>  {
    return this.http.put<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + "/Ip", IP, this.getHeaders());
  }

  getDetailIpPublic(id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + '/Ip/'+id, this.getHeaders());
  }

  getTotalAmount(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.orders + '/totalamount',
      data, this.getHeaders()
    );
  }
  getStepBlock(name:string): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.configurations + '?name=' +name, this.getHeaders());
  }

  ValidateIpByNetwork(regionId: number, networkId: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + '/Ip/validate-by-network/' + regionId + "?networkId=" + networkId, this.getHeaders());
  }
}
