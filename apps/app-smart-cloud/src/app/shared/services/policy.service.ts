import { Injectable } from '@angular/core';
import {BaseService} from "./base.service";
import {Observable} from "rxjs";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {PermissionPolicyModel, PolicyModel} from "../../pages/policy/policy.model";
import {PermissionPolicies} from "../models/user.model";


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
}
