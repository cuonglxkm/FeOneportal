import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {UserService} from "../../../../shared/services/user.service";
import {User} from "../../../../shared/models/user.model";
import {BaseResponse} from '../../../../../../../../libs/common-utils/src';
import {NzTableQueryParams} from "ng-zorro-antd/table";

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
    this.filteredUsers = this.filterUser(this.value)
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params
    this.pageSize = pageSize;
    this.pageIndex = pageIndex
    this.refreshCheckedStatus()
    this.getUsers()
  }

  updateCheckedSet(userName: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(userName);
    } else {
      this.setOfCheckedId.delete(userName);
    }
    this.listOfSelected = this.listUsers.filter(data => this.setOfCheckedId.has(data.userName))
    this.listUsersSelected.emit(this.listOfSelected)
  }

  onItemChecked(userName: string, checked: boolean): void {
    this.updateCheckedSet(userName, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach(item => this.updateCheckedSet(item.userName, value));
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly User[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every(item => this.setOfCheckedId.has(item.userName));
    this.indeterminate = this.listOfCurrentPageData.some(item => this.setOfCheckedId.has(item.userName)) && !this.checked;
  }

  filterUser(keyword: string) {
    return this.listUsers.filter(item => (!item || item.userName.includes(keyword)))
  }

  // updateCheckedSet(userName: string, checked: boolean): void {
  //   if (checked) {
  //     this.setOfCheckedId.add(userName);
  //   } else {
  //     this.setOfCheckedId.delete(userName);
  //   }
  //   this.listOfSelected = this.listUsers.filter(data => this.setOfCheckedId.has(data.userName))
  //   console.log('user selected', this.listOfSelected)
  //   this.listUsersSelected.emit(this.listOfSelected)
  // }

  reload() {
    this.value = '';
    this.getUsers();
  }
  getUsers() {
    this.loading = true
    this.userService.search('', 9999, 1).subscribe(data => {
      this.loading = false
      this.listUsers = data.records
      this.filteredUsers = data.records
      this.response = data
      this.listOfCurrentPageData = this.listUsers
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
