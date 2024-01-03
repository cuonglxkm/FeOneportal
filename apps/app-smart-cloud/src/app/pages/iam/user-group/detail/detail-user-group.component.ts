import {Component} from '@angular/core';
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {ActivatedRoute, Router} from "@angular/router";
import {NzFormatEmitEvent} from "ng-zorro-antd/tree";
import {UserGroupService} from "../../../../shared/services/user-group.service";
import {
  FormSearchUserGroup,
  RemovePolicy,
  UserGroupModel
} from "../../../../shared/models/user-group.model";
import {PolicyService} from "../../../../shared/services/policy.service";
import {PolicyModel} from "../../../policy/policy.model";
import {User} from "../../../../shared/models/user.model";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {FormControl, FormGroup, NonNullableFormBuilder} from '@angular/forms';

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
  filteredPolicies: PolicyModel[] = []

  listOfCurrentPageDataUser: readonly User[] = [];
  setOfCheckedIdUser = new Set<string>();

  listOfCurrentPageDataPolicy: readonly PolicyModel[] = [];
  setOfCheckedIdPolicy = new Set<string>();

  groupModel: UserGroupModel

  groupName: string

  parentGroup: string

  expandSet = new Set<string>();

  listUsersFromGroup: User[] = []
  listUsers: User[] = []
  filteredUsers: User[] = []

  countUser = 0

  formSearch: FormSearchUserGroup = new FormSearchUserGroup()

  removePolicyModel: RemovePolicy = new RemovePolicy()

  status = [
    {label: 'Tất cả', value: 'all'},
    {label: 'Portal Managed', value: 'portal'},
    {label: 'Custom Managed', value: 'custom'}
  ]

  selectedValue?: string = null

  policyModel: PolicyModel

  filterPoliciesForm: FormGroup<{
    keyword: FormControl<string>;
    status: FormControl<string>;
  }> = this.fb.group({
    keyword: [''],
    status: ['all'],
  });

  filterUsersForm: FormGroup<{
    keyword: FormControl<string>;
  }> = this.fb.group({
    keyword: [''],
  });

  constructor(private router: Router,
              private route: ActivatedRoute,
              private userGroupService: UserGroupService,
              private policyService: PolicyService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder) {
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
    if (this.value) {

    }
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

  onChange(value: string) {
    console.log('abc', this.selectedValue)
    if (value === 'all') {
      this.selectedValue = ''
    } else {
      this.selectedValue = value;
    }
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

  filterUsers(condition: Partial<{ keyword: string; }>) {
    const {keyword} = condition
    return this.listUsers.filter(item => (!item || item.userName.includes(keyword)))
  }

  searchUsers() {
    this.filteredUsers = this.filterUsers(this.filterUsersForm.value)
  }

  filterPolicies(condition: Partial<{ keyword: string; status: string; }>) {
    const {keyword, status} = condition;
    return this.listOfDataPolicies.filter(item => (!item || item.name.includes(keyword)) && (status === 'all' || item.type === status))
  }

  searchPolicies() {
    this.filteredPolicies = this.filterPolicies(this.filterPoliciesForm.value)
  }


  getData(groupName: string) {
    this.loading = true;
    //get group
    this.userGroupService.detail(groupName).subscribe(data => {
      this.groupModel = data
      this.loading = false
      this.parentGroup = this.groupModel.parent
      data.policies?.map((name) => {
        this.policyService.detail(name).subscribe(data => {
          if (data) {

            this.listOfDataPolicies = [...this.listOfDataPolicies, data]
              console.log(this.listOfDataPolicies);
            this.filteredPolicies = this.listOfDataPolicies
            console.log(this.filteredPolicies);
          }
        })
      })
    })
    this.userGroupService.getUserByGroup(groupName, 5, 1).subscribe(data3 => {
      this.listUsers = data3.records
      this.filteredUsers = data3.records
      console.log('user', this.listUsers)
    })
  }

  itemName: string

  removePolicy() {
    console.log('selected', Array.from(new Set(this.setOfCheckedIdPolicy)))
    let array = Array.from(new Set(this.setOfCheckedIdPolicy))
    for(let i = 0; i < array?.length; i++){
      this.itemName = array[i]
      if(this.removePolicyModel.items?.length > 0) {
        this.removePolicyModel.items.push({itemName: this.itemName})
      } else {
        this.removePolicyModel.items = [{itemName: this.itemName}]
      }
    }
    this.removePolicyModel.groupName = this.groupName
    console.log(this.removePolicyModel)
    this.userGroupService.removePolicy(this.removePolicyModel).subscribe(data => {
      this.notification.success('Thành công', 'Gỡ policy ra khỏi Group thành công')
      this.listOfDataPolicies = []
      this.filteredPolicies = []
      this.getData(this.groupName)
    }, error => {
      this.notification.error('Thất bại', 'Gỡ policy ra khỏi Group thất bại')
    })
  }

  removeUser() {
    this.userGroupService.removeUsers(this.groupName, Array.from(this.setOfCheckedIdUser)).subscribe(data => {
      this.notification.success('Thành công', 'Gỡ người dùng ra khỏi Group thành công')
      this.getData(this.groupName)
    }, error => {
      this.notification.error('Thất bại', 'Gỡ người dùng ra khỏi Group thất bại')
    })
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.listOfDataPolicies = []
      this.filteredPolicies = []
      this.groupName = params['name']
      if (this.groupName !== undefined) {
        this.getData(this.groupName)
        // this.countUser = this.listUsersFromGroup.length
      }
    })
  }

  reload() {
  }

}
