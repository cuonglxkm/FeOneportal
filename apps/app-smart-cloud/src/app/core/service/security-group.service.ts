import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {SecurityGroup, SecurityGroupCreateForm, SecurityGroupSearchCondition} from "../model/interface/security-group";
import {Observable} from "rxjs";
import { BaseService } from "src/app/shared/services/base.service";

@Injectable({
  providedIn: 'root'
})
export class SecurityGroupService extends BaseService {


  constructor(public http: HttpClient) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }
  search(condition: SecurityGroupSearchCondition): Observable<SecurityGroup[]> {
    let params = new HttpParams();
    params = params.append('userId', condition.userId);
    params = params.append('projectId', condition.projectId);
    params = params.append('regionId', condition.regionId);

    return this.http.get<SecurityGroup[]>(this.baseUrl +'/security_group/getall', {
      headers: this.getHeaders(),
      params: params
    })
  }

  create(form: SecurityGroupCreateForm , condition: SecurityGroupSearchCondition) {
    return this.http.post(this.baseUrl +'/security_group', Object.assign(form, condition))
  }
  delete(id: string, condition: SecurityGroupSearchCondition) {
    return this.http.delete(this.baseUrl + '/security_group', {
      headers: this.getHeaders(),
      body: JSON.stringify({id, ...condition})
    })
  }
}
