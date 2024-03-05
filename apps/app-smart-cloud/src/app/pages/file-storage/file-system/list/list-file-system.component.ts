import { Component, OnInit } from '@angular/core';
import { RegionModel } from '../../../../shared/models/region.model';
import { ProjectModel } from '../../../../shared/models/project.model';

@Component({
  selector: 'one-portal-list-file-system',
  templateUrl: './list-file-system.component.html',
  styleUrls: ['./list-file-system.component.less'],
})
export class ListFileSystemComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  constructor() {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }
  ngOnInit() {
  }
}
