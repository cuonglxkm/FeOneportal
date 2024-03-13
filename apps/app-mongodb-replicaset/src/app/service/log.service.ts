import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LoggingService {
  constructor(private http: HttpClient) {}

  private baseUrl = 'http://localhost:15015/mongodb-replicaset-service';
  searchLogs(
    username: string,
    resource: string,
    action: string,
    fromDate: number,
    toDate: number,
    serviceOrderCode: string,
    pageIndex: number,
    pageSize: number
  ) {
    return this.http
      .get(
        `${this.baseUrl}/log/search?username=${username || ''}&action=${
          action || ''
        }&resource=${resource || ''}&from_date=${fromDate || ''}&to_date=${
          toDate || ''
        }&service_order_code=${serviceOrderCode}&page=${pageIndex}&size=${pageSize}`
      )
      .pipe(
        filter((r: any) => r && r.code == 200),
        map((r) => r.data),
        catchError((response) => {
          console.error('fail to search log service: ', response);
          return EMPTY;
        })
      );
  }
}
