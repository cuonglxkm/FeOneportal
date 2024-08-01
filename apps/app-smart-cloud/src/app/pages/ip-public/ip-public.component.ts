import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {IpPublicService} from "../../shared/services/ip-public.service";
import {BaseResponse, ProjectModel, RegionModel} from "../../../../../../libs/common-utils/src";
import {IpPublicModel} from "../../shared/models/ip-public.model";
import {Router} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {InstancesService} from "../instances/instances.service";
import {finalize} from "rxjs/operators";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {getCurrentRegionAndProject} from "@shared";
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { TimeCommon } from '../../shared/utils/common';
import { debounceTime, Subject } from 'rxjs';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { error } from 'console';

@Component({
  selector: 'one-portal-ip-public',
  templateUrl: './ip-public.component.html',
  styleUrls: ['./ip-public.component.less'],
})
export class IpPublicComponent implements OnInit {
  regionId: number;
  projectId: number;
  projectType = 0;
  listOfIp: IpPublicModel[] = [];
  checkEmpty: IpPublicModel[] = [];
  isBegin: Boolean = false;
  size = 10;
  index: number = 1;
  total: number = 0;
  baseResponse: BaseResponse<IpPublicModel[]>;
  ipAddress: any = '';
  isCheckState: any = true;
  actionIp: any;
  // selectedAction = 'Gắn Ip Pulbic';
  selectedStatus = '';
  isVisibleMounted: boolean = false;
  isVisibleRemove: boolean = false;
  isVisibleDelete: boolean = false;
  listInstance: any[];
  instanceSelected = '';
  loadingAtt = true;
  disableAtt = true;
  id: any;
  instanceName: any;
  searchDelay = new Subject<boolean>();
  statusData = [
    {name: this.i18n.fanyi('app.status.all'), value: ''},
    {name: this.i18n.fanyi('app.status.running'), value: 'KHOITAO'},
    {name: this.i18n.fanyi('app.suspend'), value: 'TAMNGUNG'}];
  disableDelete = true;
  ipAddressDelete = '';
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(private service: IpPublicService, private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private instancService: InstancesService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) {
  }

  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '600px',
  };
  loading = false;

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.projectId = regionAndProject.projectId;
    this.instancService.getAllIPSubnet(this.regionId)
    this.service.model.subscribe(data => {
      console.log(data)
    })
    this.getData(true);
    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe((isStart: boolean) => {
      this.getData(isStart);
    });
  }

  getData(isCheckBegin: boolean): void {
    this.loading = true;
    this.service.getData(this.ipAddress, this.selectedStatus, this.tokenService.get()?.userId, this.projectId, this.regionId, this.isCheckState, this.size, this.index)
      .pipe(finalize(() => this.loading = false))
      .subscribe(baseResponse => {
        this.listOfIp = baseResponse.records;
        this.total = baseResponse.totalCount;
        if (isCheckBegin) {
          this.isBegin = this.listOfIp === null || this.listOfIp.length < 1 ? true : false;
        }
      });
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.refreshParams();
  }

  onRegionChanged(region: RegionModel) {
    this.regionId = region.regionId;
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
    this.projectType = project.type;
    this.getData(true);
  }

  onPageSizeChange(event: any) {
    this.size = event
    this.refreshParams();
    this.getData(false);
  }

  onPageIndexChange(event: any) {
    this.index = event;
    this.getData(false);
  }
  // navigatorToDetail(id: number){
  //   this.router.navigate(['/app-smart-cloud/ip-public/detail/'+id]);
  // }

  createIp() {
    this.router.navigate(['/app-smart-cloud/ip-public/create']);
  }

  handleCancel() {
    this.isVisibleMounted = false;
    this.isVisibleRemove = false;
    this.isVisibleDelete = false;
    this.instanceSelected = '';
    this.isSelected = false;
    this.nameDelete = '';
  }

  openIpMounted(event: any, item: any) {
      this.id = item.id;
      this.instanceName = item.attachedVm;
      if (event === 'Gắn Ip Pulbic') {
        this.instancService.search(1, 999, this.regionId, this.projectId, '', '',true, this.tokenService.get()?.userId)
          .pipe(finalize(() => {
            this.loadingAtt = false;
            this.disableAtt = false;
          }))
          .subscribe(
          (data) => {
            this.listInstance = data.records;
          }
        );
        this.isVisibleMounted = true;
      } else if (event === 'Gỡ Ip Pulbic') {
        this.isVisibleRemove = true;
      } else if (event === 'Xóa') {
        if (item.ipAddress === null || item.ipAddress === '') {
          this.ipAddressDelete = item.iPv6Address
        } else {
          this.ipAddressDelete = item.ipAddress
        }
        this.isVisibleDelete = true;
      } else if (event === 'Gia hạn Ip Pulbic') {
        this.router.navigate(['/app-smart-cloud/ip-public/extend/' + item.id]);
      }
  }

  openIpRemove() {
    this.loading = true;
    const request = {
      id: this.id
    }
    this.service.attachIpPublic(request)
      .pipe(finalize(() => {this.getData(false);}))
      .subscribe(
      {
        next: post => {
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.detach.success') + ' IP Public')
        },
        error: e => {
          if(e && e.error && e.error.detail && e.error.detail === "VM need a IP"){
            this.notification.warning(this.i18n.fanyi('app.status.warning'), this.i18n.fanyi('app.instances') + ' ' + this.instanceName + ' '
              + this.i18n.fanyi('app.ip.public.attach.warning'));
          } else {
            this.notification.error(this.i18n.fanyi('app.status.fail'), e.error.message)
          }
        },
      }
    )
    this.isVisibleRemove = false;
    this.refreshParams();
    this.getData(true);
  }

  openIpDelete() {
    this.loading = true;
    this.service.remove(this.id)
      .pipe(finalize(() => {
        this.getData(true);
        this.nameDelete = '';
      }))
      .subscribe(
      {
        next: post => {
          this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.delete.success'))
        },
        error: e => {
          if(e && e.error && e.error.detail && e.error.detail === "VM need a IP"){
            this.notification.warning(this.i18n.fanyi('app.status.warning'), this.i18n.fanyi('app.instances') + ' ' + this.instanceName + ' '
              + this.i18n.fanyi('app.ip.public.attach.warning'));
          } else {
            this.notification.error(this.i18n.fanyi('app.status.fail'), e.error.message)
          }
        },
      }
    )
    this.isVisibleDelete = false;
    this.refreshParams();

  }

  Mounted() {
    if (this.instanceSelected != '') {
      this.loading = true;
      // call api
      const request = {
        id: this.id,
        attachedVmId: this.instanceSelected,
      }

      this.service.attachIpPublic(request)
        .pipe(finalize(() => {
          this.instanceSelected = '';
          this.refreshParams();
          this.getData(true);
        }))
        .subscribe(
          {
            next: post => {
              this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.attach.success') + ' IP Public')
            },
            error: e => {
              this.notification.error(this.i18n.fanyi('app.status.fail'), e.error.message)
            },
          }
        )
      this.isVisibleMounted = false;
      this.isSelected = false;
    } else {
      this.isSelected = true;
    }

  }

  refreshParams() {
    this.size = 10;
    this.index = 1;
    this.total = 0;
    this.ipAddress = '';
  }

    protected readonly navigator = navigator;
  isSelected = false;
  nameDelete: any;

  confirmNameDelete(event: any) {
    if (event == this.ipAddressDelete) {
      this.disableDelete = false;
    } else {
      this.disableDelete = true;
    }
  }

  openIpDeleteCf() {
    if (this.disableDelete == false) {
      this.openIpDelete();
    }
  }

  getSuspendedReason(suspendReason: any) {
    switch (suspendReason) {
      case "CHAMGIAHAN":
        return this.i18n.fanyi('app.status.low-renew')
      case "VIPHAMDIEUKHOAN":
        return this.i18n.fanyi('service.status.violation')
      default:
        break;
    }
  }
}
