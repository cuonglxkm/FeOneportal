import { Component, OnInit } from '@angular/core';
import { RegionModel } from '../../../../shared/models/region.model';
import { ProjectModel } from '../../../../shared/models/project.model';
import { Router } from '@angular/router';

@Component({
  selector: 'one-portal-list-file-system',
  templateUrl: './list-file-system.component.html',
  styleUrls: ['./list-file-system.component.less'],
})
export class ListFileSystemComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string

  constructor(private router: Router) {
  }

  onInputChange(value) {
    this.value = value
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  navigateToCreateFileSystem() {
    this.router.navigate(['/app-smart-cloud/networks/file-storage/file-system/create'])
  }
  ngOnInit() {
  }
}
