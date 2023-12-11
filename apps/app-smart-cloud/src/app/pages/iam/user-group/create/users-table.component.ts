import {Component, OnInit} from '@angular/core';
import {UserGroup} from "../list/list-user-group.component";

@Component({
  selector: 'one-portal-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./create-user-group.component.less'],
})
export class UsersTableComponent implements OnInit{
  value?: string;
  listOfData: readonly UserGroup[] = [];
  listOfCurrentPageData: readonly UserGroup[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();
  listOfSelected: readonly any[] = []

  onInputChange(value: string) {
    this.value = value;
  }
  onCurrentPageDataChange(listOfCurrentPageData: readonly UserGroup[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData;
    this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .forEach(({ id }) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
    this.listOfSelected = this.listOfData.filter(data => this.setOfCheckedId.has(data.id))
  }

  ngOnInit(): void {
    this.listOfData = new Array(10).fill(0).map((_, index) => ({
      id: index,
      name: `TT ${index}`,
      total_users: 32,
      created_at: `${index}/10/2023 1${index}:00:2${index}`,
    }));
  }
}
