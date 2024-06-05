import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { KubernetesCluster } from '../../model/cluster.model';
import { ClusterService } from '../../services/cluster.service';
import { VlanService } from '../../services/vlan.service';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { switchMap } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '../../core/i18n/i18n.service';
import { NotificationConstant } from '../../constants/notification.constant';
import { NotificationWsService } from '../../services/ws.service';
import { messageCallbackType } from '@stomp/stompjs';

@Component({
  selector: 'one-portal-overall',
  templateUrl: './overall.component.html',
  styleUrls: ['./overall.component.css'],
})
export class OverallComponent implements OnInit, OnDestroy {

  serviceOrderCode: string;
  detailCluster: KubernetesCluster;

  selectedIndexTab: number = 0;

  constructor(
    private clusterService: ClusterService,
    private vlanService: VlanService,
    private notificationService: NzNotificationService,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private websocketService: NotificationWsService
  ) {}

  @HostListener('window:unload', ['$event'])
  async unloadHandler(event) {
    this.ngOnDestroy();
  }

  @HostListener('window:beforeunload', ['$event'])
  async beforeUnloadHandler(event) {
    this.ngOnDestroy();
  }

  ngOnInit(): void {
    this.selectedIndexTab = +localStorage.getItem('currentTab') || 0;

    this.activatedRoute.params.subscribe(params => {
      this.serviceOrderCode = params['id'];
      this.getDetailCluster(this.serviceOrderCode);
      this.getSSHKey(this.serviceOrderCode);
      this.getKubeConfig(this.serviceOrderCode);
    });

    // open ws
    this.openWs();
  }

  ngOnDestroy(): void {
    this.websocketService.disconnect();
  }

  regionId: number;
  projectId: number;
  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  onChangeTab(index: number) {
    this.selectedIndexTab = index;
    localStorage.setItem('currentTab', index + '');
  }

  getDetailCluster(serviceOrderCode: string) {
    this.clusterService.getDetailCluster(serviceOrderCode)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.detailCluster = new KubernetesCluster(r.data);

          this.getVlanbyId(this.detailCluster.vpcNetworkId);

          this.titleService.setTitle('Chi tiết cluster ' + this.detailCluster.clusterName);
        } else {
          this.notificationService.error(this.i18n.fanyi('app.status.fail'), r.message);
        }
      });
  }

  yamlString: string;
  getKubeConfig(serviceOrderCode: string) {
    this.clusterService.getKubeConfig(serviceOrderCode)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.yamlString = r.data;
        } else {
          this.notificationService.error(this.i18n.fanyi('app.status.fail'), r.message);
        }
      });
  }

  sshKeyString: string;
  getSSHKey(serviceOrderCode: string) {
    this.clusterService.getSSHKey(serviceOrderCode)
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.sshKeyString = r.data;
      } else {
        this.notificationService.error(this.i18n.fanyi('app.status.fail'), r.message);
      }
    });
  }

  vpcNetwork: string;
  getVlanbyId(vlanId: number) {
    this.vlanService.getVlanById(vlanId)
      .subscribe((r: any) => {
        if (r) {
          this.vpcNetwork = r.name;
        }
      });
  }

  getDefaultLanguage() {
    return this.i18n.defaultLang;
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
            const msgObj: any[] = notificationMessage.content;
            let msg = msgObj.find((noti: any) => noti.lang == this.getDefaultLanguage());
            if (notificationMessage.status == NotificationConstant.NOTI_SUCCESS) {
              this.notificationService.success(
                this.i18n.fanyi('app.status.success'),
                msg?.content);

              // refresh page
              this.getDetailCluster(this.serviceOrderCode);

            } else {
              this.notificationService.error(
                this.i18n.fanyi('app.status.fail'),
                msg?.content);
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

}
