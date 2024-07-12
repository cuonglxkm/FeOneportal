import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { SnapshotVolumeService } from '../../../shared/services/snapshot-volume.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { PopupAddVolumeComponent } from '../../volume/component/popup-volume/popup-add-volume.component';
import { OrderService } from '../../../shared/services/order.service';
import { getCurrentRegionAndProject } from '@shared';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import {
  RegionModel,
  ProjectModel,
} from '../../../../../../../libs/common-utils/src';
import { format } from 'date-fns';
import { debounceTime, Subject } from 'rxjs';
import { TimeCommon } from 'src/app/shared/utils/common';
@Component({
  selector: 'one-portal-list-order',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.less'],
})
export class OrderListComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  searchStatus?: any = 7;
  searchStatusOrder?: any = 6;
  searchName?: string;
  searchDelay = new Subject<boolean>();
  noInstalled: boolean = false;
  statusOrder = [
    { label: this.i18n.fanyi('app.order.status.AllStatus'), value: 6 },
    { label: this.i18n.fanyi('app.order.status.orderplaced'), value: 0 },
    { label: this.i18n.fanyi('app.order.status.Paid'), value: 2 },
    { label: this.i18n.fanyi('app.order.status.cancelled'), value: 1 },
  ];

  statusInstall = [
    { label: this.i18n.fanyi('app.order.status.AllStatus'), value: 7 },
    { label: this.i18n.fanyi('app.order.status.installed'), value: 4 },
    { label: this.i18n.fanyi('app.order.status.error'), value: 5 },
    { label: this.i18n.fanyi('app.order.status.inprocessing'), value: 3 },
  ];
  orderCode: string;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  fromDateFormatted: string | null = null;
  toDateFormatted: string | null = null;

  date: any;
  pageSize: number = 10;
  currentPage: number = 1;
  listOfData: any;
  totalData: number;
  isLoadingEntities: boolean;
  customerID: number;

  value?: string = '';
  actionSelected: number;
  isVisibleError: boolean = false;

  constructor(
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private orderService: OrderService,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  ngOnInit(): void {
    this.customerID = this.tokenService.get()?.userId;
    this.searchDelay
      .pipe(debounceTime(TimeCommon.timeOutSearch))
      .subscribe(() => {
        this.refreshParams();
        this.searchSnapshotScheduleList();
      });
  }

  search(search: string) {
    this.value = search.toUpperCase().trim();
    this.refreshParams();
    this.searchSnapshotScheduleList();
  }

  onChange(value: number) {
    this.searchStatusOrder = value;
      this.searchStatus = 7;
      this.noInstalled = false;
    this.refreshParams();
    this.searchSnapshotScheduleList();
  }

  onChangeStatusInstall(value: number) {
    if (value == 4 || value == 5 || value == 3 || value == null) {
      if (this.searchStatusOrder === 2) {
        this.searchStatus = value;
        this.noInstalled = false;
        this.refreshParams();
        this.searchSnapshotScheduleList();
      } else {
        this.searchStatus = value;
        this.noInstalled = true;
        this.refreshParams();
        this.searchSnapshotScheduleList();
      }
    } else {
      this.searchStatus = value;
      this.noInstalled = true;
      this.refreshParams();
      this.searchSnapshotScheduleList();
    }
  }

  onChanggeDate(value: Date[]) {
    if (value && value.length === 2) {
      this.fromDate = value[0];
      this.toDate = value[1];
      this.fromDateFormatted = format(this.fromDate, 'yyyy-MM-dd');
      this.toDateFormatted = format(this.toDate, 'yyyy-MM-dd');
    } else {
      this.fromDate = null;
      this.toDate = null;
      this.fromDateFormatted = null;
      this.toDateFormatted = null;
    }

    this.refreshParams();
    this.searchSnapshotScheduleList();
  }

  navigateToDetail(id: number) {
    this.router.navigate(['/app-smart-cloud/order/detail/' + id]);
  }

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

  private doGetSnapSchedules(
    pageSize: number,
    pageNumber: number,
    orderCode: string,
    saleDept: string,
    saleDeptCode: string,
    seller: string,
    ticketCode: string,
    dSubscriptionNumber: string,
    dSubscriptionType: string,
    fromDate: string,
    toDate: string,
    status: any
  ) {
    this.isLoadingEntities = true;
    this.orderService
      .getOrders(
        pageSize,
        pageNumber,
        orderCode,
        saleDept,
        saleDeptCode,
        seller,
        ticketCode,
        dSubscriptionNumber,
        dSubscriptionType,
        fromDate,
        toDate,
        status
      )
      .subscribe(
        (data) => {
          this.totalData = data.totalCount;
          this.listOfData = data.records;
          this.isLoadingEntities = false;
        },
        (error) => {
          this.notification.error(
            'Có lỗi xảy ra',
            'Lấy danh sách Đơn hàng thất bại'
          );
          this.isLoadingEntities = false;
        }
      );
  }


  searchSnapshotScheduleList() {
    this.doGetSnapSchedules(
      this.pageSize,
      this.currentPage,
      this.value.toUpperCase().trim(),
      null,
      null,
      null,
      null,
      null,
      null,
      this.fromDateFormatted,
      this.toDateFormatted,
      this.searchStatusOrder === 6 && (this.searchStatus === 7 ||
        this.searchStatus === undefined)
        ? [0, 1, 2, 3, 4, 5, 6]
        : this.searchStatusOrder === 6 && (this.searchStatus === 4 ||
          this.searchStatus === 5 ||
          this.searchStatus === 3)
        ? [this.searchStatus]
        : (this.searchStatusOrder === 1 || this.searchStatusOrder === 0 ) && (this.searchStatus === 4 ||
          this.searchStatus === 5 ||
          this.searchStatus === 3)
        ? [8]
        : (this.searchStatusOrder === 1 || this.searchStatusOrder === 0 ) && (this.searchStatus === 7)
        ? [this.searchStatusOrder]
        : this.searchStatusOrder === 6
        ? [0, 1, 2, 3, 4, 5, 6]
        : this.searchStatusOrder === 2 && (this.searchStatus === 7 || this.searchStatus === null)
        ? [2, 3, 4, 5]
        : this.searchStatusOrder !== 2 && this.noInstalled === false
        ? [this.searchStatusOrder]
        : this.searchStatusOrder !== 2 && this.noInstalled === true
        ? [8]
        : [this.searchStatus]
    );
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/create']);
  }

  handleCancel() {
    this.isVisibleError = false;
  }

  handleOpenError() {
    this.isVisibleError = true;
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.searchSnapshotScheduleList();
  }

  handleNavigateToContact(){
    window.location.href = 'tel:19008198';
  }
}
