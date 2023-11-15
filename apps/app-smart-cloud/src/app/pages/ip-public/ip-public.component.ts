import {Component, OnInit} from '@angular/core';
import {IpPublicService} from "../../shared/services/ip-public.service";
import {RegionModel} from "../../shared/models/region.model";
import {ProjectModel} from "../../shared/models/project.model";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {IpPublicModel} from "../../shared/models/ip-public.model";
import {Router} from "@angular/router";

@Component({
  selector: 'one-portal-ip-public',
  templateUrl: './ip-public.component.html',
  styleUrls: ['./ip-public.component.less'],
})
export class IpPublicComponent implements OnInit{
  regionId: number;
  projectId: number;
  listOfIp: IpPublicModel[] = [];
  checkEmpty: IpPublicModel[] = [];
  isBegin: Boolean = false;
  size = 10;
  index: number = 0;
  total: number = 0;
  baseResponse: BaseResponse<IpPublicModel[]>;
  ipAddress: any = '';
  status: any = 0;
  customerId: any = 669;
  isCheckState: any = false;
  actionIp: any;
  selectedAction = 'Gắn Ip Pulbic';
  selectedStatus = 'Tất cả trạng thái';
  isVisibleMounted: boolean = false;
  isVisibleRemove: boolean = false;
  isVisibleDelete: boolean = false;
  id : any;

  statusData = ['Tất cả trạng thái','Gắn Ip Pulbic', 'Gỡ Ip Pulbic', 'Xóa'];
  actionData = ['Gắn Ip Pulbic', 'Gỡ Ip Pulbic', 'Xóa'];
  constructor(private service: IpPublicService, private router: Router) {

  }

  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '1000px',
  };

  ngOnInit(): void {
    this.service.model.subscribe(data => {
        console.log(data)
    })
    this.getData();
  }

  ngOnChange(): void{
    if (this.actionIp === 0) {
      this.isVisibleMounted = true;
    } else if (this.actionIp === 1) {

    } else if (this.actionIp === 2) {

    }
  }
  getData(): void {
    // this.service.getData(this.ipAddress, this.status, this.customerId, this.regionId, this.isCheckState, this.size, this.index)
    //   .subscribe(baseResponse => {
    //   this.listOfIp = baseResponse.records;
    //     console.log(this.listOfIp);
    // });
    this.service.getTest()
      .subscribe(baseResponse => {
      this.listOfIp = baseResponse.records;
        console.log(this.listOfIp);
    });
  }

  search(search: string) {
    console.log(search);
    // this.searchKey = search;
    // this.getSshKeys();
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    // this.getSshKeys();
  }

  projectChange(project: ProjectModel) {
    this.projectId = project.id;
    // this.getSshKeys();
  }

  onPageSizeChange(event: any) {
    // this.size = event
    // this.getSshKeys();
  }

  onPageIndexChange(event: any) {
    // this.index = event;
    // this.getSshKeys();
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
        this.isVisibleMounted = true;
      } else if (this.selectedAction === 'Gỡ Ip Pulbic') {
        this.isVisibleRemove = true;
      } else if (this.selectedAction === 'Xóa') {
        this.isVisibleDelete = true;
      }
    }

  }

  openIpRemove(id: any) {
    this.id = id;
    this.isVisibleRemove = true;
  }

  openIpDelete(id: any) {
    this.id = id;
    this.isVisibleDelete = true;
  }

  Mounted() {
    // call api
    this.isVisibleMounted = false;
  }
}
