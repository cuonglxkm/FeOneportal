import {Component, Inject} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {NzFormatEmitEvent} from "ng-zorro-antd/tree";
import {UserGroupService} from "../../../../shared/services/user-group.service";
import {
  FormSearchPolicy,
  FormSearchUserGroup,
  RemovePolicy,
  UserGroupModel
} from "../../../../shared/models/user-group.model";
import {PolicyModel} from "../../../../../../../../libs/common-utils/src/lib/models/policy.model";
import {User} from "../../../../shared/models/user.model";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {NonNullableFormBuilder} from '@angular/forms';
import {BaseResponse} from '../../../../../../../../libs/common-utils/src';
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {debounceTime} from "rxjs";
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-detail-user-group',
  templateUrl: './detail-user-group.component.html',
  styleUrls: ['./detail-user-group.component.less'],
})
export class DetailUserGroupComponent {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  value?: string;

  isVisibleEdit: boolean = false

  loading = false;

  isLoadingUser: boolean = false
  isLoadingPolicy: boolean = false

  indeterminateUser = false;
  checkedUser = false;

  indeterminatePolicy = false;
  checkedPolicy = false;

  listOfDataPolicies: PolicyModel[] = []
  filteredPolicies: PolicyModel[] = []

  listOfCurrentPageDataUser: readonly User[] = [];
  setOfCheckedIdUser = new Set<string>();

  listOfCurrentPageDataPolicy: readonly PolicyModel[] = [];
  setOfCheckedIdPolicy = new Set<string>();

  groupModel: UserGroupModel

  groupName: string

  //parentGroup: string

  expandSet = new Set<string>();

  listUsersFromGroup: User[] = []
  listUsers: User[] = []
  filteredUsers: User[] = []

  countUser = 0

  formSearch: FormSearchUserGroup = new FormSearchUserGroup()

  removePolicyModel: RemovePolicy = new RemovePolicy()

  status = [
    {label: 'Tất cả các loại', value: 'all'},
    {label: 'Portal Managed', value: 'Portal managed'},
    {label: 'Custom Managed', value: 'Custom managed'}
  ]

  selectedValue?: string = null

  policyModel: PolicyModel

  itemName: string
  responsePolicies: BaseResponse<PolicyModel[]>
  responseUsers: BaseResponse<User[]>

  pageSizePolicy: number = 5
  pageIndexPolicy: number = 1

  pageSizeUser: number = 5
  pageIndexUser: number = 1

  formSearchPolicy: FormSearchPolicy = new FormSearchPolicy()

  valueUser: string

  constructor(private router: Router,
              private route: ActivatedRoute,
              private userGroupService: UserGroupService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  onExpandChange(name: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(name);
    } else {
      this.expandSet.delete(name);
    }
  }

  onInputChangePolicy(value: string) {
    this.value = value;
    console.log('input text: ', this.value)
    if (this.value != null || this.value != undefined || this.value != '') {
      this.formSearchPolicy.policyName = this.value
      this.getPoliciesByGroupName()
    } else {
      this.getPoliciesByGroupName()
    }
  }

  //User

  onQueryParamsUserChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params
    this.pageSizeUser = pageSize
    this.pageIndexUser = pageIndex
    this.getUsersByGroupName()
    this.refreshCheckedStatusPolicy()
  }

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

  onCurrentPageDataChange(listOfCurrentPageData: readonly PolicyModel[]): void {
    this.listOfCurrentPageDataPolicy = listOfCurrentPageData;
    this.refreshCheckedStatusPolicy();
  }

  onQueryParamsPolicyChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params
    this.pageSizePolicy = pageSize
    this.pageIndexPolicy = pageIndex
    this.listOfCurrentPageDataPolicy = this.listOfDataPolicies
    this.getPoliciesByGroupName()
    this.refreshCheckedStatusPolicy()
  }

  refreshCheckedStatusPolicy(): void {
    const listOfEnabledData = this.listOfCurrentPageDataPolicy;
    this.checkedPolicy = listOfEnabledData.every(({name}) => this.setOfCheckedIdPolicy.has(name));
    this.indeterminatePolicy = listOfEnabledData.some(({name}) => this.setOfCheckedIdPolicy.has(name)) && !this.checkedPolicy;
  }

  updateCheckedSetPolicy(name: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedIdPolicy.add(name);
    } else {
      this.setOfCheckedIdPolicy.delete(name);
    }
  }

  onItemCheckedPolicy(name: string, checked: boolean): void {
    this.updateCheckedSetPolicy(name, checked);
    this.refreshCheckedStatusPolicy();
  }

  onAllCheckedPolicy(checked: boolean): void {
    this.listOfCurrentPageDataPolicy
      .forEach(({name}) => this.updateCheckedSetPolicy(name, checked));
    this.refreshCheckedStatusPolicy();
  }

  onChange(status: string) {
    this.filteredPolicies =
      this.listOfDataPolicies.filter(item => (status === 'all' || item.type === status))
  }

  goBack() {
    this.router.navigate(['/app-smart-cloud/iam/user-group'])
  }

  // showModalEdit() {
  //   this.isVisibleEdit = true
  // }
  //
  // handleCancelEdit() {
  //   this.isVisibleEdit = false
  // }
  //
  // handleOkEdit() {
  //   this.isVisibleEdit = false
  //   this.route.params.subscribe((params) => {
  //     const newName = params['name']
  //     console.log('new name', newName)
  //     this.getData(newName)
  //   })
  // }

  nzEvent(event: NzFormatEmitEvent): void {
    console.log(event);
  }

  filterUsers(keyword: string) {
    keyword
    this.filteredUsers = this.listUsers.filter(item => (!item || item.userName.includes(keyword)))
  }


  filterPolicies(condition: Partial<{ keyword: string; status: string; }>) {
    const {keyword, status} = condition;
    return this.listOfDataPolicies.filter(item => (!item || item.name.includes(keyword)) && (status === 'all' || item.type === status))
  }


  getData(groupName: string) {
    this.loading = true;

    this.formSearchPolicy.groupName = this.groupName
    this.formSearchPolicy.pageSize = this.pageSizePolicy
    this.formSearchPolicy.currentPage = this.pageIndexPolicy

    //get group
    this.userGroupService.detail(groupName)
      .pipe(debounceTime(500))
      .subscribe(data => {
        this.groupModel = data
        this.loading = false
        //this.parentGroup = this.groupModel.parent
      })
    //get policy
    this.getPoliciesByGroupName()
    //get user
    this.getUsersByGroupName()
  }


  refreshUsers() {
    this.getUsersByGroupName()
  }
  getPoliciesByGroupName() {
    this.isLoadingPolicy = true

    if (this.value != undefined || this.value != null) {
      this.formSearchPolicy.policyName = this.value
    }
    this.userGroupService.getPoliciesByGroupName(this.formSearchPolicy)
      .pipe(debounceTime(600))
      .subscribe(data => {
      this.isLoadingPolicy = false
      this.responsePolicies = data
      this.listOfCurrentPageDataPolicy = data.records
      this.listOfDataPolicies = data.records
      this.filteredPolicies = data.records
    }, error => {
        this.isLoadingPolicy = false
        this.responsePolicies = null
        this.listOfCurrentPageDataPolicy = null
        this.listOfDataPolicies = null
        this.filteredPolicies = null
      })
  }

  getUsersByGroupName() {
    this.isLoadingUser = true
    this.userGroupService.getUserByGroup(this.valueUser, this.groupName, this.pageSizeUser, this.pageIndexUser)
      .pipe(debounceTime(600))
      .subscribe(data => {
      this.isLoadingUser = false
      this.responseUsers = data
      this.filteredUsers = data.records
      this.listUsers = data.records
      this.listOfCurrentPageDataUser = data.records
    })
  }

  removePolicy() {
    console.log('selected', Array.from(new Set(this.setOfCheckedIdPolicy)))
    let array = Array.from(new Set(this.setOfCheckedIdPolicy))
    if (!array.length) {
      return
    }
    for (let i = 0; i < array?.length; i++) {
      this.itemName = array[i]
      if (this.removePolicyModel.items?.length > 0) {
        this.removePolicyModel.items.push({itemName: this.itemName})
      } else {
        this.removePolicyModel.items = [{itemName: this.itemName}]
      }
    }
    this.removePolicyModel.groupName = this.groupName
    console.log(this.removePolicyModel)
    this.userGroupService.removePolicy(this.removePolicyModel).subscribe(data => {
      this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("app.users.policies.remove.success"))
      this.listOfDataPolicies = []
      this.filteredPolicies = []
      this.getData(this.groupName)
      var element = document.getElementById("deletePolicy");
      element.classList.remove("activeDelete");
    }, error => {
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.users.policies.remove.fail"))
    })
  }

  removeUser() {
    if (!Array.from(this.setOfCheckedIdUser).length) {
      return;
    }
    this.userGroupService.removeUsers(this.groupName, Array.from(this.setOfCheckedIdUser)).subscribe(data => {
      this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("app.users.users.remove.success"))
      this.getData(this.groupName)
      var element = document.getElementById("deleteUser");
    element.classList.remove("activeDelete");
    }, error => {
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.users.users.remove.fail"))
    })
  }

  ngOnInit(): void {
    this.route.params
      .subscribe((params) => {
        this.listOfDataPolicies = []
        this.filteredPolicies = []
        this.groupName = params['name']
        if (this.groupName !== undefined) {
          this.getData(this.groupName)
        }
      })
  }

  navigateToAttachPolicy() {
    this.router.navigate(['/app-smart-cloud/iam/user-group/' + this.groupName + '/add-policy'])
  }

  onInputChangeUser(value: string) {
    console.log('value', value)
    if (value != undefined || value != '' || value != null) {
      this.valueUser = value
    } else {
      this.valueUser = ''
    }
    this.getUsersByGroupName()
  }

  navigateToCreateUser() {
    this.router.navigate(['/app-smart-cloud/iam/user-group/' + this.groupName +'/add-user'])
  }
}
