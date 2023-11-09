import {Component, OnInit} from '@angular/core';
import {SecurityGroupRule} from "../../../../core/model/interface/security-group-rule";
import {SecurityGroup, SecurityGroupSearchCondition} from "../../../../core/model/interface/security-group";
import {SecurityGroupService} from "../../../../core/service/security-group.service";

@Component({
  selector: 'one-portal-list-outbound',
  templateUrl: './list-outbound.component.html',
  styleUrls: ['./list-outbound.component.less'],
})
export class ListOutboundComponent implements OnInit{
  isVisible = false;
  isVisibleRemoveRule = false;
  listOutbound: SecurityGroupRule[] = [];

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
            this.listOutbound = data[0].rulesInfo.filter(value => value.direction === 'egress')
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
