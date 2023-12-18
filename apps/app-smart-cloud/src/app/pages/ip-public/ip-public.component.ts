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

@Component({
  selector: 'one-portal-ip-public',
  templateUrl: './ip-public.component.html',
  styleUrls: ['./ip-public.component.less'],
})
export class IpPublicComponent implements OnInit {
  regionId: number;
  projectId: number;
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
  selectedAction = 'Gắn Ip Pulbic';
  selectedStatus = '';
  isVisibleMounted: boolean = false;
  isVisibleRemove: boolean = false;
  isVisibleDelete: boolean = false;
  listInstance: any[];
  instanceSelected;
  id: any;

  statusData = [
    {name: 'Tất cả trạng thái', value: ''},
    {name: 'Khởi tạo', value: '0'},
    {name: 'Đang sử dụng', value: '2'}];
  actionData = ['Gắn Ip Pulbic', 'Gỡ Ip Pulbic', 'Xóa'];

  constructor(private service: IpPublicService, private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private instancService: InstancesService,
              private message: NzMessageService,) {

  }

  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '1000px',
  };
  loading = false;

  ngOnInit(): void {
    this.service.model.subscribe(data => {
      console.log(data)
    })
  }

  getData(): void {
    this.loading = true;
    this.service.getData(this.ipAddress, this.selectedStatus, this.tokenService.get()?.userId, this.regionId, this.isCheckState, this.size, this.index)
      .pipe(finalize(() => this.loading = false))
      .subscribe(baseResponse => {
        this.listOfIp = baseResponse.records;
        console.log(this.listOfIp);
      });
    // this.service.getTest()
    //   .subscribe(baseResponse => {
    //   this.listOfIp = baseResponse.records;
    //     console.log(this.listOfIp);
    // });
  }

  search(inputSearch: any) {
    if (inputSearch !== null) {
      this.ipAddress = inputSearch;
    }
    this.getData();
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.getData();
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  onPageSizeChange(event: any) {
    this.size = event
    this.getData();
  }

  onPageIndexChange(event: any) {
    this.index = event;
    this.getData();
  }

  createIp() {
    this.router.navigate(['/app-smart-cloud/ip-public/create']);
  }

  handleCancel() {
    this.isVisibleMounted = false;
    this.isVisibleRemove = false;
    this.isVisibleDelete = false;
  }

  openIpMounted(event: any, id: any) {
    if (event == false) {
      this.id = id;
      if (this.selectedAction === 'Gắn Ip Pulbic') {
        this.instancService.search(1, 999, this.regionId, '', '', this.tokenService.get()?.userId).subscribe(
          (data) => {
            this.listInstance = data.records;
          }
        );
        this.isVisibleMounted = true;
      } else if (this.selectedAction === 'Gỡ Ip Pulbic') {
        this.isVisibleRemove = true;
      } else if (this.selectedAction === 'Xóa') {
        this.isVisibleDelete = true;
      }
    }

  }

  openIpRemove() {
    const request = {
      id: this.id
    }
    this.service.attachIpPublic(request).subscribe(
      {
        next: post => {
          this.message.create('success', `Xóa thành công Ip Public`);
        },
        error: e => {
          this.message.create('error', `Xóa thất bại Ip Public`);
        },
      }
    )
    this.isVisibleRemove = false;
    this.getData();
  }

  openIpDelete() {
    this.service.remove(this.id).subscribe(
      {
        next: post => {
          this.message.create('success', `Xóa thành công Ip Public`);
        },
        error: e => {
          this.message.create('error', `Xóa thất bại Ip Public`);
        },
      }
    )
    this.isVisibleDelete = false;
    this.getData();
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
          this.message.create('success', 'Gắn thành công Ip Public');
        },
        error: e => {
          this.message.create('error',  'Gắn thất bại IP Public');
        },
      }
    )
    this.isVisibleMounted = false;
    this.getData();
  }
}
