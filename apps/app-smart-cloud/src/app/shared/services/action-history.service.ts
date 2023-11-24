import { Injectable } from '@angular/core';
import {BaseService} from "./base.service";
import {BehaviorSubject, Observable} from "rxjs";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { ActionHistoryModel } from '../models/action-history.model';

@Injectable({
  providedIn: 'root'
})
export class ActionHistoryService extends BaseService{

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient) {
    super();
  }

  getData( email: any, action: any, resourceName: any, resourceType: any, regionId: any, fromDate : any, toDate : any, pageSize: any, currentPage: any): Observable<BaseResponse<ActionHistoryModel[]>> {
    return this.http.get<BaseResponse<ActionHistoryModel[]>>(this.baseUrl + '/actionlogs?email=' + email+ '&action=' + action+ '&resourceName=' + resourceName+ '&resourceType=' + resourceType+
      '&regionId=' + regionId+ '&fromDate=' + fromDate+ '&toDate=' + toDate+ '&pageSize=' + pageSize+ '&currentPage=' + currentPage);
  }

  getActionLogs() : Observable<BaseResponse<ActionHistoryModel[]>> {
    return this.http.get<BaseResponse<ActionHistoryModel[]>>("/actionlogs");
  }
}
