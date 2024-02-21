import {Component, Inject, OnInit} from '@angular/core';
import {IpPublicService} from "../../shared/services/ip-public.service";
import {RegionModel} from "../../shared/models/region.model";
import {ProjectModel} from "../../shared/models/project.model";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {IpPublicModel} from "../../shared/models/ip-public.model";
import {Router} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {InstancesService} from "../instances/instances.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {finalize} from "rxjs/operators";
import {NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  selector: 'one-portal-ip-public',
  templateUrl: './ip-public.component.html',
  styleUrls: ['./ip-public.component.less'],
})
export class IpPublicComponent implements OnInit {
  regionId = JSON.parse(localStorage.getItem('region')).regionId;
  projectId = JSON.parse(localStorage.getItem('projectId'));
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
  instanceSelected;
  loadingAtt = true;
  disableAtt = true;
  id: any;



  statusData = [
    {name: 'Tất cả trạng thái', value: ''},
    {name: 'Khởi tạo', value: '0'},
    {name: 'Đang sử dụng', value: '2'}];
  actionData = ['Gắn Ip Pulbic', 'Gỡ Ip Pulbic', 'Xóa'];

  constructor(private service: IpPublicService, private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private instancService: InstancesService,
              private notification: NzNotificationService,) {

  }

  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '600px',
  };
  loading = false;

  ngOnInit(): void {
    this.service.model.subscribe(data => {
      console.log(data)
    })
  }

  getData(isCheckBegin: boolean): void {
    this.loading = true;
    this.service.getData(this.ipAddress, this.selectedStatus, this.tokenService.get()?.userId, this.projectId, this.regionId, this.isCheckState, this.size, this.index)
      .pipe(finalize(() => this.loading = false))
      .subscribe(baseResponse => {
        this.listOfIp = baseResponse.records;

        if (isCheckBegin) {
          this.isBegin = this.listOfIp === null || this.listOfIp.length < 1 ? true : false;
        }
      });
  }

  search(inputSearch: any) {
    if (inputSearch !== null) {
      this.ipAddress = inputSearch;
    }
    this.getData(false);
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.refreshParams();
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
  }

  openIpMounted(event: any, id: any) {
      this.id = id;
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
        this.isVisibleDelete = true;
      } else if (event === 'Gia Hạn Ip Pulbic') {
        this.router.navigate(['/app-smart-cloud/ip-public/extend/' + id]);
      }
  }

  openIpRemove() {
    const request = {
      id: this.id
    }
    this.service.attachIpPublic(request).subscribe(
      {
        next: post => {
          this.notification.success('Thành công', 'Xóa thành công Ip Public')
        },
        error: e => {
          this.notification.error('Thất bại', 'Xóa thất bại Ip Public')
        },
      }
    )
    this.isVisibleRemove = false;
    this.refreshParams();
    this.getData(true);
  }

  openIpDelete() {
    this.service.remove(this.id)
      .pipe(finalize(() => {this.getData(true);}))
      .subscribe(
      {
        next: post => {
          this.notification.success('Thành công', 'Xóa thành công Ip Public')
        },
        error: e => {
          this.notification.error('Thất bại', 'Xóa thất bại Ip Public')
        },
      }
    )
    this.isVisibleDelete = false;
    this.refreshParams();

  }

  Mounted() {
    // call api
    const request = {
      id: this.id,
      attachedVmId: this.instanceSelected,
    }

    this.service.attachIpPublic(request).subscribe(
      {
        next: post => {
          this.notification.success('Thành công', 'Gắn thành công Ip Public')
        },
        error: e => {
          this.notification.error('Thất bại', 'Gắn thất bại IP Public')
        },
      }
    )
    this.isVisibleMounted = false;
    this.refreshParams();
    this.getData(true);
  }

  refreshParams() {
    this.size = 10;
    this.index = 1;
    this.total = 0;
    this.ipAddress = '';
  }

    protected readonly navigator = navigator;
}
