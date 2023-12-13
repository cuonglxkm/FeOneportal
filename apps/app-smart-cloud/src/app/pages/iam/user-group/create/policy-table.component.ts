import { Component } from '@angular/core';
import {PolicyService} from "../../../../shared/services/policy.service";
import {PolicyModel} from "../../../policy/policy.model";
import { FormSearchUserGroup } from 'src/app/shared/models/user-group.model';

@Component({
  selector: 'one-portal-policy-table',
  templateUrl: './policy-table.component.html',
  styleUrls: ['./create-user-group.component.less'],
})
export class PolicyTableComponent {
  value?: string;
  loading = false
  listOfCurrentPageData: readonly [] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<string>();
  expandSet = new Set<string>();
  listOfSelected: readonly any[] = []

  listPolicies: PolicyModel[]
  constructor(private policyService: PolicyService) {
  }
  onExpandChange(name: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(name);
    } else {
      this.expandSet.delete(name);
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
    this.checked = listOfEnabledData.every(({ name }) => this.setOfCheckedId.has(name));
    this.indeterminate = listOfEnabledData.some(({ name }) => this.setOfCheckedId.has(name)) && !this.checked;
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .forEach(({ name }) => this.updateCheckedSet(name, checked));
    this.refreshCheckedStatus();
  }

  onItemChecked(name: string, checked: boolean): void {
    this.updateCheckedSet(name, checked);
    this.refreshCheckedStatus();
  }

  updateCheckedSet(name: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(name);
    } else {
      this.setOfCheckedId.delete(name);
    }
    this.listOfSelected = this.listPolicies.filter(data => this.setOfCheckedId.has(data.name))
  }

  getPolicies() {
    this.loading = true
    this.policyService.getPolicy(new FormSearchUserGroup()).subscribe(data => {
      this.listPolicies = data.records
      this.loading = false
      console.log('data', this.listPolicies)
    })
  }
  refresh(){}

  ngOnInit(): void {
    this.getPolicies()
  }

  protected readonly JSON = JSON;
}
