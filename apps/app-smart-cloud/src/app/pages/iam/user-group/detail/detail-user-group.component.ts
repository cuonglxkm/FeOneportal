import {Component} from '@angular/core';
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {ActivatedRoute, Router} from "@angular/router";
import {NzFormatEmitEvent} from "ng-zorro-antd/tree";
import {UserGroupService} from "../../../../shared/services/user-group.service";
import {FormSearchUserGroup, UserGroupModel} from "../../../../shared/models/user-group.model";
import {PolicyService} from "../../../../shared/services/policy.service";
import {UserModel} from 'src/app/shared/models/user.model';
import {PolicyModel} from "../../../policy/policy.model";

@Component({
    selector: 'one-portal-detail-user-group',
    templateUrl: './detail-user-group.component.html',
    styleUrls: ['./detail-user-group.component.less'],
})
export class DetailUserGroupComponent {
    region = JSON.parse(localStorage.getItem('region')).regionId;
    project = JSON.parse(localStorage.getItem('projectId'));
    value?: string;
    isVisibleEdit: boolean = false
    checked = false;
    loading = false;
    indeterminate = false;

    listOfDataPolicies: PolicyModel[] = []
    listOfCurrentPageData: readonly UserModel[] = [];
    setOfCheckedId = new Set<string>();

    groupModel: UserGroupModel

    groupName: string

    expandSet = new Set<string>();

    listUsersFromGroup: UserModel[] = []
    listUsers: UserModel[] = []

    countUser = 0

    formSearch: FormSearchUserGroup = new FormSearchUserGroup()

    constructor(private router: Router,
                private route: ActivatedRoute,
                private userGroupService: UserGroupService,
                private policyService: PolicyService) {
    }


    onExpandChange(name: string, checked: boolean): void {
        if (checked) {
            this.expandSet.add(name);
        } else {
            this.expandSet.delete(name);
        }
    }

    regionChanged(region: RegionModel) {
        this.region = region.regionId
        // this.formSearch.regionId = this.region
    }

    projectChanged(project: ProjectModel) {
        this.project = project?.id
        // this.formSearch.project = this.project
    }

    onInputChange(value: string) {
        this.value = value;
        console.log('input text: ', this.value)
    }

    onCurrentPageDataChange(listOfCurrentPageData: readonly UserModel[]): void {
        this.listOfCurrentPageData = listOfCurrentPageData;
        this.refreshCheckedStatus();
    }

    refreshCheckedStatus(): void {
        const listOfEnabledData = this.listOfCurrentPageData;
        this.checked = listOfEnabledData.every(({userName}) => this.setOfCheckedId.has(userName));
        this.indeterminate = listOfEnabledData.some(({userName}) => this.setOfCheckedId.has(userName)) && !this.checked;
    }

    updateCheckedSet(userName: string, checked: boolean): void {
        if (checked) {
            this.setOfCheckedId.add(userName);
        } else {
            this.setOfCheckedId.delete(userName);
        }
    }

    onItemChecked(userName: string, checked: boolean): void {
        this.updateCheckedSet(userName, checked);
        this.refreshCheckedStatus();
    }

    onAllChecked(checked: boolean): void {
        this.listOfCurrentPageData
            .forEach(({userName}) => this.updateCheckedSet(userName, checked));
        this.refreshCheckedStatus();
    }

    goBack() {
        this.router.navigate(['/app-smart-cloud/iam/user-group'])
    }

    showModalEdit() {
        this.isVisibleEdit = true
    }

    handleCancelEdit() {
        this.isVisibleEdit = false
    }

    handleOkEdit() {
        this.isVisibleEdit = false
        this.route.params.subscribe((params) => {
            const newName = params['name']
            console.log('new name', newName)
            this.getData(newName)
        })
    }

    nzEvent(event: NzFormatEmitEvent): void {
        console.log(event);
    }

    getUsers() {

    }

    getData(groupName: string) {
        this.loading = true;
        //get group
        this.userGroupService.detail(groupName).subscribe(data => {
            this.groupModel = data
            this.loading = false
            this.groupModel.policies?.forEach(item => {
                this.policyService.detail(item).subscribe(data2 => {
                    // get policy
                    if (this.listOfDataPolicies.length > 0) {
                        this.listOfDataPolicies.push(data2)
                    } else {
                        this.listOfDataPolicies = [data2]
                    }
                })
            })
            this.userGroupService.getUserByGroup(groupName).subscribe(data3 => {
                this.listUsers = data3.records
                console.log('user', this.listUsers)
            })
        })
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.groupName = params['name']
            if (this.groupName !== undefined) {
                this.getData(this.groupName)
                this.countUser = this.listUsersFromGroup.length
            }
        })
    }

}
