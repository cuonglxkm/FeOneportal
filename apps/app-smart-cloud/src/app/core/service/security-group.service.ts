import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {SecurityGroup, SecurityGroupCreateForm, SecurityGroupSearchCondition} from "../model/interface/security-group";
import {Observable} from "rxjs";

const API_URL: string = 'http://172.16.68.200:1009';
@Injectable({
  providedIn: 'root'
})
export class SecurityGroupService {


  constructor(public http: HttpClient) {}

  private getHeaders() {
    const token: string = '123456789'
    return new HttpHeaders({
      token,
      'Content-Type': 'application/json'
    })
  }
  search(condition: SecurityGroupSearchCondition): Observable<SecurityGroup[]> {
    let params = new HttpParams();
    params = params.append('userId', condition.userId);
    params = params.append('projectId', condition.projectId);
    params = params.append('regionId', condition.regionId);

    return this.http.get<SecurityGroup[]>(`${API_URL}/security_group/get_all`, {
      headers: this.getHeaders(),
      params: params
    })
  }

  create(form: SecurityGroupCreateForm , condition: SecurityGroupSearchCondition) {
    return this.http.post(`${API_URL}/security_group`, Object.assign(form, condition))
  }
  delete(id: string, condition: SecurityGroupSearchCondition) {
    return this.http.delete(`${API_URL}/security_group`, {
      headers: this.getHeaders(),
      body: JSON.stringify({id, ...condition})
    })
  }
}
