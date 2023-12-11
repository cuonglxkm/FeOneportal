import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {Router} from "@angular/router";

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
export class ListUserGroupComponent implements OnInit, OnChanges{

  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));
  value?: string;
  protected readonly console = console;
  //fake data
  checked = false;
  loading = false;
  indeterminate = false;
  listOfData: readonly UserGroup[] = [];
  listOfCurrentPageData: readonly UserGroup[] = [];
  setOfCheckedId = new Set<number>();

  isVisibleDelete: boolean = false
  deleteList: readonly UserGroup[] = [];

  constructor( private router: Router) {
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

  onCurrentPageDataChange(listOfCurrentPageData: readonly UserGroup[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData;
    this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
        .forEach(({ id }) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }

  showModalDelete(){
    this.deleteList = this.listOfData.filter(data => this.setOfCheckedId.has(data.id))
  }

  handleOkDelete(){
    console.log('value',)
    this.deleteList = []
  }

  handleCancelDelete(){
    this.deleteList = []
  }

  getData() {
    this.listOfData = new Array(10).fill(0).map((_, index) => ({
      id: index,
      name: `TT ${index}`,
      total_users: 32,
      created_at: `${index}/10/2023 1${index}:00:2${index}`,
    }));
    this.loading = false
  }
  ngOnInit(): void {
    this.loading = true
    setTimeout(() => {
      this.getData();
    }, 2000);
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

  protected readonly length = length;
}
