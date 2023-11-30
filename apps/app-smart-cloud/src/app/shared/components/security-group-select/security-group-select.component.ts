import {Component, EventEmitter, Inject, Input, Output} from "@angular/core";
import {SecurityGroup, SecurityGroupSearchCondition} from "../../models/security-group";
import {SecurityGroupService} from "../../services/security-group.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Component({
  selector: 'one-portal-security-group-select',
  templateUrl: './security-group-select.component.html',
})

export class SecurityGroupSelectComponent {
  @Input() value?: SecurityGroup

  @Output() onChange = new EventEmitter();

  conditionSearch: SecurityGroupSearchCondition = new SecurityGroupSearchCondition();
  listSecurityGroup: SecurityGroup[] = [];

  constructor(private securityGroupService: SecurityGroupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  onSelect(securityGroup: SecurityGroup) {
    this.onChange.emit(securityGroup);
  }

  search(conditionSearch: SecurityGroupSearchCondition) {
    this.conditionSearch.userId = this.tokenService.get()?.userId
    this.conditionSearch.regionId = JSON.parse(localStorage.getItem('region')).regionId
    this.conditionSearch.projectId = JSON.parse(localStorage.getItem('projectId'))
    if (conditionSearch.regionId && conditionSearch.userId && conditionSearch.projectId) {
      this.securityGroupService.search(conditionSearch)
        .subscribe((data) => {
          this.listSecurityGroup = data;
          console.log('sg', this.listSecurityGroup)
        })
    }
  }

}
