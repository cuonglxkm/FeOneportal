import {Component, Inject, OnInit} from '@angular/core';
import {SecurityGroup, SecurityGroupSearchCondition} from "../../../shared/models/security-group";
import {SecurityGroupService} from "../../../shared/services/security-group.service";
import SecurityGroupRule from "../../../shared/models/security-group-rule";
import {RegionModel} from "../../../shared/models/region.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {ActivatedRoute} from '@angular/router';
import {ProjectModel} from "../../../shared/models/project.model";

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

    region: number;

    project: number;

    isLoadingSG: boolean = true;

    isLoading: boolean = true;

    headerInfo = {
        firstItem: 'Home',
        secondItem: 'Dịch vụ',
        thirdItem: 'Security Group',
        content: 'Security Group'
    }


    constructor(private securityGroupService: SecurityGroupService,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private route: ActivatedRoute) {
    }

    onSecurityGroupChange(): void {
        this.isLoading = false;
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
        this.region = region.regionId;
        this.conditionSearch.regionId = this.region;
    }

    projectChanged(project: ProjectModel) {
        this.project = project?.id;
        this.conditionSearch.projectId = project?.id;
        this.selectedValue = undefined
        this.listInbound = []
        this.listOutbound = []
        this.getSecurityGroup();
    }

    getSecurityGroup() {
        console.log('search', this.conditionSearch)
        if (this.conditionSearch.regionId
            && this.conditionSearch.userId
            && this.conditionSearch.projectId) {
            this.isLoadingSG = true;
            this.securityGroupService.search(this.conditionSearch)
                .subscribe((data) => {
                    this.options = data;
                    this.isLoadingSG = false;
                })
        }
    }

    getListInbound() {
        console.log('condition, ', this.conditionSearch);
        // this.securityGroupRuleService.getInbound(this.conditionSearch)
    }

    ngOnInit() {
        this.conditionSearch.projectId = 4079
        this.conditionSearch.userId = this.tokenService.get()?.userId
        this.conditionSearch.regionId = this.region
        this.route.queryParams.subscribe(params => {
            this.conditionSearch.regionId = params['regionId'];
            this.conditionSearch.securityGroupId = params['securityGroupId'];
            if (this.conditionSearch.regionId
                && this.conditionSearch.securityGroupId
                && this.conditionSearch.projectId) {
                this.isLoading = true
                this.securityGroupService.search(this.conditionSearch)
                    .subscribe((data) => {
                        if (data) {
                            const index = data.findIndex(v => v.id === this.conditionSearch.securityGroupId) || 0
                            this.selectedValue = data[index]
                            this.listInbound = data[index].rulesInfo.filter(value => value.direction === 'ingress')
                            this.listOutbound = data[index].rulesInfo.filter(value => value.direction === 'egress')
                        }
                        this.options = data;
                        this.isLoading = false
                    })

            }
        });
    }

}
