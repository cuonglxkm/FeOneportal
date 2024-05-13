import { Injectable } from '@angular/core';
import { BaseService } from "./base.service";
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class OperationHistoryService extends BaseService {

    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };


    constructor(private http: HttpClient) {
        super();
    }

    getData(ipAddress: string, status: number, customerId: number, regionId: number, pageSize: any, currentPage: any, isCheckState: boolean): Observable<any> {
        return this.http.get<any>(this.baseUrl + '/provisions/Ip?ipAddress=' + ipAddress + '&status=' + status + '&customerId=' + customerId + '&regionId=' + regionId +
            '&pageSize=' + pageSize + '&currentPage=' + currentPage + '&isCheckState=' + isCheckState);
    }


}
