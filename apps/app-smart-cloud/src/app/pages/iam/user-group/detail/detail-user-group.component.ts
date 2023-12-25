import {Component} from '@angular/core';
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {ActivatedRoute, Router} from "@angular/router";
import {NzFormatEmitEvent} from "ng-zorro-antd/tree";
import {UserGroupService} from "../../../../shared/services/user-group.service";
import {
    FormSearchUserGroup,
    ItemDetachPolicy,
    RemovePolicy,
    UserGroupModel
} from "../../../../shared/models/user-group.model";
import {PolicyService} from "../../../../shared/services/policy.service";
import {PolicyModel} from "../../../policy/policy.model";
import {User} from "../../../../shared/models/user.model";
import {NzNotificationService} from "ng-zorro-antd/notification";

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

    loading = false;

    indeterminateUser = false;
    checkedUser = false;

    indeterminatePolicy = false;
    checkedPolicy = false;

    listOfDataPolicies: PolicyModel[] = []

    listOfCurrentPageDataUser: readonly User[] = [];
    setOfCheckedIdUser = new Set<string>();

    listOfCurrentPageDataPolicy: readonly PolicyModel[] = [];
    setOfCheckedIdPolicy = new Set<string>();

    groupModel: UserGroupModel

    groupName: string

    expandSet = new Set<string>();

    listUsersFromGroup: User[] = []
    listUsers: User[] = []


    countUser = 0

    formSearch: FormSearchUserGroup = new FormSearchUserGroup()

    removePolicyModel: RemovePolicy = new RemovePolicy()
    itemDetachPolicy: ItemDetachPolicy[] = []

    constructor(private router: Router,
                private route: ActivatedRoute,
                private userGroupService: UserGroupService,
                private policyService: PolicyService,
                private notification: NzNotificationService) {
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
        this.listOfDataPolicies.filter(item => {
            item.name.toLowerCase().includes(this.value.toLowerCase())
        })
    }

    //User
    onCurrentPageDataChangeUser(listOfCurrentPageData: readonly User[]): void {
        this.listOfCurrentPageDataUser = listOfCurrentPageData;
        this.refreshCheckedStatusUser();
    }

    refreshCheckedStatusUser(): void {
        const listOfEnabledData = this.listOfCurrentPageDataUser;
        this.checkedUser = listOfEnabledData.every(({userName}) => this.setOfCheckedIdUser.has(userName));
        this.indeterminateUser = listOfEnabledData.some(({userName}) => this.setOfCheckedIdUser.has(userName)) && !this.checkedUser;
    }

    updateCheckedSetUser(userName: string, checked: boolean): void {
        if (checked) {
            this.setOfCheckedIdUser.add(userName);
        } else {
            this.setOfCheckedIdUser.delete(userName);
        }
    }

    onItemCheckedUser(userName: string, checked: boolean): void {
        this.updateCheckedSetUser(userName, checked);
        this.refreshCheckedStatusUser();
    }

    onAllCheckedUser(checked: boolean): void {
        this.listOfCurrentPageDataUser
            .forEach(({userName}) => this.updateCheckedSetUser(userName, checked));
        this.refreshCheckedStatusUser();
    }

    //Policy
    onCurrentPageDataChangePolicy(listOfCurrentPageData: readonly PolicyModel[]): void {
        this.listOfCurrentPageDataPolicy = listOfCurrentPageData;
        this.refreshCheckedStatusPolicy();
    }

    refreshCheckedStatusPolicy(): void {
        const listOfEnabledData = this.listOfCurrentPageDataPolicy;
        this.checkedPolicy = listOfEnabledData.every(({name}) => this.setOfCheckedIdPolicy.has(name));
        this.indeterminatePolicy = listOfEnabledData.some(({name}) => this.setOfCheckedIdPolicy.has(name)) && !this.checkedPolicy;
    }

    updateCheckedSetPolicy(userName: string, checked: boolean): void {
        if (checked) {
            this.setOfCheckedIdPolicy.add(userName);
        } else {
            this.setOfCheckedIdPolicy.delete(userName);
        }
    }

    onItemCheckedPolicy(userName: string, checked: boolean): void {
        this.updateCheckedSetPolicy(userName, checked);
        this.refreshCheckedStatusPolicy();
    }

    onAllCheckedPolicy(checked: boolean): void {
        this.listOfCurrentPageDataPolicy
            .forEach(({name}) => this.updateCheckedSetPolicy(name, checked));
        this.refreshCheckedStatusPolicy();
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
    searchUsers()  {
        this.listUsers.filter(item => {
            item.userName.toLowerCase().includes(this.value.toLowerCase())
        })
    }

    searchPolicies()  {
        this.listOfDataPolicies.filter(item => {
            item.name.toLowerCase().includes(this.value.toLowerCase())
        })
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

    removePolicy() {
        this.itemDetachPolicy.forEach(item => {

        })


    }

    removeUser() {
        this.userGroupService.removeUsers(this.groupName, Array.from(this.setOfCheckedIdUser)).subscribe(data => {
            this.notification.success('Thành công', 'Gỡ người dùng ra khỏi Group thành công')
        }, error => {
            this.notification.error('Thất bại', 'Gỡ người dùng ra khỏi Group thất bại')
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

    reload() {

    }
}
