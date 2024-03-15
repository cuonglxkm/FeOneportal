import { Component, OnInit } from '@angular/core';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { SubUser } from '../../shared/models/sub-user.model';
import { Router } from '@angular/router';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { getCurrentRegionAndProject } from '@shared';
import { ObjectStorageService } from '../../shared/services/object-storage.service';
import { FormSearchSummary, UserInfoObjectStorage } from '../../shared/models/object-storage.model';

@Component({
  selector: 'one-portal-dashboard-object-storage',
  templateUrl: './dashboard-object-storage.component.html',
  styleUrls: ['./dashboard-object-storage.component.less']
})
export class DashboardObjectStorageComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string;

  pageSize: number = 10;
  pageIndex: number = 1;

  response: BaseResponse<SubUser[]>;

  isLoading: boolean = false;

  isCheckBegin: boolean = false;

  userInfoObjectStorage: UserInfoObjectStorage;

  constructor(private router: Router,
              private objectStorageService: ObjectStorageService) {
  }

  onInputChange(value) {
    this.value = value;
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  getUserInfoObjectStorage() {
    this.objectStorageService.getUserInfo().subscribe(data => {
      console.log('data', data);
      this.userInfoObjectStorage = data;
    });
  }

  getSummaryObjectStorage() {
    this.getUserInfoObjectStorage()

    let formSearchSummary = new FormSearchSummary()
    formSearchSummary.uid = this.userInfoObjectStorage.user_id
    // formSearchSummary.start
  }


  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;


  }
}
