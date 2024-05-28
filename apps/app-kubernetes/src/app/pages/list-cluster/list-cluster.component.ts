import { ChangeDetectorRef, Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { messageCallbackType } from '@stomp/stompjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EMPTY, Observable, Subscription, catchError, combineLatest, defaultIfEmpty, finalize, interval, merge, of, take, takeUntil, throwError, timeout, timeoutWith } from 'rxjs';
import { environment } from '@env/environment';
import { KubernetesCluster } from '../../model/cluster.model';
import { ClusterStatus } from '../../model/status.model';
import { ClusterService } from '../../services/cluster.service';
import { NotificationWsService } from '../../services/ws.service';
import { KubernetesConstant } from '../../constants/kubernetes.constant';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { NotificationConstant } from '../../constants/notification.constant';

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
  isLoadingCluster: boolean;

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
    5, // Đang khôi phục
  ];
  mapProgress: Map<string, number>;

  baseUrl = environment['baseUrl'];

  @HostListener('window:unload', [ '$event' ])
  unloadHandler(event) {
    this.ngOnDestroy();
  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event) {
    this.ngOnDestroy();
  }

  constructor(
    private clusterService: ClusterService,
    private websocketService: NotificationWsService,
    private notificationService: NzNotificationService,
    private ref: ChangeDetectorRef,
    private zone: NgZone,
    private router: Router
  ) {}

  private subscription: Subscription;
  ngOnInit(): void {
    // remove tab index
    localStorage.removeItem('currentTab');

    // display this page if user haven't any cluster
    this.isShowIntroductionPage = false;

    this.listOfProgress = [];
    this.isShowModalDeleteCluster = false;
    this.isSubmitDelete = false;
    this.isLoadingCluster = false;
    this.isWrongName = true;
    this.keySearch = '';
    this.serviceStatus = '';
    this.pageIndex = 1;
    this.pageSize = 10;
    this.total = 0;

    // init ws
    this.openWs();

    this.getListStatus();

    window.onbeforeunload = () => this.ngOnDestroy();
  }

  searchCluster() {
    this.isLoadingCluster = true;
    const k = this.keySearch.trim();
    this.clusterService.searchCluster(
      k,
      this.serviceStatus,
      this.cloudProfileId,
      this.projectInfraId,
      this.pageIndex,
      this.pageSize
    ).pipe(finalize(() => this.isLoadingCluster = false))
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.listOfClusters = [];
        let progress: Array<Observable<any>> = [];
        let listOfClusterInProgress = [];

        r.data?.content.forEach(item => {
          const cluster: KubernetesCluster = new KubernetesCluster(item);
          this.listOfClusters.push(cluster);

          // get cluster is in-progress (initialing, deleting, upgrading,...)
          if (this.listOfInProgressStatus.includes(cluster.serviceStatus)) listOfClusterInProgress.push(cluster);
        });
        this.total = r.data.total;
        this.listOfClusters.reverse();

        // check list cluster is empty with all status?
        if ((this.serviceStatus == '' || this.serviceStatus == null || this.serviceStatus == undefined) && (k == '')) {
          this.listOfClusters.length == 0 ? this.isShowIntroductionPage = true : this.isShowIntroductionPage = false;
        }

        // case user refresh page and have mulitple cluster and is in-progress
        if (listOfClusterInProgress.length > 0) {
          for (let i = 0; i < this.listOfClusters.length; i++) {
            let cluster: KubernetesCluster = this.listOfClusters[i];

            let progressObs: Observable<any>;
            if (this.listOfInProgressStatus.includes(cluster.serviceStatus)) {

              switch (cluster.serviceStatus) {
                case 1: // initialing
                case 6: // upgrading
                  progressObs = this.viewProgressCluster(cluster.regionId, cluster.namespace,
                    cluster.serviceOrderCode, KubernetesConstant.CREATE_ACTION);
                  break;
                case 7: // deleting
                  progressObs = this.viewProgressCluster(cluster.regionId, cluster.namespace,
                    cluster.serviceOrderCode, KubernetesConstant.DELETE_ACTION);
                  break;
                default:
                  progressObs = new Observable(_ => _.complete()).pipe(defaultIfEmpty(0));
              }

            } else {
              progressObs = new Observable(_ => _.complete()).pipe(defaultIfEmpty(0));
            }
            progress.push(progressObs);
          }
        }

        let progressFromLocal: string = localStorage.getItem('mapProgress');
        if (progressFromLocal) {
          this.mapProgress = new Map(JSON.parse(progressFromLocal));
        } else {
          this.mapProgress = new Map<string, number>();
        }

        // progress.forEach(p => {
        //   p.pipe(
        //     timeout(5000),
        //     catchError(() => of(0))
        //   ).subscribe((r: any) => {
        //     let key = r.data.key;
        //     let currentValue = r.data.progress;
        //     let previousValue = this.mapProgress.get(key);
        //     if (previousValue && currentValue <= previousValue) {
        //       this.mapProgress.set(key, previousValue);
        //     } else {
        //       this.mapProgress.set(key, currentValue);
        //     }
        //   });
        // });

        this.unsubscribeObs(this.eventSources);
        this.subscription = combineLatest(progress)
        .subscribe(data => {
          this.listOfProgress = data;

          // let progressFromLocal: string = localStorage.getItem('mapProgress');

          // if (progressFromLocal) {
          //   this.mapProgress = new Map(JSON.parse(progressFromLocal));
          // } else {
          //   this.mapProgress = new Map<string, number>();
          // }

          // for (let i = 0; i < this.listOfProgress.length; i++) {
          //   let currentProgress = this.listOfProgress[i];
          //   const cluster = this.listOfClusters[i];
          //   let keyObj = cluster.namespace + ';' + cluster.clusterName;

          //   if (currentProgress == 100) {
          //     this.mapProgress.delete(keyObj);
          //   } else {
          //     let previousValue = this.mapProgress.get(keyObj);
          //     if (previousValue && currentProgress <= previousValue) {
          //       this.mapProgress.set(keyObj, previousValue);
          //     } else {
          //       this.mapProgress.set(keyObj, currentProgress);
          //     }
          //   }
          // }

          // localStorage.setItem('mapProgress', JSON.stringify(Array.from(this.mapProgress.entries())));
          this.ref.detectChanges();
        });
      }
    });
  }

  viewProgressCluster(regionId: number, namespace: string, serviceOrderCode: string, action: string) {
    return new Observable(observable => {
      let source = new EventSource(`${this.baseUrl}/k8s-service/k8s/view-progress/${regionId}/${namespace}/${serviceOrderCode}/${action}`);
      this.eventSources.push(source);
      source.onmessage = event => {
        this.zone.run(() => {
          let data: number = Number(event.data);
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
    this.websocketService.disconnect();
    this.unsubscribeObs(null);
    localStorage.removeItem('mapProgress');
  }

  onDestroy(): void {
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
    // this.cloudProfileId = region.cloudId;
    this.cloudProfileId = KubernetesConstant.OPENSTACK_LABEL;
  }

  projectInfraId: number;
  onProjectChange(project: ProjectModel) {
    this.projectInfraId = project.id;
    if (this.regionId && this.projectInfraId) this.searchCluster();
  }

  getListStatus() {
    this.clusterService.getListStatus()
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.listOfStatusCluster = r.data;
        } else {
          this.notificationService.error("", r.message);
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
          console.error('An error ocur when download file');
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

      if (this.regionId && this.projectInfraId) this.searchCluster();
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
          this.notificationService.success("", r.message);
          this.searchCluster();
        } else {
          this.notificationService.error("", r.message);
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
