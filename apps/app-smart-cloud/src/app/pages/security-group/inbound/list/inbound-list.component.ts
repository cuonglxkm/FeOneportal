import {Component, OnInit} from '@angular/core';
import {SecurityGroupRule} from "../../../../core/model/interface/security-group-rule";
import {SecurityGroupService} from "../../../../core/service/security-group.service";
import {SecurityGroup, SecurityGroupSearchCondition} from "../../../../core/model/interface/security-group";

@Component({
  selector: 'one-portal-inbound-list',
  templateUrl: './inbound-list.component.html',
  styleUrls: ['./inbound-list.component.less'],
})
export class InboundListComponent implements OnInit{
  isVisible = false;
  isVisibleRemoveRule = false;
  listInbound: SecurityGroupRule[] = [];

  conditionSearch: SecurityGroupSearchCondition = {
    userId: 669,
    regionId: 3,
    projectId: 4079
  }

  selectedValue?: SecurityGroup;

  options: SecurityGroup[] = [];

  constructor(private securityGroupService: SecurityGroupService) {}

  showModal(): void {
    this.isVisible = true;
  }

  showDeleteRuleModalConfirm(): void {
    this.isVisibleRemoveRule = true;
  }

  getSecurityGroupInbound() {
    this.securityGroupService.search(this.conditionSearch)
        .subscribe((data) => {
          if (!!data.length) {
            this.selectedValue = data[0]
            this.listInbound = data[0].rulesInfo.filter(value => value.direction === 'ingress')
          }
          this.options = data;
        })
  }

  handleOk(): void {
    this.isVisible = false;
    this.getSecurityGroupInbound();
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  ngOnInit(): void {
    this.getSecurityGroupInbound();
  }
}
