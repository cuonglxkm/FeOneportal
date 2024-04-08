import { Component, Input, OnInit } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { LogModel } from '../../model/log.model';
import { ClusterService } from '../../services/cluster.service';

@Component({
  selector: 'one-portal-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css'],
})
export class LogsComponent implements OnInit {

  @Input('serviceOrderCode') serviceOrderCode: string;

  userAction: string;
  operation: string;
  resource: string;
  resourceType: string;
  date: any;
  fromDate: number;
  toDate: number;

  pageIndex: number;
  pageSize: number;
  total: number;

  changeUserKeySearch = new Subject<string>();

  listOfLogs: LogModel[];
  listOfResourceType = [
    {name: 'Cluster', value: 'cluster'},
    {name: 'Nhóm worker', value: 'worker'}
  ];
  listOfWorkerGroupName: string[];

  constructor(
    private clusterService: ClusterService
  ) {
    this.userAction = '';
    this.operation = '';
    this.resource = '';
    this.resourceType = '';
    this.pageIndex = 1;
    this.pageSize = 10;
    this.total = 0;
  }

  ngOnInit(): void {
    this.getWorkerGroupOfCluster(this.serviceOrderCode);

    this.changeUserKeySearch.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      map(key => key.trim())
    ).subscribe((key: string) => {
      this.userAction = key;
      this.searchLogs();
    });
  }

  searchLogs() {
    this.clusterService.searchLogs(
      this.userAction,
      this.operation,
      this.resource,
      this.resourceType,
      this.fromDate,
      this.toDate,
      this.pageIndex,
      this.pageSize,
      this.serviceOrderCode
    ).subscribe((r: any) => {
      if (r && r.code == 200) {
        this.listOfLogs = [];
        r.data?.content.forEach(item => {
          const log = new LogModel(item);
          this.listOfLogs.push(log);
        })
        this.total = r.data.total;
      }
    });
  }

  getWorkerGroupOfCluster(serviceOrderCode: string) {
    this.clusterService.getWorkerGroupOfCluster(serviceOrderCode)
    .subscribe((r: any) => {
      this.listOfWorkerGroupName = r.data;
    });
  }

  onQueryParamsChange(event: any) {
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;

      this.searchLogs();
    }
  }

  onChangeDate(event: Date[]) {
    if (event) {
      this.fromDate = event[0] ? event[0].getTime() : null;
      this.toDate = event[1] ? event[1].getTime() : null;
    }
  }

  isDisableWorkerFilter: boolean = true;
  onChangeResourceType() {
    this.resourceType && this.resourceType == 'worker' ? this.isDisableWorkerFilter = false : this.isDisableWorkerFilter = true;
  }

}
