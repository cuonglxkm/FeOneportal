import { Component, Inject, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { IpFloatingService } from '../../shared/services/ip-floating.service';
import { FormSearchIpFloating, IpFloating } from '../../shared/models/ip-floating.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseResponse, ProjectModel, RegionModel } from '../../../../../../libs/common-utils/src';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'one-portal-list-ip-floating',
  templateUrl: './list-ip-floating.component.html',
  styleUrls: ['./list-ip-floating.component.less'],
})
export class ListIpFloatingComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  customerId: number
  projectType: any;
  pageSize: number = 10
  pageIndex: number = 1

  value: string

  response: BaseResponse<IpFloating[]>

  isLoading: boolean = false

  isBegin: boolean = false

  constructor(private ipFloatingService: IpFloatingService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  refreshParams() {
    this.pageSize = 10;
    this.pageIndex = 1;
}

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    this.refreshParams();
  }

  projectChange(project: ProjectModel) {
    this.project = project.id;
    this.projectType = project.type;
    console.log(this.projectType);
    this.getData(true);
  }

  onPageSizeChange(event) {
    this.pageSize = event
    this.refreshParams();
    this.getData(false);
  }

  onPageIndexChange(event) {
    this.pageIndex = event;
    this.getData(false);
  }

  onInputChange(value){
    if(value == undefined || value == ""){
      this.value = null
    }
    this.value = value
    this.getData(false)
  }

  showModalCreateIpFloating() {

  }

  getData(isCheckBegin) {
    this.isLoading = true
    let formSearchIpFloating: FormSearchIpFloating = new FormSearchIpFloating()
    formSearchIpFloating.projectId = this.project
    formSearchIpFloating.regionId = this.region
    formSearchIpFloating.ipAddress = this.value
    formSearchIpFloating.pageSize = this.pageSize
    formSearchIpFloating.currentPage = this.pageIndex
    formSearchIpFloating.customerId = this.customerId
    this.ipFloatingService.getListIpFloating(formSearchIpFloating)
      .pipe(debounceTime(500))
      .subscribe(data => {
      this.isLoading = false
        console.log('data', data)
      this.response = data
        if (isCheckBegin) {
          this.isBegin = this.response?.records === null || this.response?.records.length < 1 ? true : false;
        }
    }, error => {
        this.isLoading = false
        this.response = null
      })
  }

  handleOkCreateIpFloating() {
    this.getData(false)
  }

  handleOkAttachIpFloating() {
    this.getData(false)
  }

  handleOkDetachIpFloating() {
    this.getData(false)
  }

  handleOkDeleteIpFloating() {
    this.getData(false)
  }

  ngOnInit() {

    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.customerId = this.tokenService.get()?.userId
    this.ipFloatingService.model.subscribe(data => {
      console.log(data)
    })
    // this.getData(true)
  }
}
