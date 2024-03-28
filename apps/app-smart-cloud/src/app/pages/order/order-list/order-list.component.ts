import { Component, Inject, OnInit } from '@angular/core';
import { RegionModel } from '../../../shared/models/region.model';
import { ProjectModel } from '../../../shared/models/project.model';
import { Router } from '@angular/router';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { SnapshotVolumeService } from '../../../shared/services/snapshot-volume.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { PopupAddVolumeComponent } from '../../volume/component/popup-volume/popup-add-volume.component';
import { OrderService } from '../../../shared/services/order.service';
import {getCurrentRegionAndProject} from "@shared";

@Component({
  selector: 'one-portal-list-order',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.less']
})
export class OrderListComponent implements OnInit {

  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  searchStatus?: number = null;
  searchName?: string;

  status = [
    { label: 'Tất cả', value: null },
    { label: 'Tạo mới ', value: 1 },
    { label: 'Đã thanh toán', value: 2 },
    { label: 'Đang khởi tạo dịch vụ ', value: 3 },
    { label: 'Hoàn thành ', value: 4 },
    { label: 'Đã hủy', value: 5 }
  ];

  orderCode: string;
  fromDate: Date;
  toDate: Date;

  date: any;
  pageSize: number = 5;
  currentPage: number = 1;
  listOfData: any;
  totalData: number;
  isLoadingEntities: boolean;
  customerID: number;

  value?: string;
  actionSelected: number;
  isVisibleError: boolean = false
  onQueryParamsChange(params: NzTableQueryParams) {
    const { pageSize, pageIndex } = params;
    this.pageSize = pageSize;
    this.currentPage = pageIndex;
    this.searchSnapshotScheduleList();
  }

  searchSnapshotScheduleList() {
    this.doGetSnapSchedules(this.pageSize, this.currentPage, this.orderCode,
      null, null, null, null, null, null, this.fromDate, this.toDate, this.searchStatus);
  }

  private doGetSnapSchedules(pageSize: number,
                             pageNumber: number,
                             orderCode: string,
                             saleDept: string,
                             saleDeptCode: string,
                             seller: string,
                             ticketCode: string,
                             dSubscriptionNumber: string,
                             dSubscriptionType: string,
                             fromDate: Date,
                             toDate: Date,
                             status: number) {
    this.isLoadingEntities = true;
    this.orderService.getOrders(pageSize, pageNumber, orderCode, saleDept, saleDeptCode, seller, ticketCode, dSubscriptionNumber, dSubscriptionType, fromDate, toDate, status).subscribe(
      data => {
        this.totalData = data.totalCount;
        this.listOfData = data.records;
        this.isLoadingEntities = false;
      },
      error => {
        this.notification.error('Có lỗi xảy ra', 'Lấy danh sách Đơn hàng thất bại');
        this.isLoadingEntities = false;
      }
    );
  }

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private orderService: OrderService,
              private modalService: NzModalService,
              private snapshotVolumeService: SnapshotVolumeService,
              private notification: NzNotificationService) {
  }

  ngOnInit(): void {
    this.customerID = this.tokenService.get()?.userId;
  }


  onChange(value: number) {
    this.searchStatus = value;
    this.searchSnapshotScheduleList();
  }

  onChanggeDate(value: Date[]) {
    // console.log("From Date: "+value[0]);
    // console.log("To Date: "+value[1]);
    this.fromDate = value[0];
    this.toDate = value[1];
    this.searchSnapshotScheduleList();
  }


  navigateToDetail(id: number) {
    this.router.navigate(['/app-smart-cloud/order/detail/' + id]);
  }

  onInputChange(value: string) {
    this.orderCode = value.toUpperCase();
    console.log('input text: ', this.searchName);
    this.doGetSnapSchedules(this.pageSize, this.currentPage, this.orderCode,
      null, null, null, null, null, null, this.fromDate, this.toDate, this.searchStatus);
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/create']);
  }

  handleNavigateToContact(){

  }

  handleCancel(){
    this.isVisibleError = false
  }


  handleOpenError(){
    this.isVisibleError = true
  }


  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.searchSnapshotScheduleList();
  }

}
