import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {RegionModel} from "../../../../../shared/models/region.model";
import {ProjectModel} from "../../../../../shared/models/project.model";
import {PolicyService} from "../../../../../shared/services/policy.service";
import {PolicyModel} from "../../../../policy/policy.model";
import {FormSearchPolicy, FormUserGroup, UserGroupModel} from "../../../../../shared/models/user-group.model";
import {UserGroupService} from "../../../../../shared/services/user-group.service";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import { BaseResponse } from '../../../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-create-policy',
  templateUrl: './create-policy.component.html',
  styleUrls: ['./create-policy.component.less'],
})
export class CreatePolicyComponent implements OnInit {
  nameGroup: string
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  countPolicy: number
  countPolicyByGroup: number

  value?: string
  checked = false;
  loadingCollapse = false;
  indeterminate = false;

  listOfCurrentPageData: readonly PolicyModel[] = [];
  setOfCheckedId = new Set<string>();
  expandSet = new Set<string>();

  listPolicies: PolicyModel[] = []
  listPoliciesByGroup: PolicyModel[] = []
  filteredPoliciesUnique: PolicyModel[] = []

  response: BaseResponse<PolicyModel[]>

  formSearch: FormSearchPolicy = new FormSearchPolicy()

  formCreate: FormUserGroup = new FormUserGroup()

  userGroup: UserGroupModel

    pageIndex: number = 1
    pageSize: number = 10

  isLoading: boolean = false

  constructor(private route: ActivatedRoute,
              private router: Router,
              private policyService: PolicyService,
              private userGroupService: UserGroupService,
              private notification: NzNotificationService) {
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly PolicyModel[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
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
  }

    onQueryParamsChange(params: NzTableQueryParams) {
        const {pageSize, pageIndex} = params
        this.pageSize = pageSize;
        this.pageIndex = pageIndex
        this.refreshCheckedStatus()
        this.getPolicies()
    }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData;
    this.checked = listOfEnabledData.every(({name}) => this.setOfCheckedId.has(name));
    this.indeterminate = listOfEnabledData.some(({name}) => this.setOfCheckedId.has(name)) && !this.checked;
  }

  updateCheckedSet(name: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(name);
    } else {
      this.setOfCheckedId.delete(name);
    }
  }

  onItemChecked(name: string, checked: boolean): void {
    this.updateCheckedSet(name, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .forEach(({name}) => this.updateCheckedSet(name, checked));
    this.refreshCheckedStatus();
  }

  // filterPolicies() {
  //   return this.listPoliciesUnique.filter(item => (!item || item.name.includes(this.value)))
  // }

  // searchPolicies() {
  //   this.filteredPoliciesUnique = this.filterPolicies()
  // }

  removeDuplicate(arrA, arrB) {
    return arrA.filter(itemA => !arrB.includes(itemA));
  }

  total: number = 0
  getPolicies() {
    this.isLoading = true
    let form = new FormSearchPolicy()
    if (this.value === undefined) {
      form.policyName = null
    } else {
      form.policyName = this.value
    }
    form.currentPage = 1
    form.pageSize = 9999
    this.userGroupService.getPolicy(form).subscribe(data => {
      this.isLoading = false
      console.log(data.records)
      this.total = data.totalCount
      this.listPolicies = data.records
      // this.listOfCurrentPageData = data.records
    })
  }
  getPoliciesByGroup() {
    this.loadingCollapse = true
    this.formSearch.currentPage = 1
    this.formSearch.pageSize = 9999
    this.formSearch.groupName = this.nameGroup
    this.userGroupService.getPoliciesByGroupName(this.formSearch).subscribe(data => {
      this.loadingCollapse = false
      this.response = data
      this.listPoliciesByGroup = data.records
      this.listPoliciesByGroup.forEach(item => {
        this.setOfCheckedId.add(item.name)
      })
    })
    console.log('list policies', this.listPoliciesByGroup)
  }

  getGroup() {
    this.userGroupService.detail(this.nameGroup).subscribe(data => {
      this.userGroup = data
    })
  }

  goBack() {
    this.router.navigate(['/app-smart-cloud/iam/user-group/' + this.nameGroup])
  }

  create() {
    this.formCreate.groupName = this.nameGroup
    this.formCreate.parentName = this.userGroup.parent

    this.formCreate.policyNames = Array.from(this.setOfCheckedId)
    if (this.formCreate.policyNames?.length > 10) {
      this.notification.warning('', 'Không được gắn quá 10 policies')
    } else {
      this.userGroupService.createOrEdit(this.formCreate).subscribe(data => {
        this.notification.success('Thành công', 'Thêm policy thành công')
        this.router.navigate(['/app-smart-cloud/iam/user-group/' + this.nameGroup])
      }, error => {
        this.notification.error('Thất bại', 'Thêm policy thất bại')
      })
    }
  }


  ngOnInit() {
    this.nameGroup = this.route.snapshot.paramMap.get('groupName')
    console.log(this.nameGroup)
    this.getPoliciesByGroup()
    this.getPolicies()
    this.getGroup()
    // this.getPoliciesUnique()
  }

}
