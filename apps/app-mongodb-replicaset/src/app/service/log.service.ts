import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { BaseService } from '../shared/services/base.service';

@Injectable({ providedIn: 'root' })
export class LoggingService extends BaseService{
  constructor(private http: HttpClient) {
    super();
  }

  // override baseUrl = 'http://localhost:16008/mongodb-replicaset-service';
  //   override baseUrl = 'http://localhost:16008';


  prefix_url = "mongodb-replicaset-service"
  searchLogs(
    username: string,
    resource: string,
    action: string,
    startDate: number,
    endDate: number,
    serviceCode: string,
    pageIndex: number,
    pageSize: number,
   
  ) {
    return this.http
      .get(
        `${this.baseUrl}/${this.prefix_url}/log/search?username=${username || ''}&action=${
          action || ''
        }&resource=${resource || ''}&start_date=${startDate || ''}&end_date=${
          endDate || ''
        }&service_order_code=` + `${serviceCode}&page=${pageIndex || ''}&size=${pageSize || ''}`


        // `${this.baseUrl}/log/search?username=${username || ''}&action=${
        //   action || ''
        // }&resource=${resource || ''}&start_date=${startDate || ''}&end_date=${
        //   endDate || ''
        // }&service_order_code=${{serviceOrderCode} || ''}&page=${pageIndex || ''}&size=${pageSize || ''}`
      )
      .pipe(
        filter((r: any) => r && r.code == 200),
        map((r) => r.data),
        catchError((response) => {
          return EMPTY;
        })
      );
  }
}
