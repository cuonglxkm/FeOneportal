import {Component, Inject, OnInit} from '@angular/core';
import {SecurityGroup, SecurityGroupSearchCondition} from "../../../core/model/interface/security-group";
import {SecurityGroupService} from "../../../core/service/security-group.service";
import SecurityGroupRule, {SecurityGroupRuleGetPage} from "../../../core/model/interface/security-group-rule";
import {Router} from "@angular/router";
import {RegionModel} from "../../../shared/models/region.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {SecurityGroupRuleService} from "../../../core/service/security-group-rule.service";

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

    securityGroupRuleGetPage: SecurityGroupRuleGetPage = new SecurityGroupRuleGetPage();

    constructor(private securityGroupService: SecurityGroupService,
                private router: Router,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private securityGroupRuleService: SecurityGroupRuleService) {
    }

    onSecurityGroupChange(): void {
        this.getListInbound();
        this.listInbound = this.selectedValue.rulesInfo.filter(value => value.direction === 'ingress')
        this.listOutbound = this.selectedValue.rulesInfo.filter(value => value.direction === 'egress')
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
