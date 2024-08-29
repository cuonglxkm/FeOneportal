import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { IpFloatingService } from '../../shared/services/ip-floating.service';
import { FormSearchIpFloating, IpFloating } from '../../shared/models/ip-floating.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseResponse, ProjectModel, RegionModel } from '../../../../../../libs/common-utils/src';
import { debounceTime, Subject } from 'rxjs';
import { TimeCommon } from '../../shared/utils/common';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { da } from 'date-fns/locale';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PolicyService } from 'src/app/shared/services/policy.service';

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
  searchDelay = new Subject<boolean>();
  isCreateOrder: boolean = false;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private ipFloatingService: IpFloatingService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private policyService: PolicyService) {
  }

  refreshParams() {
    this.pageSize = 10;
    this.pageIndex = 1;
}

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.refreshParams();
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChange(project: ProjectModel) {
    this.project = project.id;
    this.projectType = project.type;
    console.log(this.projectType);
    this.value = '';
    this.getData(true);
    this.isCreateOrder = this.policyService.hasPermission("order:Create") &&
      this.policyService.hasPermission("ippublic:IpPublicListSubnet") &&
      this.policyService.hasPermission("product:Search") &&
      this.policyService.hasPermission("order:GetOrderAmount") &&
      this.policyService.hasPermission("offer:Search");
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
        if(error.status == 403){
          this.notification.error(
            error.statusText,
            this.i18n.fanyi('app.non.permission')
          );
        } else {
          this.notification.error(
            error.statusText,
            this.i18n.fanyi('app.notify.get.list.ip.floating')
          );
        }
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
    this.getData(true)
  }

  ngOnInit() {

    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.customerId = this.tokenService.get()?.userId
    this.ipFloatingService.model.subscribe(data => {
      console.log(data)
    })
    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {
      this.getData(false);
    });
    // this.getData(true)
  }

  protected readonly da = da;

  getSuspendedReason(suspendReason: any) {
    switch (suspendReason) {
      case "CHAMGIAHAN":
        return this.i18n.fanyi('app.status.low-renew')
      case "":
      default:
        break;
    }
  }
}
