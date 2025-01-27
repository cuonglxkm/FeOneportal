import {Inject, Injectable} from '@angular/core';
import {Observable, of, tap} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {
  AttachedEntitiesDTO,
  AttachOrDetachRequest,
  PermissionDTO,
  PermissionPolicyModel,
  PolicyInfo,
  PolicyModel
} from "../models/policy.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import { BaseService } from './base.service';
import { BaseResponse } from '../../../../../../libs/common-utils/src';

@Injectable({
  providedIn: 'root'
})
export class PolicyService extends BaseService {

  private urlIAM = this.baseUrl + this.ENDPOINT.iam + '/policies';

  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  // searchPolicy(): Observable<BaseResponse<PolicyModel[]>> {
  //   return this.http.get<BaseResponse<PolicyModel[]>>("/policy");
  // }
  searchPolicy(policyName: any, size: any, page: any, userId: any, token: any, status: any): Observable<BaseResponse<PolicyModel[]>> {
    return this.http.get<BaseResponse<PolicyModel[]>>(this.urlIAM + "?policyName=" + policyName + "&pageSize=" + page + "&currentPage=" + size + "&policyType=" + status, this.getHeaders() );
  }

  searchPolicyPermisstion(): Observable<BaseResponse<PermissionPolicyModel[]>> {
    return this.http.get<BaseResponse<PermissionPolicyModel[]>>("/policy/permission", this.getHeaders());
  }

  getAttachedEntities(policyName: string, entityName: string, type: number, pageSize: number, currentPage: number): Observable<BaseResponse<AttachedEntitiesDTO[]>> {
    let url = this.getConditionSearchAttachedEntities(policyName, entityName, type, pageSize, currentPage);
    return this.http.get<BaseResponse<AttachedEntitiesDTO[]>>(url, this.getHeaders());
  }

  getListService(): Observable<any> {
    return of([
      "volume",
      "instance",
      "ippublic",
      "snapshot"
    ])
    // return this.http.get<any>(this.urlIAM+"/services");
  }

  getListPermissionOfService(serviceName: string): Observable<PermissionDTO[]> {
    let url = this.urlIAM + '/ServiceAction' + '/' + serviceName;
    return this.http.get<PermissionDTO[]>(url, { headers: this.getHeaders().headers } );
  }


  getPermisssions(policyName: string, actionName: string, pageSize: number, currentPage: number): Observable<BaseResponse<PermissionDTO[]>> {
    let url = this.getConditionSearchPermission(policyName, actionName, pageSize, currentPage);
    return this.http.get<BaseResponse<PermissionDTO[]>>(url, this.getHeaders() );
  }


  attachOrDetach(request: AttachOrDetachRequest): Observable<boolean> {
    let url = this.urlIAM + "/AttachOrDetach";
    return this.http.put<boolean>(url, request, { headers: this.getHeaders().headers } );
  }

  getPolicyInfo(policyName: string): Observable<PolicyInfo> {
    let url = this.urlIAM + "/" + policyName;
    return this.http.get<PolicyInfo>(url, { headers: this.getHeaders().headers } );
  }

  private getConditionSearchPermission(policyName: string, actionName: string, pageSize: number, currentPage: number): string {
    let urlResult = this.urlIAM + '/Actions';
    let count = 0;
    if (policyName !== undefined && policyName != null) {
      urlResult = urlResult + "/" + policyName;
    }
    if (actionName !== undefined && actionName != null) {
      if (count == 0) {
        urlResult += '?actionName=' + actionName;
        count++;
      } else {
        urlResult += '&actionName=' + actionName;
      }
    }
    if (pageSize !== undefined && pageSize != null) {
      if (count == 0) {
        urlResult += '?pageSize=' + pageSize;
        count++;
      } else {
        urlResult += '&pageSize=' + pageSize;
      }
    }
    if (currentPage !== undefined && currentPage != null) {
      if (count == 0) {
        urlResult += '?currentPage=' + currentPage;
        count++;
      } else {
        urlResult += '&currentPage=' + currentPage;
      }
    }


    return urlResult;
  }

