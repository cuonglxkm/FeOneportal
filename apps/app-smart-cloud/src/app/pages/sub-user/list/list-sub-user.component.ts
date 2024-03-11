import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RegionModel } from '../../../shared/models/region.model';
import { ProjectModel } from '../../../shared/models/project.model';
import { SubUserService } from '../../../shared/services/sub-user.service';
import { SubUser } from '../../../shared/models/sub-user.model';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-list-sub-user',
  templateUrl: './list-sub-user.component.html',
  styleUrls: ['./list-sub-user.component.less'],
})
export class ListSubUserComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string

  pageSize: number = 10
  pageIndex: number = 1

  response: BaseResponse<SubUser[]>

  isLoading: boolean = false

  isCheckBegin: boolean = false

  constructor(private router: Router,
              private subUserService: SubUserService) {
  }

  onInputChange(value) {
    this.value = value
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
    this.getListSubUsers(true)
  }


  onPageSizeChange(value) {
    this.pageSize = value

    this.getListSubUsers(false)
  }

  onPageIndexChange(value) {
    this.pageIndex = value

    this.getListSubUsers(false)
  }

  navigateToCreateSubUser() {
    this.router.navigate(['/app-smart-cloud/networks/object-storage/sub-user/create'])
  }

  getListSubUsers(isBegin) {
    this.isLoading = true
    this.subUserService.getListSubUser(this.pageSize, this.pageIndex).subscribe(data => {
      this.response = data
      this.isLoading = false

      if (isBegin) {
        this.isCheckBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
      }
    }, error => {
      this.isLoading = false
      this.response = null
    })
  }

  handleOkEdit() {
    this.getListSubUsers(false)
  }
  ngOnInit() {
  }
}
