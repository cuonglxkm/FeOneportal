import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { messageCallbackType } from '@stomp/stompjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EMPTY, Observable, Subscription, combineLatest, finalize } from 'rxjs';
import { environment } from '@env/environment';
import { KubernetesCluster } from 'src/app/model/cluster.model';
import { ClusterStatus } from 'src/app/model/status.model';
import { ClusterService } from 'src/app/services/cluster.service';
import { NotificationWsService } from 'src/app/services/ws.service';
import { KubernetesConstant } from 'src/app/constants/kubernetes.constant';
import { NotificationConstant } from 'src/app/constants/notification.constant';
import { RegionModel } from 'src/app/shared/models/region.model';
import { ProjectModel } from 'src/app/shared/models/project.model';

@Component({
  selector: 'one-portal-app-kubernetes',
  templateUrl: './list-cluster.component.html',
  styleUrls: ['./list-cluster.component.css'],
})
export class ListClusterComponent implements OnInit, OnDestroy {

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
  listOfProgress: number[];
  percent: number;
  eventSources: EventSource[] = [];

  // for status
  listOfStatusCluster: ClusterStatus[];
  listOfInProgressStatus = [
    1, // Đang khởi tạo
    7, // Đang xóa
    6, // Đang nâng cấp
  ];

  baseUrl = environment['baseUrl'];

  constructor(
    private clusterService: ClusterService,
    private websocketService: NotificationWsService,
    private notificationService: NzNotificationService,
    private ref: ChangeDetectorRef,
    private zone: NgZone,
    private router: Router
  ) {
    // const nav = this.router.getCurrentNavigation();
    // const state = nav?.extras.state;
    // console.log(state);
    // if (state) {
    //   const data = state.data;
    //   console.log({data: data});

    //   const namespace = data.namespace;
    //   const clusterName = data.clusterName;
    //   this.percent = 0;

    //   if (namespace != null && clusterName != null) {
    //     this.sseStream = this.clusterService.getProgressOfCluster(clusterName, namespace).subscribe(data => {
    //       this.percent = +data;
    //       this.ref.detectChanges();
    //     });
    //   }
    // }
  }

  private subscription: Subscription;
  ngOnInit(): void {
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

    // init ws
    // this.openWs();

    this.getListStatus();
  }

  searchCluster() {
    const k = this.keySearch.trim();
    this.clusterService.searchCluster(
      k,
      this.serviceStatus,
      this.cloudProfileId,
      this.projectInfraId,
      this.pageIndex,
      this.pageSize
    ).subscribe((r: any) => {
      if (r && r.code == 200) {
        this.listOfClusters = [];
        let listOfClusterInProgress = [];
        let progress: Array<Observable<any>> = [];

        r.data?.content.forEach(item => {
          const cluster: KubernetesCluster = new KubernetesCluster(item);
          this.listOfClusters.push(cluster);

          // get cluster is in-progress (initialing, deleting, upgrading,...)
          if (this.listOfInProgressStatus.includes(cluster.serviceStatus)) listOfClusterInProgress.push(cluster);
        });
        this.total = r.data.total;

        // check list cluster is empty with all status?
        if ((this.serviceStatus == '' || this.serviceStatus == null || this.serviceStatus == undefined) && (k == '')) {
          this.listOfClusters.length == 0 ? this.isShowIntroductionPage = true : this.isShowIntroductionPage = false;
        }

        // case user refresh page and have mulitple cluster and is in-progress
        console.log({ inprogress: listOfClusterInProgress });
        for (let i = 0; i < listOfClusterInProgress.length; i++) {
          let cluster: KubernetesCluster = listOfClusterInProgress[i];

          let progressObs: Observable<any>;
          if (this.listOfInProgressStatus.includes(cluster.serviceStatus)) {

            switch (cluster.serviceStatus) {
              case 1: // initialing
              case 6: // upgrading
                progressObs = this.viewProgressCluster(cluster.namespace, cluster.clusterName, KubernetesConstant.CREATE_ACTION);
                break;
              case 7: // deleting
                progressObs = this.viewProgressCluster(cluster.namespace, cluster.clusterName, KubernetesConstant.DELETE_ACTION);
                break;
              default:
                progressObs = EMPTY;
            }

          } else {
            progressObs = EMPTY;
          }
          progress.push(progressObs);
        }

        this.unsubscribeObs(this.eventSources);
        // risk: combineLastet can't emits value if each observable emits at least once value
        this.subscription = combineLatest(progress).subscribe(data => {
          // console.log({combine: data});
          this.listOfProgress = data;
          this.ref.detectChanges();
          // console.log({ progress: this.listOfProgress });
        });
      }
    });
  }

  viewProgressCluster(namespace: string, clusterName: string, action: string) {
    return new Observable(observable => {
      let source = new EventSource(`${this.baseUrl}/k8s-service/k8s/view-progress/${namespace}/${clusterName}/${action}`);
      this.eventSources.push(source);
      source.onmessage = event => {
        this.zone.run(() => {
          let data: number = +event.data;
          observable.next(data);

          if (data == 100) {          // complete
            observable.complete();
            source.close();

            this.searchCluster();     // refresh page
          }
        });
      }

      source.onerror = event => {
        this.zone.run(() => {
          console.log({ error: event });
          observable.error(event);
        })
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeObs(null);
  }

  unsubscribeObs(eventSources: EventSource[]) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (eventSources) {
      eventSources.forEach(source => source.close());
      this.eventSources = [];
    }
  }

  regionName: string;
  regionId: number;
  cloudProfileId: string;
  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.regionName = region.regionDisplayName;
    this.cloudProfileId = region.cloudId;
    this.searchCluster();
  }

  projectInfraId: number;
  onProjectChange(project: ProjectModel) {
    this.projectInfraId = project.id;
    this.searchCluster();
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

  handleDownloadKubeConfig(item: KubernetesCluster) {
    this.clusterService.getKubeConfig(item.serviceOrderCode)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          const yamlString = r.data;
          this.downloadKubeConfig(item.clusterName, yamlString);
        } else {
          this.notificationService.error("Thất bại", "Có lỗi xảy ra trong quá trình tải xuống. Vui lòng thử lại sau");
        }
      });
  }

  downloadKubeConfig(clusterName: string, yamlString: string) {
    const blob = new Blob([yamlString], { type: 'text/yaml' })
    const url = window.URL.createObjectURL(blob);

    // create a ele to download
    var dlink = document.createElement("a");
    dlink.download = clusterName + '_kubeconfig.yaml';
    dlink.href = url;
    dlink.onclick = function (e) {
      // revokeObjectURL needs a delay to work properly
      setTimeout(function () {
        window.URL.revokeObjectURL(url);
      }, 1500);
    };
    dlink.click(); dlink.remove();
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

  handleSyncCluster() {
    console.log(123);
  }

  showModalConfirmDeleteCluster(cluster: KubernetesCluster) {
    this.isShowModalDeleteCluster = true;
    this.selectedCluster = cluster;
  }

  handleDeleteMultipleCluster() {
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
