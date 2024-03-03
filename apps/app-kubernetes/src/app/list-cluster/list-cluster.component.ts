import { Component, OnInit } from '@angular/core';
import { KubernetesCluster } from '../model/cluster.model';
import { ClusterService } from '../services/cluster.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NotificationConstant } from '../constants/notification.constant';
import { NotificationWsService } from '../services/ws.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { messageCallbackType } from '@stomp/stompjs';

@Component({
  selector: 'one-portal-app-kubernetes',
  templateUrl: './list-cluster.component.html',
  styleUrls: ['./list-cluster.component.css'],
})
export class KubernetesDetailComponent implements OnInit {

  listOfClusters: KubernetesCluster[];
  keySearch: string;
  serviceStatus: string;
  pageIndex: number;
  pageSize: number;
  total: number;
  setOfCheckedId = new Set<number>();

  isShowIntroductionPage: boolean;

  // temp
  listOfStatusCluster : Array<{ label: string; value: number }> = [
    {label : "Chưa gia hạn" , value: 0},
    {label : "Đang khởi tạo" , value: 1},
    {label : "Đang hoạt động" , value: 2},
    {label : "Đang xóa", value: 7},
  ]

  constructor(
    private clusterService: ClusterService,
    private modalService: NzModalService,
    private websocketService: NotificationWsService,
    private notificationService: NzNotificationService
  ) {
    // display this page if user haven't any cluster
    this.isShowIntroductionPage = false;

    this.keySearch = '';
    this.serviceStatus = '';
    this.pageIndex = 1;
    this.pageSize = 10;
    this.total = 0;
  }

  ngOnInit(): void {
    // init ws
    // this.openWs();
    this.searchCluster();
  }

  searchCluster() {
    const k = this.keySearch.trim();
    this.clusterService.searchCluster(
      k,
      this.serviceStatus,
      this.pageIndex,
      this.pageSize
    ).subscribe((r: any) => {
      if (r && r.code == 200) {
        this.listOfClusters = [];
        r.data?.content.forEach(item => {
          const cluster: KubernetesCluster = new KubernetesCluster(item);
          this.listOfClusters.push(cluster);
        });
        this.total = r.data.total;

        // check list cluster is empty?
        this.listOfClusters.length == 0 ? this.isShowIntroductionPage = true : this.isShowIntroductionPage = false;
      }
    });
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

  handleDeleteCluster(clusterId: number) {
    this.clusterService.deleteCluster(clusterId)
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.notificationService.success("Thành công", r.message);
        this.searchCluster();
      } else {
        this.notificationService.error("Thất bại", r.message);
      }
    });
  }

  // websocket
  private openWs() {
    // list topic subscribe
    const topicSpecificUser = NotificationConstant.WS_SPECIFIC_TOPIC + "/" + '';
    const topicBroadcast = NotificationConstant.WS_BROADCAST_TOPIC;

    const notificationMessageCb = (noti) => {
      if (noti.body) {
        try {
          const notificationMessage = JSON.parse(noti.body);
          if (notificationMessage.content && notificationMessage.content?.length > 0) {
            if (notificationMessage.status == NotificationConstant.NOTI_SUCCESS) {
              this.notificationService.success(
                NotificationConstant.NOTI_SUCCESS_LABEL,
                notificationMessage.content);

                // refresh page
                this.searchCluster();

            } else {
              this.notificationService.error(
                NotificationConstant.NOTI_ERROR_LABEL,
                notificationMessage.content);
            }
          }
        } catch (ex) {
          console.log("parse message error: ", ex);
        }

      }
    }

    this.initNotificationWebsocket([
      { topics: [topicBroadcast, topicSpecificUser], cb: notificationMessageCb }
    ]);
  }

  private initNotificationWebsocket(topicCBs: Array<{ topics: string[], cb: messageCallbackType }>) {

    setTimeout(() => {
      this.websocketService = NotificationWsService.getInstance();
      this.websocketService.connect(
        () => {
          for (const topicCB of topicCBs) {
            for (const topic of topicCB.topics) {
              this.websocketService.subscribe(topic, topicCB.cb);
            }
          }
        });
    }, 1000);
  }

  navigateToDocs() {
    console.log("navigate");
  }

}
