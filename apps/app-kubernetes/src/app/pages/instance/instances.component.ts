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
  selectedInstance: InstanceModel;
  isLoadingInstance: boolean;
  isVisibleModal: boolean;
  isSubmiting: boolean;

  titleModal: string;
  contentModal: string;
  action: string;

  changeKeySearch = new Subject<string>();

  constructor(
    private clusterService: ClusterService,
    private notificationService: NzNotificationService
  ) {
    this.isLoadingInstance = false;
    this.isVisibleModal = false;
    this.isSubmiting = false;
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
    this.clusterService.searchInstances(
      this.namespace,
      this.serviceOrderCode,
      this.keySearch,
      this.pageIndex,
      this.pageSize
    )
    .pipe(finalize(() => this.isLoadingInstance = false))
    .subscribe((r: any) => {
      this.listOfInstances = r.data?.content;
      this.total = r.data?.total;

      this.listOfInstances = this.listOfInstances.map(item => {
        let isActive: boolean;
        item.status == KubernetesConstant.ACTIVE_INSTANCE ? isActive = true : isActive = false;

        // let isProgressing: boolean;
        // item.status

        return {
          isActive: isActive,
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

  showModalAction(item: InstanceModel, action?: string) {
    if (action == null || action == undefined) {
      if (item.isActive) {
        // turn off node
        this.titleModal = `Tạm dừng hoạt động node ${item.instanceName}`;
        this.contentModal = `Bạn có chắc chắn muốn dừng hoạt động node ${item.instanceName} ?`;
        this.action = 'STOP';
      } else {
        // start node
        this.titleModal = `Bật node ${item.instanceName}`;
        this.contentModal = `Bạn có chắc muốn bật node ${item.instanceName} ?`;
        this.action = 'START';
      }
    } else if (action == 'REBOOT-SOFT') {
      this.titleModal = `Khởi động lại node ${item.instanceName}`;
      this.contentModal = `Bạn có chắc chắn muốn khởi động lại node ${item.instanceName} ?`;
      this.action = action;
    }

    this.isVisibleModal = true;
    this.selectedInstance = item;
  }

  handleCancelModalAction() {
    this.isVisibleModal = false;
    this.selectedInstance = null;
  }

  handleActionInstance(item: InstanceModel, action?: string) {
    this.isSubmiting = true;
    this.clusterService.actionInstance(item.cloudId, this.projectId, action)
    .pipe(finalize(() => {
      this.isSubmiting = false;
      this.handleCancelModalAction();
    }))
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
