import { Component, OnInit } from '@angular/core';
import { KubernetesCluster } from '../model/cluster.model';
import { ClusterService } from '../services/cluster.service';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'one-portal-app-kubernetes',
  templateUrl: './list-cluster.component.html',
  styleUrls: ['./list-cluster.component.css'],
})
export class KubernetesDetailComponent implements OnInit {

  listOfClusters: KubernetesCluster[];
  keySearch: string;
  pageIndex: number;
  pageSize: number;
  total: number;

  setOfCheckedId = new Set<number>();

  constructor(
    private clusterService: ClusterService,
    private modalService: NzModalService
  ) {
    this.keySearch = '';
    this.pageIndex = 1;
    this.pageSize = 10;
    this.total = 1;

    // mock data
    const tmp: KubernetesCluster = {
      id: 1,
      clusterName: "abc",
      actionStatus: 1,
      serviceStatus: 1,
      apiEndpoint: "",
      createdDate: new Date(),
      totalNode: 3
    };
    this.listOfClusters = [];
    this.listOfClusters.push(tmp);
  }

  ngOnInit(): void {
    this.searchCluster();
  }

  searchCluster() {
    console.log(123);
  }

  onQueryParamsChange(event) {
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;

      this.searchCluster();
    }
  }

  onAllClusterChecked(checked: boolean) {
    if (checked) {
      this.listOfClusters.forEach(item => {
        this.setOfCheckedId.add(item.id);
      });
    } else {
      this.setOfCheckedId.clear();
    }
  }

  updateClusterChecked(id: number, checked: boolean) {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  handleDownloadKubeConfig(item: KubernetesCluster) {
    console.log(item);
  }

  handleSyncCluster() {
    console.log(123);
  }

  showModalConfirmDeleteCluster(item: KubernetesCluster) {
    this.modalService.confirm({
      nzTitle: `Bạn có chắc muốn xóa cluster ${item.clusterName} không?`,
      nzContent: '<b style="color: red;">Cluster sẽ bị xóa vĩnh viễn và không thể khôi phục</b>',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.handleDeleteCluster(item.id),
      nzCancelText: 'Đóng',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  handleDeleteMultipleCluster(){
    const selectedCluster = Array.from(this.setOfCheckedId);
    console.log(selectedCluster);
  }

  handleDeleteCluster(id: number) {
    console.log(id);
  }

}
