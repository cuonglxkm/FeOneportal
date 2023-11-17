import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {SecurityGroupSearchCondition} from "../models/security-group";
import SecurityGroupRule, {
    RuleSearchCondition,
    SecurityGroupRuleCreateForm,
    SecurityGroupRuleGetPage
} from "../models/security-group-rule";
import {BaseService} from "./base.service";
import {catchError, Observable, throwError} from "rxjs";
import Pagination from "../models/pagination";

@Injectable({
    providedIn: 'root'
})

export class SecurityGroupRuleService extends BaseService {
    constructor(public http: HttpClient) {
        super();
    }

    private getHeaders() {
        return new HttpHeaders({
            'Content-Type': 'application/json'
        })
    }

    create(form: SecurityGroupRuleCreateForm) {
        return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/security_group/rule', Object.assign(form))
            .pipe(catchError(this.errorCode));
    }

    delete(id: string, condition: SecurityGroupSearchCondition) {
        return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + '/security_group/rule', {
            headers: this.getHeaders(),
            body: JSON.stringify({id, ...condition})
        })
            .pipe(catchError(this.errorCode));
    }


    search(condition: RuleSearchCondition): Observable<Pagination<SecurityGroupRule>> {
        let params = new HttpParams();
        params = params.append('userId', condition.userId);
        params = params.append('projectId', condition.projectId);
        params = params.append('regionId', condition.regionId);
        params = params.append('pageSize', condition.pageSize);
        params = params.append('pageNumber', condition.pageNumber);
        params = params.append('securityGroupId', condition.securityGroupId);
        params = params.append('direction', condition.direction);

        return this.http.get<Pagination<SecurityGroupRule>>(this.baseUrl + this.ENDPOINT.provisions + '/security_group/rule/getpaging', {
            headers: this.getHeaders(),
            params: params
        }).pipe(catchError(this.errorCode));
    }
}
