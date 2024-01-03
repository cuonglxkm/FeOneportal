import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {UserService} from "../../../../shared/services/user.service";
import {User} from "../../../../shared/models/user.model";
import {BaseResponse} from '../../../../../../../../libs/common-utils/src';
import {NzTableQueryParams} from "ng-zorro-antd/table";
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Component({
  selector: 'one-portal-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./create-user-group.component.less'],
})
export class UsersTableComponent implements OnInit {
  @Output() listUsersSelected? = new EventEmitter<any>();

  value?: string;
  listOfCurrentPageData: readonly User[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<string>();
  listOfSelected: readonly any[] = []

  loading = false

  listUsers: User[] = []
  filteredUsers: User[] = []
  countGroup: number = 0

  response: BaseResponse<User[]>
  pageSize = 5
  pageIndex = 1

  countUser: number

  constructor(private userService: UserService) {
  }

  onInputChange(value: string) {
    this.value = value;
  }

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

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .forEach(({userName}) => this.updateCheckedSet(userName, checked));
    this.refreshCheckedStatus();
  }

  onItemChecked(userName: string, checked: boolean): void {
    this.updateCheckedSet(userName, checked);
    this.refreshCheckedStatus();
  }

  filterPolicies() {
    return this.listUsers.filter(item => (!item || item.userName.includes(this.value)))
  }

  searchUsers() {

    this.filteredUsers = this.filterPolicies()
  }

  updateCheckedSet(userName: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(userName);
    } else {
      this.setOfCheckedId.delete(userName);
    }
    this.listOfSelected = this.listUsers.filter(data => this.setOfCheckedId.has(data.userName))
    console.log('user selected', this.listOfSelected)
    this.listUsersSelected.emit(this.listOfSelected)
  }

  getUsers() {
    this.loading = true
    this.userService.search('', 9999, 1).subscribe(data => {
      this.loading = false
      this.listUsers = data.records
      this.filteredUsers = data.records
      this.response = data
    }, error => {
      this.loading = false
      this.response = null
      this.listUsers = []
      this.filteredUsers = []
    })
  }

  ngOnInit(): void {
    this.pageSize = 5
    this.pageIndex = 1
    this.getUsers()
  }
}
