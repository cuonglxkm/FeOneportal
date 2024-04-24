import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { CreateSGReqDto, FormDeleteRule, SecurityGroup, SecurityGroupSearchCondition } from "../model/security-group.model";
import { BaseService } from "../shared/services/base.service";
import { RuleSearchCondition, SecurityGroupRuleCreateForm } from "../shared/models/security-group-rule";

@Injectable({
  providedIn: 'root',
})
export class SecurityGroupService extends BaseService {

  constructor(private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  baseUrl: string = "https://api.onsmartcloud.com";

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  searchSecurityGroup(condition: SecurityGroupSearchCondition) {
    let params = new HttpParams();
    params = params.append('userId', condition.userId);
    params = params.append('projectId', condition.projectId);
    params = params.append('regionId', condition.regionId);

    return this.http.get<SecurityGroup[]>(this.baseUrl + this.ENDPOINT.provisions + '/security_group/getall', { params: params });
  }

  searchRule(condition: RuleSearchCondition) {
    let params = new HttpParams();
    params = params.append('userId', condition.userId);
    params = params.append('projectId', condition.projectId);
    params = params.append('regionId', condition.regionId);
    params = params.append('pageSize', condition.pageSize);
    params = params.append('pageNumber', condition.pageNumber);
    params = params.append('securityGroupId', condition.securityGroupId);
    params = params.append('direction', condition.direction);

    return this.http.get(this.baseUrl + this.ENDPOINT.provisions + '/security_group/rule/getpaging', { params: params });
  }

  createSecurityGroup(form: CreateSGReqDto) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/security_group', Object.assign(form));
  }

  deleteRule(formDeleteRule: FormDeleteRule) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + '/security_group/rule', { body: formDeleteRule });
  }

  createRule(form: SecurityGroupRuleCreateForm) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/security_group/rule', Object.assign(form));
  }

}
