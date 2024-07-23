import { Inject, Injectable } from '@angular/core';
import { BaseService } from "./base.service";
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({
    providedIn: 'root'
})
export class OperationHistoryService extends BaseService {

    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };


    constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
        super(tokenService);
    }

    getData(ipAddress: string, status: number, customerId: number, regionId: number, pageSize: any, currentPage: any, isCheckState: boolean): Observable<any> {
        return this.http.get<any>(this.baseUrl + '/provisions/Ip?ipAddress=' + ipAddress + '&status=' + status + '&customerId=' + customerId + '&regionId=' + regionId +
            '&pageSize=' + pageSize + '&currentPage=' + currentPage + '&isCheckState=' + isCheckState);
    }


}
