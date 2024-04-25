import { Component, Input, OnInit } from '@angular/core';
import { ClusterService } from '../../services/cluster.service';
import { Subject, debounceTime, distinctUntilChanged, finalize, map } from 'rxjs';
import { InstanceModel } from '../../model/instance.model';

@Component({
  selector: 'cluster-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.css'],
})
export class InstancesComponent implements OnInit {

  @Input('clusterName') clusterName: string;
  @Input('projectId') projectId: number;

  keySearch: string;
  serviceOrderCode: string;
  pageSize: number;
  pageIndex: number;
  total: number;

  listOfInstances: InstanceModel[] = [
    {
      id: 1,
      instanceName: "abc",
      vCPUs: 2,
      ram: 4,
      volumeSize: 10,
      volumeType: "SSD",
      status: "ACTIVE",
      workerGroupName: "ngahn",
      serviceOrderCode: "k8s-123",
      namespace: "abc",
      privateIP: "1.1.1.1",
    }
  ];
  isLoadingInstance: boolean;

  changeKeySearch = new Subject<string>();

  constructor(
    private clusterService: ClusterService
  ) {
    this.isLoadingInstance = false;
    this.listOfInstances = [];
    this.keySearch = '';
    this.pageIndex = 1;
    this.pageSize = 10;
    this.total = 0;
  }

  ngOnInit(): void {
    this.changeKeySearch.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      map(key => key.trim())
    ).subscribe((key: string) => {
      this.keySearch = key;
      this.searchInstances();
    });
  }

  searchInstances() {
    this.isLoadingInstance = true;
    this.clusterService.getListInstancesOfCluster(this.projectId, this.clusterName)
    .pipe(finalize(() => this.isLoadingInstance = false))
    .subscribe((r: any) => {
      this.listOfInstances = r.data;
    });
  }

  syncInstances() {}

  handleOnOffInstance(item: InstanceModel) {
    console.log
  }

  onQueryParamsChange(event: any) {
    if (event) {
      this.pageSize = event.pageSize;
      this.pageIndex = event.pageIndex;

      this.searchInstances();
    }
  }

}
