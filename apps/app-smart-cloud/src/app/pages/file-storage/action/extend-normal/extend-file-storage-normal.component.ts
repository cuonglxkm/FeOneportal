import { Component, OnInit } from '@angular/core';
import { RegionModel } from '../../../../shared/models/region.model';
import { ProjectModel } from '../../../../shared/models/project.model';
import { Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';

@Component({
  selector: 'one-portal-extend-file-storage-normal',
  templateUrl: './extend-file-storage-normal.component.html',
  styleUrls: ['./extend-file-storage-normal.component.less'],
})
export class ExtendFileStorageNormalComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  constructor(private router: Router) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/file-storage/file-system/list']);
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
  }
}
