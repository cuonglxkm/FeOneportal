import {Inject, Injectable} from '@angular/core';
import {BaseService} from "./base.service";
import {Observable, of} from "rxjs";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {
    AttachedEntitiesDTO,
    AttachOrDetachRequest,
    PermissionDTO,
    PermissionPolicyModel,
    PolicyInfo,
    PolicyModel
} from "../../pages/policy/policy.model";
import {FormSearchUserGroup} from "../models/user-group.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";


@Injectable({
    providedIn: 'root'
})
export class PolicyService extends BaseService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json' ,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token,
      'user_root_id': this.tokenService.get()?.userId,
    })
  };

    private urlIAM = this.baseUrl + this.ENDPOINT.iam + '/policies';

  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  // searchPolicy(): Observable<BaseResponse<PolicyModel[]>> {
  //   return this.http.get<BaseResponse<PolicyModel[]>>("/policy");
  // }
  searchPolicy(policyName: any, size: any, page: any, userId: any, token: any): Observable<BaseResponse<PolicyModel[]>> {
    var reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    return this.http.get<BaseResponse<PolicyModel[]>>(this.urlIAM + "?policyName=" + policyName + "&pageSize=" + page + "&currentPage=" + size +
      "&user_root_id=" + userId, {headers: reqHeader});
  }

    searchPolicyPermisstion(): Observable<BaseResponse<PermissionPolicyModel[]>> {
        return this.http.get<BaseResponse<PermissionPolicyModel[]>>("/policy/permission");
    }

    getAttachedEntities(policyName: string, entityName: string, type: number, pageSize: number, currentPage: number): Observable<BaseResponse<AttachedEntitiesDTO[]>> {
        const token = this.tokenService.get()?.token;
    var reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });let url = this.getConditionSearchAttachedEntities(policyName, entityName, type, pageSize, currentPage);
        return this.http.get<BaseResponse<AttachedEntitiesDTO[]>>(url,{headers: reqHeader});
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
        const token = this.tokenService.get()?.token;
    var reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });let url = this.urlIAM + '/ServiceAction' + '/' + serviceName;
        return this.http.get<PermissionDTO[]>(url,{headers: reqHeader});
    }


    getPermisssions(policyName: string, actionName: string, pageSize: number, currentPage: number): Observable<BaseResponse<PermissionDTO[]>> {
        const token = this.tokenService.get()?.token;
    var reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });let url = this.getConditionSearchPermission(policyName, actionName, pageSize, currentPage);
        return this.http.get<BaseResponse<PermissionDTO[]>>(url,{headers: reqHeader});
    }


    attachOrDetach(request: AttachOrDetachRequest): Observable<boolean> {
        const token = this.tokenService.get()?.token;
    var reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });let url = this.urlIAM + "/AttachOrDetach";
        return this.http.put<boolean>(url, request, {headers: reqHeader});
    }

    getPolicyInfo(policyName: string): Observable<PolicyInfo> {
        const token = this.tokenService.get()?.token;
    var reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });let url = this.urlIAM + "/" + policyName;
        return this.http.get<PolicyInfo>(url,{headers: reqHeader});
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
            headers: this.httpOptions.headers
        })
    }deletePolicy(nameDelete: any, token: any) {
    var reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    return this.http.delete<BaseResponse<PolicyModel[]>>(this.urlIAM + "?policyNames=" + nameDelete, {headers: reqHeader});
  }

  getListServices(token: any) : Observable<string[]> {
    var reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    return this.http.get<string[]>(this.urlIAM + '/services', {headers: reqHeader});
  }

  getAllPermissions() : Observable<string[]> {
    return this.http.get<string[]>(this.baseUrl + this.ENDPOINT.iam + '/permissions', this.httpOptions);
  }

  createPolicy(request: any) : Observable<any>{
    return this.http.post<HttpResponse<any>>(this.urlIAM, request, this.httpOptions);
  }

}
