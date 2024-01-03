import {Component, EventEmitter, Output} from '@angular/core';
import {PolicyService} from "../../../../shared/services/policy.service";
import {PolicyModel} from "../../../policy/policy.model";
import {FormSearchPolicy, FormSearchUserGroup} from 'src/app/shared/models/user-group.model';
import {UserGroupService} from "../../../../shared/services/user-group.service";
import {BaseResponse} from "../../../../../../../../libs/common-utils/src";
import {NzTableQueryParams} from "ng-zorro-antd/table";

@Component({
  selector: 'one-portal-policy-table',
  templateUrl: './policy-table.component.html',
  styleUrls: ['./create-user-group.component.less'],
})
export class PolicyTableComponent {
  @Output() listPoliciesSelected? = new EventEmitter<any>();

  value?: string;
  loading = false
  listOfCurrentPageData: readonly PolicyModel[] = [];
  checked = false;
  indeterminate = false;
  setOfCheckedId = new Set<string>();
  expandSet = new Set<string>();
  listOfSelected: readonly any[] = []

  listPolicies: PolicyModel[]
  filteredPolicies: PolicyModel[]

  response: BaseResponse<PolicyModel[]>

  form: FormSearchPolicy = new FormSearchPolicy()

  countPolicy: number = 0
  constructor(private userGroupService: UserGroupService) {
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
  onQueryParamsChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params
    this.form.pageSize = pageSize;
    this.form.currentPage = pageIndex
    this.listOfCurrentPageData = this.listPolicies
    this.getPolicies()
    this.refreshCheckedStatus()
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData;
    this.checked = listOfEnabledData?.every(({ name }) => this.setOfCheckedId.has(name));
    this.indeterminate = listOfEnabledData?.some(({ name }) => this.setOfCheckedId.has(name)) && !this.checked;
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
    this.listPoliciesSelected.emit(this.listOfSelected)
  }

  getPolicies() {
    this.loading = true
    this.userGroupService.getPolicy(this.form).subscribe(data => {
      this.response = data
      this.listPolicies = data.records
      this.filteredPolicies = data.records
      this.listOfCurrentPageData = data.records
      this.countPolicy = data.totalCount
      this.loading = false
      console.log('data', this.listPolicies)
    }, error => {
      this.response = null
      this.listPolicies = []
      this.filteredPolicies = []
    })
  }

  filterPolicies() {
    console.log(this.value);
    return this.listPolicies.filter(item => (!item || item.name.includes(this.value)))
  }

  searchPolicies() {

    console.log("a");
    this.filteredPolicies = this.filterPolicies()
  }

  sendListPoliciesSelected() {

  }

  ngOnInit(): void {
    this.getPolicies()
  }
}
