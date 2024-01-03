import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {RegionModel} from "../../../../../shared/models/region.model";
import {ProjectModel} from "../../../../../shared/models/project.model";
import {UserService} from "../../../../../shared/services/user.service";
import {User} from "../../../../../shared/models/user.model";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {FormUserGroup} from "../../../../../shared/models/user-group.model";
import {UserGroupService} from "../../../../../shared/services/user-group.service";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  selector: 'one-portal-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.less'],
})
export class CreateUserComponent implements OnInit {
  nameGroup: string
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  value?: string
  checked = false;
  loading = false;
  indeterminate = false;

  listOfCurrentPageData: readonly User[] = [];
  setOfCheckedId: Set<string> = new Set<string>();

  listUsers: User[]

  listUsersUnique: User[]

  pageIndex: number = 1
  pageSize: number = 10

  listUserSelected:  any[] = []
  listUserNameSelected: any[] = []

  parent: string

  formCreate: FormUserGroup = new FormUserGroup()

  listPolicies: any[] = []

  constructor(private route: ActivatedRoute,
              private router: Router,
              private userService: UserService,
              private userGroupService: UserGroupService,
              private notification: NzNotificationService) {
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

  // onCurrentPageDataChange(listOfCurrentPageData: readonly User[]): void {
  //   this.listOfCurrentPageData = listOfCurrentPageData;
  //   this.refreshCheckedStatus();
  // }

  onQueryParamsChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params
    this.pageSize = pageSize;
    this.pageIndex = pageIndex
    this.getUsers()
    this.refreshCheckedStatus()
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData;
    this.checked = listOfEnabledData.every(({userName}) => this.setOfCheckedId.has(userName));
    this.indeterminate = listOfEnabledData.some(({userName}) => this.setOfCheckedId.has(userName)) && !this.checked;
  }

  updateCheckedSet(name: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(name);
    } else {
      this.setOfCheckedId.delete(name);
    }
    this.listUserSelected = this.listOfCurrentPageData.filter(data => this.setOfCheckedId.has(data.userName))
  }

  onItemChecked(name: string, checked: boolean): void {
    this.updateCheckedSet(name, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .forEach(({userName}) => this.updateCheckedSet(userName, checked));
    this.refreshCheckedStatus();
  }

  goBack() {
    this.router.navigate(['/app-smart-cloud/iam/user-group/' + this.nameGroup])
  }

  getUsers() {
    this.loading = true
    this.userService.search('', 1000000, 1).subscribe(data => {
      this.loading = false
      this.listUsers = data.records
      this.listUsers.forEach(item => {
        if (!(item.userGroups.includes(this.nameGroup))) {
          if (this.listUsersUnique?.length > 0) {
            this.listUsersUnique.push(item)
          } else {
            this.listUsersUnique = [item]
          }
        }
        this.listOfCurrentPageData = this.listUsersUnique
      })
    })
  }

  create() {
    this.userGroupService.detail(this.nameGroup).subscribe( data => {
      this.formCreate.groupName = this.nameGroup
      this.formCreate.parentName = data.parent
      this.formCreate.policyNames = data.policies
      this.formCreate.users = this.getListUserName()
      this.userGroupService.createOrEdit(this.formCreate).subscribe(data => {
        this.notification.success('Thành công', 'Thêm user vào group thành công')
        this.router.navigate(['/app-smart-cloud/iam/user-group/' + this.nameGroup])
        console.log('thành công')
      }, error => {
        this.notification.error('Thất bại', 'Thêm user vào group thất bại')
        console.log('thất bại', error.log())
      })
    })

  }

  getListUserName() {
    this.listUserSelected.forEach(item => {
      if(this.listUserNameSelected?.length > 0){
        this.listUserNameSelected.push(item.userName)
      } else {
        this.listUserNameSelected = [item.userName]
      }
    })
    return this.listUserNameSelected
  }

  ngOnInit(): void {
    this.nameGroup = this.route.snapshot.paramMap.get('groupName')
    console.log(this.nameGroup)
    this.getUsers()
  }
}
