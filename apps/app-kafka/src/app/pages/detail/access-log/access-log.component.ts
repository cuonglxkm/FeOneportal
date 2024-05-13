import { Component, HostListener, Input, OnInit } from '@angular/core';
import {
  AccessLog,
  FetchAccessLogs,
} from '../../../core/models/access-log.model';
import { KafkaService } from '../../../services/kafka.service';
import { filter, finalize, map } from 'rxjs/operators';
import { camelizeKeys } from 'humps';
import { LoadingService } from '@delon/abc/loading';

@Component({
  selector: 'one-portal-access-log',
  templateUrl: './access-log.component.html',
  styleUrls: ['./access-log.component.css'],
})
export class AccessLogComponent implements OnInit {
  @Input() serviceOrderCode: string;

  operations = {
    CREATE: 'Tạo bản ghi',
    UPDATE: 'Cập nhật bản ghi',
    DELETE: 'Xóa bản ghi',
    TEST_PRODUCER: 'Test producer',
  };

  resourceType = {
    TOPIC: 'Topic',
    CONSUMER_GROUP: 'Consumer group',
    BROKER: 'Broker',
    USER: 'User',
    MESSAGE: 'Message'
  }

  isEndOfPage: boolean;
  windowScrolled: boolean;
  isEndOfList: boolean;

  userSearch: string;
  resourceSearch: string;
  resourceTypeSearch: string;
  operationSearch: string;
  dateSearch: any;
  fromDate: number;
  toDate: number;
  total: number;
  size: number;
  page: number;
  accessLogs: AccessLog[];

  constructor(private kafkaService: KafkaService, private loadingSrv: LoadingService) {
    this.accessLogs = [];
    this.userSearch = '';
    this.resourceTypeSearch = '';
    this.resourceSearch = '';
    this.operationSearch = '';
    this.page = 1;
    this.size = 10;
    this.total = 0;
    this.isEndOfPage = false;
  }

  ngOnInit(): void {
    return;
    // this.getAccessLogs();
  }

  onDateChange(event: Date[]) {
    const from: Date = event[0];
    const to: Date = event[1];

    this.fromDate = from?.setHours(0, 0, 0, 0);
    this.toDate = to?.setHours(0, 0, 0, 0);
  }

  onQueryParamsChange(event: any) {
    this.page = event.pageIndex;
    this.size = event.pageSize;

    this.getAccessLogs();
  }


  getAccessLogs() {
    const filters: FetchAccessLogs = {
      userAction: this.userSearch.trim(),
      resource: this.resourceSearch.trim(),
      resourceType: this.resourceTypeSearch,
      operation: this.operationSearch,
      fromDate: this.fromDate,
      toDate: this.toDate,
      serviceOrderCode: this.serviceOrderCode,
      page: this.page,
      size: this.size,
    };
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });
    this.kafkaService
      .getAccessLogs(filters)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe((data) => {
        if (data && data.code == 200) {
          this.accessLogs = camelizeKeys(data.data.results) as AccessLog[];
          this.total = data.data.totals;
        }
      });
  }
}
