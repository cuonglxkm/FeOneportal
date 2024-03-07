import { Component, Inject, OnInit } from '@angular/core';
import { RegionModel } from '../../../shared/models/region.model';
import { ProjectModel } from '../../../shared/models/project.model';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FormSearch, WanIP } from '../../../shared/models/wan.model';
import { WanService } from '../../../shared/services/wan.service';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';
import { getCurrentRegionAndProject } from '@shared';

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

  customerId: number

  value: string

  response: BaseResponse<WanIP[]>

  isCheckBegin: boolean = false

  isLoading: boolean = false

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private wanService: WanService) {
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
    this.getListWanIps(true)
  }

  onPageSizeChange(value) {
    this.pageSize = value
    this.getListWanIps(false)
  }

  onPageIndexChange(value) {
    this.pageIndex = value
    this.getListWanIps(false)
  }

  handleOkCreateWan() {
    this.getListWanIps(false)
  }

  getListWanIps(isBegin) {
    this.isLoading = true
    let formSearch = new FormSearch()
    formSearch.customerId = this.customerId
    formSearch.regionId = this.region
    formSearch.projectId = this.project
    formSearch.ipAddress = this.value
    formSearch.pageSize = this.pageSize
    formSearch.currentPage = this.pageIndex
    this.wanService.search(formSearch).subscribe(data => {
      this.isLoading = false
      console.log('data list wan', data)
      this.response = data

      if (isBegin) {
        this.isCheckBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
      }
    })
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    console.log('project', this.project);
    this.customerId = this.tokenService.get()?.userId;
    this.wanService.model.subscribe(data => {
      console.log(data);
    });
  }
}
