import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActionHistoryModel } from 'src/app/shared/models/action-history.model';
import { ActionHistoryService } from 'src/app/shared/services/action-history.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, Subject } from 'rxjs';
import { TimeCommon } from 'src/app/shared/utils/common';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
@Component({
  selector: 'one-portal-action-history',
  templateUrl: './action-history.component.html',
  styleUrls: ['./action-history.component.less'],
})
export class ActionHistoryComponent implements OnInit {
  dateRange: Date[] = [new Date(), new Date()];
  dateFormat = 'dd/MM/yyyy';
  fromDate: string;
  toDate: string;
  regionId: number;
  projectId: number;
  listOfActionHistory: ActionHistoryModel[] = [];
  pageSize = 10;
  pageNumber: number = 1;
  total: number;
  selectedAction = 'Tất cả';
  tableHeight: string;
  searchParam: string = '';
  isLoading: boolean = false;
  searchDelay = new Subject<boolean>();
  actionData = ['Tất cả', 'Tạo mới', 'Sửa', 'Xóa'];
  constructor(
    private service: ActionHistoryService,
    private cdr: ChangeDetectorRef,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    let currentDate = new Date();
    this.fromDate = currentDate.toISOString().substring(0, 10);
    this.toDate = currentDate.toISOString().substring(0, 10);
    this.getData();
    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {   
      this.refreshParams();  
      this.getData();
    });
  }

  search(search: string) {  
    this.searchParam = search.toLowerCase().trim();
    this.refreshParams();
    this.getData()
  }

  refreshParams() {
    this.pageSize = 10;
    this.pageNumber = 1;
}

onQueryParamsChange(params: NzTableQueryParams) {
  const { pageSize, pageIndex } = params;
  this.pageSize = pageSize;
  this.pageNumber = pageIndex;
  this.getData();
}

  getData(): void {
    this.isLoading = true;
    this.service
      .getData(
        this.pageSize,
        this.pageNumber,
        this.fromDate,
        this.toDate,
        this.searchParam,
        this.searchParam,
        this.searchParam
      )
      .subscribe({
        next: (data) => {
          this.listOfActionHistory = data.records;
          this.total = data.totalCount;
          this.isLoading = false;
        }, 
        error: (e) => {
          this.notification.error(e.statusText, 'Tải dữ liệu thất bại');
          this.isLoading = false;
        }
      });
  }

  onChangeDateRange() {
    console.log('date picked', this.dateRange);
    this.fromDate = this.dateRange[0].toISOString().substring(0, 10);
    this.toDate = this.dateRange[1].toISOString().substring(0, 10);
    this.refreshParams();
    this.getData();
  }
}
