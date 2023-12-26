import {Inject, Injectable} from '@angular/core';
import {BaseService} from "./base.service";
import {Observable, of} from "rxjs";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
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
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.tokenService.get()?.token})
    };

    private urlIAM = this.baseUrl + this.ENDPOINT.iam + '/policies';

    constructor(private http: HttpClient,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
        super();
    }

    searchPolicy(): Observable<BaseResponse<PolicyModel[]>> {
        return this.http.get<BaseResponse<PolicyModel[]>>("/policy");
    }

    searchPolicyPermisstion(): Observable<BaseResponse<PermissionPolicyModel[]>> {
        return this.http.get<BaseResponse<PermissionPolicyModel[]>>("/policy/permission");
    }

    getAttachedEntities(policyName: string, entityName: string, type: number, pageSize: number, currentPage: number): Observable<BaseResponse<AttachedEntitiesDTO[]>> {
        let url = this.getConditionSearchAttachedEntities(policyName, entityName, type, pageSize, currentPage);
        return this.http.get<BaseResponse<AttachedEntitiesDTO[]>>(url);
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
        return this.http.get<PermissionDTO[]>(url);
    }


    getPermisssions(policyName: string, actionName: string, pageSize: number, currentPage: number): Observable<BaseResponse<PermissionDTO[]>> {
        let url = this.getConditionSearchPermission(policyName, actionName, pageSize, currentPage);
        return this.http.get<BaseResponse<PermissionDTO[]>>(url);
    }


    attachOrDetach(request: AttachOrDetachRequest): Observable<boolean> {
        let url = this.urlIAM + "/AttachOrDetach";
        return this.http.put<boolean>(url, request);
    }

    getPolicyInfo(policyName: string): Observable<PolicyInfo> {
        let url = this.urlIAM + "/" + policyName;
        return this.http.get<PolicyInfo>(url);
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
    }
}

