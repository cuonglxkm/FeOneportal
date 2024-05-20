import { Component, Input, OnInit } from '@angular/core';
import { LoggingService } from '../../../service/log.service';
import { finalize } from 'rxjs';

interface Log {
  username: string;
  action: string;
  resource: string;
  note: string;
  timestamp: Date;
  status: string;
}

@Component({
  selector: 'one-portal-logging',
  templateUrl: './logging.component.html',
  styleUrls: ['./logging.component.css'],
})
export class LoggingComponent implements OnInit {
  
  @Input() serviceCode: string;
  startIndex = 1;
  service_order_code = '';
  username = '';
  resource = '';
  action = '';
  date = '';
  pageSize = 10;
  pageIndex = 1;
  total = 0;
  isEndOfPage = false;
  windowScrolled: boolean | undefined;
  isEndOfList: boolean | undefined;

  startDate: number | any;
  endDate: number | any;
  status= '';
  listOfLogs: Log[] = [

  ];
  currentPage = 1;
  currentId =0;
  dateFormat = 'dd/MM/yyyy';

  actions = {
    CREATE_DATABASE: 'Thêm database',
    DELETE_DATABASE: 'Xoá database',
    CREATE_COLLECTION: 'Thêm collection',
    DELETE_COLLECTION: 'Xoá collection',
  };

  constructor(private log: LoggingService) {}




  ngOnInit(): void {
    this.listOfLogs = [];
    this.username = '';
    this.resource = '';
    this.action = '';


    this.onSearch();
  }

  onSearch() {
    this.log
      .searchLogs(
        this.username.trim(),
        this.resource,
        this.action,
        this.startDate,
        this.endDate,
        this.serviceCode,
        this.pageIndex,
        this.pageSize,

      )
      .pipe(finalize(() => (this.isEndOfPage = false)))
      .subscribe((r: any) => {
        const tmp: [] = r.content;
        this.listOfLogs = [...tmp];
        this.total = r.total;
      });
  }

  onChangeDate(result: Date[]) {
    const from: Date = result[0];
    const to: Date = result[1];

    this.startDate = from?.setHours(0,0,0,0);
    this.endDate = to?.setHours(0,0,0,0);
  }

  onQueryParamsChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.currentPage = this.pageIndex +1;
    this.onSearch();
  }



  getStatusColor(status: string): string {
    switch (status) {
      case 'Thất bại':
        return 'red';
      case 'Thành công':
        return 'green';
      default:
        return 'black';
    }
  }

}
