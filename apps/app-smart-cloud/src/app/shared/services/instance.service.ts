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
          'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Project-Id': localStorage.getItem('projectId') && Number(localStorage.getItem('projectId')) > 0 ? Number(localStorage.getItem('projectId')) : 0,
          'Authorization': 'Bearer ' + this.tokenService.get()?.token
        })
    }

  search(
    pageNumber: number,
    pageSize: number,
    region: number,
    projectId: number,
    searchValue: string = '',
    status: string = '',
    isCheckState: boolean,
    userId: number
  ): Observable<any> {
    if (searchValue == undefined) searchValue = '';
    let url_ = `/instances/getpaging?pageNumber=${pageNumber}&pageSize=${pageSize}&region=${region}&projectId=${projectId}&searchValue=${searchValue}&status=${status}&isCheckState=${isCheckState}&userId=${userId}`;
    url_ = url_.replace(/[?&]$/, '');

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
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
