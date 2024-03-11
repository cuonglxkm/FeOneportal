import { Component, OnInit } from '@angular/core';
import { RegionModel } from '../../../../../shared/models/region.model';
import { ProjectModel } from '../../../../../shared/models/project.model';

@Component({
  selector: 'one-portal-detail-file-system',
  templateUrl: './detail-file-system.component.html',
  styleUrls: ['./detail-file-system.component.less'],
})
export class DetailFileSystemComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idWan: number
  wanName: string

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
