import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { KubernetesCluster, ProgressData } from '../model/cluster.model';
import { ClusterService } from '../services/cluster.service';
import { NotificationConstant } from '../constants/notification.constant';
import { NotificationWsService } from '../services/ws.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { messageCallbackType } from '@stomp/stompjs';
import { EMPTY, catchError, finalize, from, mergeMap } from 'rxjs';
import { ShareService } from '../services/share.service';
import { ClusterStatus } from '../model/status.model';

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
  selectedCluster: KubernetesCluster;

  isShowIntroductionPage: boolean;
  isShowModalDeleteCluster: boolean;
  isWrongName: boolean;
  isSubmitDelete: boolean;

  // input confirm delete modal
  deleteClusterName: string;

  // for progress
  listOfProgress: Array<{cluster: string, progress: any}>;
  mapProgress = new Map<string, number>();
  percent: number = 0;

  // for status
  listOfStatusCluster: ClusterStatus[];

  constructor(
    private clusterService: ClusterService,
    private websocketService: NotificationWsService,
    private notificationService: NzNotificationService,
    private shareService: ShareService,
    private ref: ChangeDetectorRef
  ) {
    // display this page if user haven't any cluster
    this.isShowIntroductionPage = false;

    this.listOfProgress = [];
    this.isShowModalDeleteCluster = false;
    this.isSubmitDelete = false;
    this.isWrongName = true;
    this.keySearch = '';
    this.serviceStatus = '';
    this.pageIndex = 1;
    this.pageSize = 10;
    this.total = 0;
  }

  ngOnInit(): void {
    // init ws
    // this.openWs();

    this.getListStatus();

    this.shareService.$progressData.subscribe((data: ProgressData) => {
      const namespace = data.namespace;
      const clusterName = data.clusterName;

      console.log(data);
      if (namespace != null && clusterName != null) {
        this.viewProgressCluster(namespace, clusterName);
      }
    });
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
        let listOfClusterInProgress = [];
        r.data?.content.forEach(item => {
          const cluster: KubernetesCluster = new KubernetesCluster(item);
          this.listOfClusters.push(cluster);

          // get cluster is in-progress
          if (cluster.serviceStatus == 1 || cluster.serviceStatus == 7) listOfClusterInProgress.push(cluster);
        });
        this.total = r.data.total;

        // check list cluster is empty with all status?
        if (this.serviceStatus == '' || this.serviceStatus == null || this.serviceStatus == undefined) {
          this.listOfClusters.length == 0 ? this.isShowIntroductionPage = true : this.isShowIntroductionPage = false;
        }

        // case user refresh page and have mulitple cluster and is in-progress
        // from(listOfClusterInProgress).pipe(
        //   mergeMap(cluster => this.clusterService.viewProgressCluster('', cluster.clusterName)
        //   .pipe(catchError(response => {
        //     console.error('fail to get progress: ', response);
        //     return EMPTY;
        //   })))
        // );
      }
    });
  }

  viewProgressCluster(namespace: string, clusterName: string) {
    this.clusterService.viewProgressCluster(namespace, clusterName)
    .subscribe({next: data => {
      this.mapProgress.set(clusterName, +data);
      this.percent += 5;
    }});
  }

  getListStatus() {
    this.clusterService.getListStatus()
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.listOfStatusCluster = r.data;
      } else {
        this.notificationService.error("Thất bại", r.message);
      }
    });
  }

  getIndexOfCluster(id: number) {
    const item = this.listOfClusters.find(obj => obj.id == id);
    return this.listOfClusters.indexOf(item) + 1;
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

  onInputDeleteCluster(clusterName: string) {
    if (clusterName) {
      const name = clusterName.trim();
      if (name !== this.selectedCluster.clusterName) this.isWrongName = true;
      else this.isWrongName = false;
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

  showModalConfirmDeleteCluster(cluster: KubernetesCluster) {
    this.isShowModalDeleteCluster = true;
    this.selectedCluster = cluster;
  }

  handleDeleteMultipleCluster(){
    const selectedCluster = Array.from(this.setOfCheckedId);
    console.log(selectedCluster);
  }

  handleDeleteCluster() {
    this.isSubmitDelete = true;
    this.clusterService.deleteCluster(this.selectedCluster.id)
    .pipe(finalize(() => {
      this.isShowModalDeleteCluster = false;
      this.isSubmitDelete = false;
      this.deleteClusterName = null;
    }))
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

  handleCloseModalDelete() {
    this.isShowModalDeleteCluster = false;
    this.deleteClusterName = null;
    this.onInputDeleteCluster(null);
  }

}
