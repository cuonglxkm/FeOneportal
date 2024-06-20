import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { SnapshotVolumeService } from '../../../shared/services/snapshot-volume.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { PopupAddVolumeComponent } from '../../volume/component/popup-volume/popup-add-volume.component';
import { OrderService } from '../../../shared/services/order.service';
import { getCurrentRegionAndProject } from "@shared";
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-list-order',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.less']
})
export class OrderListComponent implements OnInit {

  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  searchStatus?: number = null;
  searchName?: string;

  // status = [
  //   { label: this.i18n.fanyi("app.order.status.All"), value: null },
  //   { label: this.i18n.fanyi("app.order.status.New"), value: 1 },
  //   { label: this.i18n.fanyi("app.order.status.Paid"), value: 2 },
  //   { label: this.i18n.fanyi("app.order.status.InProcessing"), value: 3 },
  //   { label: this.i18n.fanyi("app.order.status.Completed"), value: 4 },
  //   { label: this.i18n.fanyi("app.order.status.Cancelled"), value: 5 }
  // ];
  status = [
    { label: this.i18n.fanyi("app.order.status.orderplaced"), value: 0 },
    { label: this.i18n.fanyi("app.order.status.cancelled"), value: 1 },
    { label: this.i18n.fanyi("app.order.status.Paid"), value: 6 },
    { label: this.i18n.fanyi("app.order.status.inprocessing"), value: 3 },
    { label: this.i18n.fanyi("app.order.status.installed"), value: 4 },
    { label: this.i18n.fanyi("app.order.status.error"), value: 5 },
  
  ];
  orderCode: string;
  fromDate: Date;
  toDate: Date;

  date: any;
  pageSize: number = 10;
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

  refreshParams() {
    this.pageSize = 10;
    this.currentPage = 1;
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
        console.log("Huyen", data)
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
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  ngOnInit(): void {
    this.customerID = this.tokenService.get()?.userId;
  }


  onChange(value: number) {
    this.searchStatus = value;
    this.refreshParams()
    this.searchSnapshotScheduleList();
  }

  onChanggeDate(value: Date[]) {
    this.fromDate = value[0];
    this.toDate = value[1];
    this.refreshParams()
    this.searchSnapshotScheduleList();
  }


  navigateToDetail(id: number) {
    this.router.navigate(['/app-smart-cloud/order/detail/' + id]);
  }

  onInputChange(value: string) {
    this.orderCode = value.toUpperCase();
    console.log('input text: ', this.searchName);
    this.refreshParams()
    this.doGetSnapSchedules(this.pageSize, this.currentPage, this.orderCode,
      null, null, null, null, null, null, this.fromDate, this.toDate, this.searchStatus);
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/create']);
  }

  handleNavigateToContact() {

  }

  handleCancel() {
    this.isVisibleError = false
  }


  handleOpenError() {
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
