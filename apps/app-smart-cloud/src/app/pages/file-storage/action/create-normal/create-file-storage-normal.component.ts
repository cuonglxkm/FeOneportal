import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { RegionModel } from '../../../../shared/models/region.model';
import { ProjectModel } from '../../../../shared/models/project.model';

@Component({
  selector: 'one-portal-create-file-storage-normal',
  templateUrl: './create-file-storage-normal.component.html',
  styleUrls: ['./create-file-storage-normal.component.less']
})
export class CreateFileStorageNormalComponent implements OnInit {
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
