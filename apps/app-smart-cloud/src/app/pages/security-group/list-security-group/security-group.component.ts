import {Component, OnInit} from '@angular/core';
import {SecurityGroup, SecurityGroupSearchCondition} from "../../../core/model/interface/security-group";
import {SecurityGroupService} from "../../../core/service/security-group.service";
import {SecurityGroupRule} from "../../../core/model/interface/security-group-rule";
import {Router} from "@angular/router";
import {RegionModel} from "../../../shared/models/region.model";

interface Inbound {
    ip_version: string;
    protocol: string;
    port_range: string;
    remote: string;
}

interface Area {
    id: number;
    name: string;
    desc: string;
}

interface Project {
    id: number;
    name: string;
    desc: string;
}

@Component({
    selector: 'one-portal-security-group',
    templateUrl: './security-group.component.html',
    styleUrls: ['./security-group.component.less'],
})
export class SecurityGroupComponent implements OnInit {

    isVisible = false;

    // isVisibleRemoveRule = false;

    conditionSearch: SecurityGroupSearchCondition = new SecurityGroupSearchCondition();

    options: SecurityGroup[] = [];

    selectedValue: SecurityGroup;

    listInbound: SecurityGroupRule[] = []

    listOutbound: SecurityGroupRule[] = []

    region: RegionModel;

    constructor(private securityGroupService: SecurityGroupService,
                private router: Router) {
    }


    selectedValueArea?: Area;
    optionsArea: Area[] = [
        {name: 'Khu vực 1', id: 1, desc: ''},
        {name: 'Khu vực 2', id: 2, desc: ''},
        {name: 'Khu vực 3', id: 3, desc: ""},
    ];

    selectedValueProject?: Project;
    optionsProject: Project[] = [
        {name: 'Dự án 1', id: 1, desc: ''},
        {name: 'Dự án 2', id: 2, desc: ''},
        {name: 'Dự án 3', id: 3, desc: ""},
    ]

    onSecurityGroupChange(): void {
        this.listInbound = this.selectedValue.rulesInfo.filter(value => value.direction === 'ingress')
        this.listOutbound = this.selectedValue.rulesInfo.filter(value => value.direction === 'egress')
    }

    showModal(): void {
        this.isVisible = true;
    }

    // showDeleteRuleModalConfirm(): void {
    //   this.isVisibleRemoveRule = true;
    // }
    //
    // handleCancelDeleteRuleModalConfirm(): void {
    //   this.isVisibleRemoveRule = false;
    // }

    handleOk(): void {
        this.isVisible = false;
        this.getSecurityGroup();
    }

    handleCancel(): void {
        this.isVisible = false;
    }

    regionChanged(region: RegionModel) {
        console.log('region', region)
        this.conditionSearch.regionId = region.regionId;
        this.getSecurityGroup();
    }

    getSecurityGroup() {
        this.conditionSearch.projectId = 4079
        this.conditionSearch.userId = 669
        console.log("conđition: ", this.conditionSearch)
        this.securityGroupService.search(this.conditionSearch)
            .subscribe((data) => {
                // if (!!data.length) {
                //     this.selectedValue = data[0]
                //     this.listInbound = data[0].rulesInfo.filter(value => value.direction === 'ingress')
                //     this.listOutbound = data[0].rulesInfo.filter(value => value.direction === 'egress')
                // }
                this.options = data;
            })
    }

    ngOnInit() {
    }

}
