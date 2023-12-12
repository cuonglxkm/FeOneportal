import { Injectable } from '@angular/core';
import {BaseService} from "./base.service";
import {Observable} from "rxjs";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {PermissionPolicyModel, PolicyModel} from "../../pages/policy/policy.model";
import {PermissionPolicies} from "../models/user.model";
import {FormSearchUserGroup} from "../models/user-group.model";


@Injectable({
  providedIn: 'root'
})
export class PolicyService extends BaseService{

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {
    super();
  }

  searchPolicy() : Observable<BaseResponse<PolicyModel[]>> {
    return this.http.get<BaseResponse<PolicyModel[]>>("/policy");
  }

  searchPolicyPermisstion() : Observable<BaseResponse<PermissionPolicyModel[]>> {
    return this.http.get<BaseResponse<PermissionPolicyModel[]>>("/policy/permission");
  }

  detail(policyName: string) {
    return this.http.get<PolicyModel>(this.baseUrl + this.ENDPOINT.iam + `/policies/${policyName}`)
  }

  getPolicy(form: FormSearchUserGroup) {
    let params = new HttpParams();
    if (form.name != null) {
      params = params.append('policyName', form.name)
    }
    if(form.pageSize != null) {
      params = params.append('pageSize', form.pageSize);
    }
    if(form.currentPage != null) {
      params = params.append('currentPage', form.currentPage);
    }
    return this.http.get<BaseResponse<PolicyModel[]>>(this.baseUrl + this.ENDPOINT.iam + '/policies', {
      headers: this.httpOptions.headers,
      params: params
    })
  }
}