  private getConditionSearchAttachedEntities(policyName: string, entityName: string, type: number, pageSize: number, currentPage: number): string {
    let urlResult = this.urlIAM + '/AttachedEntities';
    let count = 0;
    if (policyName !== undefined && policyName != null) {
      urlResult = urlResult + "/" + policyName;
    }
    if (entityName !== undefined && entityName != null) {
      if (count == 0) {
        urlResult += '?entityName=' + entityName;
        count++;
      } else {
        urlResult += '&entityName=' + entityName;
      }
    }
    if (type !== undefined && type != null) {
      if (count == 0) {
        urlResult += '?type=' + type;
        count++;
      } else {
        urlResult += '&type=' + type;
      }
    }
    if (pageSize !== undefined && pageSize != null) {
      if (count == 0) {
        urlResult += '?pageSize=' + pageSize;
        count++;
      } else {
        urlResult += '&pageSize=' + pageSize;
      }
    }
    if (currentPage !== undefined && currentPage != null) {
      if (count == 0) {
        urlResult += '?currentPage=' + currentPage;
        count++;
      } else {
        urlResult += '&currentPage=' + currentPage;
      }
    }


    return urlResult;
  }


  detail(policyName: string) {
    return this.http.get<PolicyModel>(this.baseUrl + this.ENDPOINT.iam + `/policies/${policyName}`, {
      headers: { headers: this.getHeaders().headers } .headers
    })
  }

  deletePolicy(nameDelete: any, token: any) {
    var reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    return this.http.delete<BaseResponse<PolicyModel[]>>(this.urlIAM + "?policyNames=" + nameDelete, {headers: reqHeader});
  }

  getListServices(token: any): Observable<string[]> {
    var reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    return this.http.get<string[]>(this.urlIAM + '/services', {headers: reqHeader});
  }

  getAllPermissions(): Observable<string[]> {
    return this.http.get<string[]>(this.baseUrl + this.ENDPOINT.iam + '/permissions', { headers: this.getHeaders().headers } );
  }

  createPolicy(request: any): Observable<any> {
    return this.http.post<HttpResponse<any>>(this.urlIAM, request, { headers: this.getHeaders().headers } );
  }

  getUserPermissions(): Observable<any> {
    localStorage.removeItem('PermissionOPA')
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.iam + '/permissions/user', { headers: this.getHeaders().headers } );
  }


  hasPermission(action: string): boolean {
    debugger
    let permisionOPA = localStorage.getItem('PermissionOPA');   
    if (permisionOPA != null) {
      return this.isPermission(action, JSON.parse(permisionOPA));
    } else {
      this.getUserPermissions().pipe().subscribe( (permission) => {
        localStorage.setItem('PermissionOPA', JSON.stringify(permission));
        return this.isPermission(action, permission);
      });
    }
    return true;
  }

  isPermission(action: string, permission): boolean {
    if(permission['IsAdmin']){
      return true;
    }
    if(permission['Permissions']){
      let actionItems = action.split(":");
      let denyActions = permission['Permissions']['DenyActions'] ? permission['Permissions']['DenyActions'] : [];
      let allowActions = permission['Permissions']['AllowActions'] ? permission['Permissions']['AllowActions'] : [];
      if(denyActions.includes(action) || denyActions.includes(actionItems[0] + ":*")){
        return false;
      }
      if(allowActions.includes(action) || allowActions.includes(actionItems[0] + ":*")){
        return true;
      }
    }
    return false;
  }

  getShareUsers(userRootId?: number): Observable<any> {
    localStorage.removeItem('ShareUsers')
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.iam + '/permissions/share-users', { headers: this.getHeaders().headers } );
  }
}
