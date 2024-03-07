import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RegionModel } from '../../../shared/models/region.model';
import { ProjectModel } from '../../../shared/models/project.model';

@Component({
  selector: 'one-portal-list-sub-user',
  templateUrl: './list-sub-user.component.html',
  styleUrls: ['./list-sub-user.component.less'],
})
export class ListSubUserComponent implements OnInit {
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

  navigateToCreateSubUser() {
    this.router.navigate(['/app-smart-cloud/networks/object-storage/sub-user/create'])
  }
  ngOnInit() {
  }
}
