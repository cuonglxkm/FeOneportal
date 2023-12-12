import {Component, OnInit} from '@angular/core';
import {UserGroup} from "../list/list-user-group.component";
import {UserService} from "../../../../shared/services/user.service";
import {UserModel} from "../../../../shared/models/user.model";
import { FormSearchUserGroup } from 'src/app/shared/models/user-group.model';

@Component({
  selector: 'one-portal-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./create-user-group.component.less'],
})
export class UsersTableComponent implements OnInit{
  value?: string;
  listOfCurrentPageData: readonly UserModel[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<string>();
  listOfSelected: readonly any[] = []


  loading = false

  listUsers: UserModel[] = []
  countGroup: number = 0

  constructor(private userService: UserService) {
  }
  onInputChange(value: string) {
    this.value = value;
  }
  onCurrentPageDataChange(listOfCurrentPageData: readonly UserModel[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData;
    this.checked = listOfEnabledData.every(({ userName }) => this.setOfCheckedId.has(userName));
    this.indeterminate = listOfEnabledData.some(({ userName }) => this.setOfCheckedId.has(userName)) && !this.checked;
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .forEach(({ userName }) => this.updateCheckedSet(userName, checked));
    this.refreshCheckedStatus();
  }

  onItemChecked(userName: string, checked: boolean): void {
    this.updateCheckedSet(userName, checked);
    this.refreshCheckedStatus();
  }

  updateCheckedSet(userName: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(userName);
    } else {
      this.setOfCheckedId.delete(userName);
    }
    this.listOfSelected = this.listUsers.filter(data => this.setOfCheckedId.has(data.userName))
  }

  refresh() {}

  getUsers() {
    this.userService.search(new FormSearchUserGroup()).subscribe(data => {
      this.listUsers = data.records

    })
  }
  ngOnInit(): void {
    this.getUsers()
  }
}
