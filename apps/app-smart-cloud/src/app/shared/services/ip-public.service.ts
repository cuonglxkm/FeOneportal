import { Injectable } from '@angular/core';
import {BaseService} from "./base.service";
import {BehaviorSubject, Observable} from "rxjs";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {SshKey} from "../../pages/ssh-key/dto/ssh-key";
import {catchError} from "rxjs/operators";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {IpPublicModel} from "../models/ip-public.model";

@Injectable({
  providedIn: 'root'
})
export class IpPublicService extends BaseService{

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient) {
    super();
  }

  getData( ipAddress: any, status: any, customerId: any, regionId: any, isCheckState: any, pageSize: any, currentPage: any): Observable<BaseResponse<IpPublicModel[]>> {
    return this.http.get<BaseResponse<IpPublicModel[]>>(this.baseUrl + '/Ip?ipAddress=' + ipAddress + '&status=' + status+ '&customerId=' + customerId+
      '&regionId=' + regionId+ '&isCheckState=' + isCheckState+ '&pageSize=' + pageSize+ '&currentPage=' + currentPage);
  }

  getTest() : Observable<BaseResponse<IpPublicModel[]>> {
    return this.http.get<BaseResponse<IpPublicModel[]>>("/ip");
  }
}
