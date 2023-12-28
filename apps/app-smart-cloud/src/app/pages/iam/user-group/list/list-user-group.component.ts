import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {Router} from "@angular/router";
import {UserGroupService} from "../../../../shared/services/user-group.service";
import {FormSearchUserGroup, UserGroupModel} from "../../../../shared/models/user-group.model";
import Pagination from "../../../../shared/models/pagination";

export interface UserGroup {
  id: number;
  name: string;
  total_users: number;
  created_at: string;
}

@Component({
  selector: 'one-portal-list-user-group',
  templateUrl: './list-user-group.component.html',
  styleUrls: ['./list-user-group.component.less'],
})
export class ListUserGroupComponent implements OnInit, OnChanges {

  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  value?: string;

  checked = false
  loading = false
  indeterminate = false
  collection: Pagination<UserGroupModel> = {
    previousPage: 0,
    totalCount: 0,
    records: [],
    currentPage: 1,
    pageSize: 10
  };

  listOfCurrentPageData: UserGroupModel[] = []

  pageSize: number = 10
  pageIndex: number = 1
  setOfCheckedId = new Set<string>();
  form: FormSearchUserGroup = new FormSearchUserGroup()

  isVisibleDelete: boolean = false
  deleteList: UserGroupModel[] = [];
  nameList: string[]

  countUser: number

  constructor(private router: Router,
              private userGroupService: UserGroupService) {
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
    this.getData()
  }

  onCurrentPageDataChange(listOfCurrentPageData: UserGroupModel[]): void {
    // const {pageSize, pageIndex} = params
    // this.form.currentPage = pageIndex
    // this.form.pageSize = pageSize
    // this.form.name = this.value
    this.listOfCurrentPageData = listOfCurrentPageData;
    // this.getData(this.form)
    this.refreshCheckedStatus();
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

  showModalDelete() {
    this.deleteList = this.collection.records.filter(data => this.setOfCheckedId.has(data.name))
    console.log('delete', this.deleteList)
  }

  handleOkDelete() {
    console.log('value')
    this.deleteList = []
    this.getData()

  }

  handleCancelDelete() {
    this.deleteList = []
  }

  getData() {
    console.log('begin')
    this.loading = true
    if(this.value) {
      this.form.name = this.value
    } else {
      this.form.name = ''
    }
    this.userGroupService.search(this.form).subscribe(data => {
      this.collection = data
      console.log('data', this.collection)

      this.getCount()
      this.loading = false
    }, error => {
      this.collection = null
    })
  }


  getCount() {
    if (this.collection.records == null || this.collection.records.length == 0)
      return
    let listGroup = this.collection.records;
    listGroup.forEach(item => {
      this.userGroupService
        .getUserByGroup(item.name, 9999, 1)
        .subscribe(data => {
          listGroup.forEach(group => {
            if (group.name == item.name)
              group.userOfGroup = data.totalCount
          })
        })
    })
    console.log(listGroup)
  }

  ngOnInit(): void {
    this.form.currentPage = 1
    this.form.pageSize = 10

    this.getData()
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/iam/user-group/create'])
  }

  refresh() {
    this.loading = true
    setTimeout(() => {
      this.getData();
    }, 2000);
  }
}
