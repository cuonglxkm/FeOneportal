import {Inject, Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {
  ExecuteAttachOrDetach,
  SecurityGroup,
  SecurityGroupCreateForm,
  SecurityGroupSearchCondition
} from "../models/security-group";
import {catchError, Observable} from "rxjs";
import {BaseService} from "src/app/shared/services/base.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Injectable({
    providedIn: 'root'
})
export class SecurityGroupService extends BaseService {


    constructor(public http: HttpClient,
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

    search(condition: SecurityGroupSearchCondition): Observable<SecurityGroup[]> {
        let params = new HttpParams();
        params = params.append('userId', condition.userId);
        params = params.append('projectId', condition.projectId);
        params = params.append('regionId', condition.regionId);

        return this.http.get<SecurityGroup[]>(this.baseUrl + this.ENDPOINT.provisions + '/security_group/getall', {
            headers: this.getHeaders(),
            params: params
        })
            .pipe(catchError(this.errorCode));
    }

    create(form: SecurityGroupCreateForm, condition: SecurityGroupSearchCondition) {
        return this.http
            .post(this.baseUrl + this.ENDPOINT.provisions + '/security_group', Object.assign(form, condition),
                {headers: this.getHeaders()})
            .pipe(catchError(this.errorCode));
    }

    delete(id: string, condition: SecurityGroupSearchCondition) {
        return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + '/security_group', {
            headers: this.getHeaders(),
            body: JSON.stringify({id, ...condition})
        }).pipe(catchError(this.errorCode));
    }

    attachOrDetach(form: ExecuteAttachOrDetach){
        return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/security_group/action', Object.assign(form), {
            headers: this.getHeaders()
        })
    }

}
