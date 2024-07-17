import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { CreateSGReqDto, FormDeleteRule, SecurityGroup, SecurityGroupSearchCondition } from "../model/security-group.model";
import { RuleSearchCondition, SecurityGroupRuleCreateForm } from "../shared/models/security-group-rule";
import { BaseService } from "../shared/services/base.service";

@Injectable({
  providedIn: 'root',
})
export class SecurityGroupService extends BaseService {

  constructor(private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Project-Id': localStorage.getItem('projectId') && Number(localStorage.getItem('projectId')) > 0 ? Number(localStorage.getItem('projectId')) : 0,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  searchSecurityGroup(condition: SecurityGroupSearchCondition) {
    let params = new HttpParams();
    params = params.append('userId', condition.userId);
    params = params.append('projectId', condition.projectId);
    params = params.append('regionId', condition.regionId);

    return this.http.get<SecurityGroup[]>(this.baseSCUrl + this.ENDPOINT.provisions + '/security_group/getall', { params: params });
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

    return this.http.get(this.baseSCUrl + this.ENDPOINT.provisions + '/security_group/rule/getpaging', { params: params });
  }

  createSecurityGroup(form: CreateSGReqDto) {
    return this.http.post(this.baseSCUrl + this.ENDPOINT.provisions + '/security_group', Object.assign(form));
  }

  deleteRule(formDeleteRule: FormDeleteRule) {
    return this.http.delete(this.baseSCUrl + this.ENDPOINT.provisions + '/security_group/rule', { body: formDeleteRule });
  }

  createRule(form: SecurityGroupRuleCreateForm) {
    return this.http.post(this.baseSCUrl + this.ENDPOINT.provisions + '/security_group/rule', Object.assign(form));
  }

}
