import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LogModel } from '../model/log.model';
import { ClusterService } from '../services/cluster.service';

@Component({
  selector: 'one-portal-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css'],
})
export class LogsComponent implements OnInit {

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

  serviceOrderCode: string;
  listOfLogs: LogModel[];
  listOfResourceType = [
    {name: 'Cluster', value: 'cluster'},
  ];

  constructor(
    private clusterService: ClusterService,
    private activatedRouter: ActivatedRoute
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
    this.activatedRouter.params.subscribe(data => {
      this.serviceOrderCode = data['id'];
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
        this.total = r.total;
      }
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

}
