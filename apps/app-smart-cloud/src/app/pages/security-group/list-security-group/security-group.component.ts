import {Component, Inject, OnInit} from '@angular/core';
import {SecurityGroup, SecurityGroupSearchCondition} from "../../../shared/models/security-group";
import {SecurityGroupService} from "../../../shared/services/security-group.service";
import SecurityGroupRule from "../../../shared/models/security-group-rule";
import {RegionModel} from "../../../shared/models/region.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {ActivatedRoute} from '@angular/router';
import {ProjectModel} from "../../../shared/models/project.model";
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {Instance, InstanceFormSearch} from "../../instances/instances.model";
import {InstanceService} from "../../../shared/services/instance.service";
import Pagination from "../../../shared/models/pagination";

@Component({
    selector: 'one-portal-security-group',
    templateUrl: './security-group.component.html',
    styleUrls: ['./security-group.component.less'],
})
export class SecurityGroupComponent implements OnInit {

    conditionSearch: SecurityGroupSearchCondition = new SecurityGroupSearchCondition();

    options: SecurityGroup[] = [];

    selectedValue: SecurityGroup;

    listInbound: SecurityGroupRule[] = []

    listOutbound: SecurityGroupRule[] = []

    listInstance: Instance[] = []

    condition: InstanceFormSearch = new InstanceFormSearch()

    region = JSON.parse(localStorage.getItem('region')).regionId;

    project = JSON.parse(localStorage.getItem('projectId'));

    pageSize: number = 10
    pageNumber: number = 1


    constructor(private securityGroupService: SecurityGroupService,
                @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
                private route: ActivatedRoute,
                private notification: NzNotificationService,
                private instanceService: InstanceService) {
    }

    onSecurityGroupChange(): void {
        this.getListInbound();
        this.listInbound = this.selectedValue.rulesInfo.filter(value => value.direction === 'ingress')
        this.listOutbound = this.selectedValue.rulesInfo.filter(value => value.direction === 'egress')
        this.getInstances()
    }

    handleOk(): void {
        this.selectedValue = undefined
        this.listInbound = []
        this.listOutbound = []
        this.listInstance = []
        this.getSecurityGroup();
    }

    handleOkCreate() {
        this.getSecurityGroup();
    }

    regionChanged(region: RegionModel) {
        this.region = region.regionId
        this.conditionSearch.regionId = this.region;
    }

    projectChanged(project: ProjectModel) {
        this.project = project?.id
        this.conditionSearch.projectId = project?.id;
        this.selectedValue = undefined
        this.listInbound = []
        this.listOutbound = []
        this.listInstance = []
        this.getSecurityGroup();
    }

    getSecurityGroup() {
        if (this.conditionSearch.regionId
            && this.conditionSearch.userId
            && this.conditionSearch.projectId) {
            this.securityGroupService.search(this.conditionSearch)
                .subscribe((data) => {
                    this.options = data;
                    console.log('sg', this.options)
                })
        }
    }

    getInstances() {
        this.condition.userId = this.tokenService.get()?.userId

        this.condition.region = this.region
        this.condition.pageNumber = this.pageNumber
        this.condition.pageSize = this.pageSize
        this.condition.isCheckState = true
        this.instanceService.search(this.condition).subscribe(data => {
            this.listInstance = data.records
            console.log('data', this.listInstance)
        }, error => {
            this.notification.error('Thất bại', 'Lấy thông tin máy ảo thất bại')
        })
    }

    getListInbound() {
        console.log('condition, ', this.conditionSearch);
        // this.securityGroupRuleService.getInbound(this.conditionSearch)
    }

    ngOnInit() {
        this.conditionSearch.projectId = this.project
        this.conditionSearch.userId = this.tokenService.get()?.userId
        this.conditionSearch.regionId = this.region
        this.route.queryParams.subscribe(params => {
            this.conditionSearch.regionId = params['regionId'];
            this.conditionSearch.securityGroupId = params['securityGroupId'];
            if (this.conditionSearch.regionId
                && this.conditionSearch.securityGroupId
                && this.conditionSearch.projectId) {
                this.securityGroupService.search(this.conditionSearch)
                    .subscribe((data) => {
                        if (data) {
                            const index = data.findIndex(v => v.id === this.conditionSearch.securityGroupId) || 0
                            this.selectedValue = data[index]
                            this.listInbound = data[index].rulesInfo.filter(value => value.direction === 'ingress')
                            this.listOutbound = data[index].rulesInfo.filter(value => value.direction === 'egress')
                        }
                        this.options = data;
                    }, error => {
                        this.notification.error('Thất bại', `Lấy dữ liệu thất bại`);
                    })

            }
        });
    }

}
