import {Component, EventEmitter, Inject, Input, OnInit, Output} from "@angular/core";
import Flavor from "../../models/flavor.model";
import {SecurityGroup, SecurityGroupSearchCondition} from "../../models/security-group";
import {SecurityGroupService} from "../../services/security-group.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Component({
  selector: 'one-portal-security-group-select',
  templateUrl: './security-group-select.component.html',
})

export class SecurityGroupSelectComponent implements OnInit {
  @Input() value?: SecurityGroup
  @Input() region?: number
  @Input() project?: number
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
    if (conditionSearch.regionId && conditionSearch.userId && conditionSearch.projectId) {
      this.securityGroupService.search(conditionSearch)
        .subscribe((data) => {
          this.listSecurityGroup = data;
        })
    }
  }

  ngOnInit(): void {
    console.log(this.region)
    console.log(this.project)
    console.log(this.tokenService.get()?.userId)
    this.conditionSearch.userId = this.tokenService.get()?.userId
    this.conditionSearch.regionId = this.region
    this.conditionSearch.projectId = this.project

    this.search(this.conditionSearch);
  }

}
