import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../../../shared/services/user.service";
import {User} from "../../../../../shared/models/user.model";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {FormUserGroup} from "../../../../../shared/models/user-group.model";
import {UserGroupService} from "../../../../../shared/services/user-group.service";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {PolicyModel} from "../../../../../../../../../libs/common-utils/src/lib/models/policy.model";
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Component({
  selector: 'one-portal-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.less'],
})
export class CreateUserComponent implements OnInit {
  nameGroup: string

  value?: string
  loading: boolean = false
  pageSize: number = 10
  pageIndex: number = 1

  listUsers: User[] = []
  listUsersUnique: User[] = []
  listOfCurrentPageData: readonly User[] = []

  setOfCheckedId = new Set<string>()
  checked = false
  indeterminate = false

  formCreate: FormUserGroup = new FormUserGroup()

  listUserSelected: any[] = []
  listUserNameSelected: any[] = []

  constructor(private route: ActivatedRoute,
              private router: Router,
              private userService: UserService,
              private userGroupService: UserGroupService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  onInputChange(value: string) {
    this.value = value
    console.log('input text: ', this.value)
    this.getUsers()
  }

  getUsers() {
    this.loading = true
    this.userService.search(this.value, this.pageSize, this.pageIndex).subscribe(data => {
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

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach(item => this.updateCheckedSet(item.userName, value));
    this.refreshCheckedStatus();
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params
    this.pageSize = pageSize;
    this.pageIndex = pageIndex
    this.getUsers()
    this.refreshCheckedStatus()
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly User[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every(item => this.setOfCheckedId.has(item.userName));
    this.indeterminate = this.listOfCurrentPageData.some(item => this.setOfCheckedId.has(item.userName)) && !this.checked;
  }

  goBack() {
    this.router.navigate(['/app-smart-cloud/iam/user-group/' + this.nameGroup])
  }

  create() {
    this.userGroupService.detail(this.nameGroup).subscribe(data => {
      this.formCreate.groupName = this.nameGroup
      //this.formCreate.parentName = data.parent
      this.formCreate.policyNames = data.policies
      this.formCreate.users = Array.from(this.setOfCheckedId)
      this.userGroupService.createOrEdit(this.formCreate).subscribe(data => {
        this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("app.users.users.add.success"))
        this.router.navigate(['/app-smart-cloud/iam/user-group/' + this.nameGroup])
      }, error => {
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.users.users.add.fail"))

      })
    })

  }
  getListUserName() {
    this.listUserSelected.forEach(item => {
      if (this.listUserNameSelected?.length > 0) {
        this.listUserNameSelected.push(item.userName)
      } else {
        this.listUserNameSelected = [item.userName]
      }
    })
    return this.listUserNameSelected
  }

  ngOnInit(): void {
    this.nameGroup = this.route.snapshot.paramMap.get('groupName')
    this.setOfCheckedId = new Set<string>()
    console.log(this.nameGroup)
    this.getUsers()
  }
}
