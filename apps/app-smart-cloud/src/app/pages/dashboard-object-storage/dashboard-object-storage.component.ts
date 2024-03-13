import { Component, OnInit } from '@angular/core';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { SubUser } from '../../shared/models/sub-user.model';
import { Router } from '@angular/router';
import { SubUserService } from '../../shared/services/sub-user.service';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';

@Component({
  selector: 'one-portal-dashboard-object-storage',
  templateUrl: './dashboard-object-storage.component.html',
  styleUrls: ['./dashboard-object-storage.component.less'],
})
export class DashboardObjectStorageComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string

  pageSize: number = 10
  pageIndex: number = 1

  response: BaseResponse<SubUser[]>

  isLoading: boolean = false

  isCheckBegin: boolean = false

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

   ngOnInit() {
   }
}
