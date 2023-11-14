import {Component, Inject, OnInit} from '@angular/core';
import {SecurityGroup, SecurityGroupSearchCondition} from "../../../core/model/interface/security-group";
import {SecurityGroupService} from "../../../core/service/security-group.service";
import SecurityGroupRule from "../../../core/model/interface/security-group-rule";
import {RegionModel} from "../../../shared/models/region.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Component({
  selector: 'one-portal-security-group',
  templateUrl: './security-group.component.html',
  styleUrls: ['./security-group.component.less'],
})
export class SecurityGroupComponent implements OnInit {

  isVisible = false;

  conditionSearch: SecurityGroupSearchCondition = new SecurityGroupSearchCondition();

  options: SecurityGroup[] = [];

  selectedValue: SecurityGroup;

  listInbound: SecurityGroupRule[] = []

  listOutbound: SecurityGroupRule[] = []

  region: RegionModel;


  constructor(private securityGroupService: SecurityGroupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  onSecurityGroupChange(): void {
    this.getListInbound();
    this.listInbound = this.selectedValue.rulesInfo.filter(value => value.direction === 'ingress')
    this.listOutbound = this.selectedValue.rulesInfo.filter(value => value.direction === 'egress')

    console.log('selected value', this.selectedValue)
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.isVisible = false;
    this.getSecurityGroup();
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  regionChanged(region: RegionModel) {
    this.conditionSearch.regionId = region.regionId;
    this.getSecurityGroup();
  }

  getSecurityGroup() {
    this.securityGroupService.search(this.conditionSearch)
      .subscribe((data) => {
        this.options = data;
      })
  }

  getListInbound() {
    console.log('condition, ', this.conditionSearch);
    // this.securityGroupRuleService.getInbound(this.conditionSearch)
  }

  ngOnInit() {
    this.conditionSearch.projectId = 4079
    this.conditionSearch.userId = this.tokenService.get()?.userId
  }

}
