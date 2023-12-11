import { Component } from '@angular/core';

@Component({
  selector: 'one-portal-policy-table',
  templateUrl: './policy-table.component.html',
  styleUrls: ['./create-user-group.component.less'],
})
export class PolicyTableComponent {
  value?: string;
  listOfData: readonly any[] = [];
  listOfCurrentPageData: readonly [] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<number>();
  expandSet = new Set<number>();
  listOfSelected: readonly any[] = []

  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  onInputChange(value: string) {
    this.value = value;
  }
  onCurrentPageDataChange(listOfCurrentPageData: readonly []): void {
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
    this.listOfData = [
      {
        id: 1,
        name: 'Administrator Access',
        type: 'Portal managed',
        desc: 'Provides full access to Portal Services',
        config: {}
      },
      {
        id: 2,
        name: 'Portal_1',
        type: 'Customer managed',
        desc: 'Provides read-only access to Portal Services',
        config: {}
      },
      {
        id: 3,
        name: 'Portal_1',
        type: 'Portal managed',
        desc: 'Provides full access to Resource Group',
        config: {}
      }
    ];
  }
}
