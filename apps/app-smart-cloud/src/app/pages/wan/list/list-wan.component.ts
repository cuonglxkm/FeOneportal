import { Component, OnInit } from '@angular/core';
import { RegionModel } from '../../../shared/models/region.model';
import { ProjectModel } from '../../../shared/models/project.model';

@Component({
  selector: 'one-portal-list-wan',
  templateUrl: './list-wan.component.html',
  styleUrls: ['./list-wan.component.less'],
})
export class ListWanComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  pageSize: number = 10
  pageIndex: number = 1

  value: string

  constructor() {
  }

  refreshParams() {
    this.pageSize = 10;
    this.pageIndex = 1;
  }

  onInputChange(value) {
    this.value = value
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    this.refreshParams();
  }

  projectChange(project: ProjectModel) {
    this.project = project.id;
    // this.projectType = project.type;
    // this.getData(true);
  }

  handleOkCreateWan() {

  }

  ngOnInit() {
  }
}
