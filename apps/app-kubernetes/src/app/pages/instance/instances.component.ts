import { Component, Input, OnInit } from '@angular/core';
import { ClusterService } from '../../services/cluster.service';
import { EMPTY, Subject, catchError, debounceTime, distinctUntilChanged, filter, finalize, map, switchMap } from 'rxjs';
import { InstanceModel } from '../../model/instance.model';
import { KubernetesConstant } from '../../constants/kubernetes.constant';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'cluster-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.css'],
})
export class InstancesComponent implements OnInit {

  @Input('namespace') namespace: string;
  @Input('serviceOrderCode') serviceOrderCode: string;
  @Input('projectId') projectId: number;

  keySearch: string;
  pageSize: number;
  pageIndex: number;
  total: number;

  listOfInstances: InstanceModel[];
  isLoadingInstance: boolean;

  changeKeySearch = new Subject<string>();

  constructor(
    private clusterService: ClusterService,
    private notificationService: NzNotificationService
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
    this.clusterService.searchInstances(this.namespace, this.serviceOrderCode)
    .pipe(finalize(() => this.isLoadingInstance = false))
    .subscribe((r: any) => {
      this.listOfInstances = r.data;
      this.total = this.listOfInstances.length;

      this.listOfInstances = this.listOfInstances.map(item => {
        let action: boolean;
        item.status == KubernetesConstant.ACTIVE_INSTANCE ? action = true : action = false;

        // let isProgressing: boolean;
        // item.status

        return {
          action: action,
          isProgressing: false,
          ...item
        };
      })
    });
  }

  syncInstances() {
    this.isLoadingInstance = true;
    this.clusterService.syncInstances(this.serviceOrderCode, this.namespace, this.projectId)
    .pipe(finalize(() => this.isLoadingInstance = false))
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.searchInstances();
        this.notificationService.success("Thành công", 'Đồng bộ instances thành công');
      } else {
        this.notificationService.error('Thất bại', r.message);
      }
    });
  }

  handleActionInstance(item: InstanceModel, action?: string) {
    if (action == null || action == undefined) {
      action = item.action == true ? 'STOP' : 'START';
    }
    this.clusterService.actionInstance(item.cloudId, this.projectId, action)
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.notificationService.success('Thành công', r.message);
        this.searchInstances();
      } else {
        this.notificationService.error('Thất bại', r.message);
      }
    });
  }

  onQueryParamsChange(event: any) {
    if (event) {
      this.pageSize = event.pageSize;
      this.pageIndex = event.pageIndex;

      this.searchInstances();
    }
  }

}
