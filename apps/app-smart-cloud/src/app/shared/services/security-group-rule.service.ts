import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {SecurityGroupSearchCondition} from "../models/security-group";
import {SecurityGroupRuleCreateForm} from "../models/security-group-rule";
import {BaseService} from "./base.service";
import {catchError, throwError} from "rxjs";

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


    // getInbound(form: SecurityGroupRuleGetPage, condition: SecurityGroupSearchCondition): Observable<SecurityGroupRule[]> {
    //     let params = new HttpParams();
    //     params = params.append('userId', condition.userId);
    //     params = params.append('projectId', condition.projectId);
    //     params = params.append('regionId', condition.regionId);
    //     params = params.append('pageSize', form.pageSize);
    //     params = params.append('pageNumber', form.pageNumber);
    //     params = params.append('securityGroupId', form.securityGroupId);
    //     params = params.append('direction', form.direction);
    //
    //     return this.http.get<SecurityGroupRule[]>(this.baseUrl + this.ENDPOINT.provisions + '/security_group/rule/getpaging', {
    //         headers: this.getHeaders(),
    //         params: params
    //     })
    // }
}
