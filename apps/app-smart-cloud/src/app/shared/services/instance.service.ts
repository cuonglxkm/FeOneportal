import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import Pagination from "../models/pagination";
import {Instance, InstanceFormSearch} from "src/app/pages/instances/instances.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Injectable({
    providedIn: 'root'
})
export class InstanceService extends BaseService {

    constructor(private http: HttpClient,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
        super();
    }

    private getHeaders() {
        return new HttpHeaders({
            'Content-Type': 'application/json',
          'user_root_id': this.tokenService.get()?.userId,
          'Authorization': 'Bearer ' + this.tokenService.get()?.token
        })
    }

    search(form: InstanceFormSearch): Observable<Pagination<Instance>> {
        let params = new HttpParams();
        if (form.searchValue !== undefined) {
            params = params.append('searchValue', form.searchValue)
        }
        if (form.status !== undefined) {
            params = params.append('status', form.status)
        }
        params = params.append('isCheckState', true)
        if (form.fromDate !== undefined) {
            params = params.append('formDate', form.fromDate)
        }
        if (form.toDate !== undefined) {
            params = params.append('toDate', form.toDate)
        }
        if(form.securityGroupId !== undefined) {
            params = params.append('id', form.searchValue)
        }
        params = params.append('region', form.region)
        params = params.append('userId', form.userId)
        params = params.append('pageSize', form.pageSize)
        params = params.append('pageNumber', form.pageNumber)

        return this.http.get<Pagination<Instance>>(this.baseUrl + this.ENDPOINT.provisions + '/instances/getpaging', {
            headers: this.getHeaders(),
            params: params
        })
    }

    searchBySecurityGroupId(form: InstanceFormSearch) {
        let params = new HttpParams();
        if(form.securityGroupId !== undefined) {
            params = params.append('id', form.securityGroupId)
        }
        params = params.append('regionId', form.region)
        params = params.append('userId', form.userId)
        params = params.append('projectId', form.projectId)
        params = params.append('pageSize', form.pageSize)
        params = params.append('pageNumber', form.pageNumber)
        return this.http.get<Pagination<Instance>>(this.baseUrl + this.ENDPOINT.provisions + '/security_group/getinstace', {
            headers: this.getHeaders(),
            params: params
        })
    }


}
