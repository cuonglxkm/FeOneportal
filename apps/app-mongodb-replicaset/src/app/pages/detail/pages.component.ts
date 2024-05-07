import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotificationWsService } from '../../service/notification-ws.service';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { NotificationConstant } from '../../constant/notification-constant.contants';
import { WebsocketResponse } from '../../model/websocket/websocket-response.model';
import { WsDetailService } from '../../model/websocket/ws-detail-service.model';
import { ShareService } from '../../service/share.service';
import { UtilService } from '../../service/utils.service';
import { NotiStatusEnum } from '../../enum/noti-status.enum';

@Component({
  selector: 'one-portal-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css'],
})
export class PagesComponent implements OnInit, OnDestroy {
  selectedIndex = 0;
  serviceCode: string;
  constructor(
    private _activatedRoute: ActivatedRoute,
    private notificationWsService: NotificationWsService,
    private shareService: ShareService,
    private utilService: UtilService
  ) { }

  regionId: number;
  projectId: number;

  setTransactionTabIndex(e: number) {
    this.selectedIndex = e;
  }

  onRegionChange(region: RegionModel) {
    console.log('onRegionChange', region);
    this.regionId = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
  }

  ngOnInit(): void {

    this._activatedRoute.params.subscribe(p => {
      this.serviceCode = p["id"];
    })

    this.selectedIndex = +localStorage.getItem('selectedTabIndex') || 0;

    this.openWS();

  }

  ngOnDestroy(): void {
    this.notificationWsService.close();
  }


  openWS(){
    const topicServiceDetail = NotificationConstant.WS_DETAIL_SERVICE;
    const _this = this;
    const handleServiceDetailCallback = (message) => {
      if (message.body) {
        try {
          //
          const wsResponse: WebsocketResponse<WsDetailService> = JSON.parse(message.body);
          if (wsResponse.message) { 
            // TODO : show notification
            if(wsResponse.success)
              this.utilService.showNotification(NotiStatusEnum.SUCCESS,wsResponse.message)
            else
            this.utilService.showNotification(NotiStatusEnum.ERROR,wsResponse.message)
          }
          switch (wsResponse.data.type) {
            case NotificationConstant.OVERVIEW_TAB: 
              this.shareService.addOverviewEvent(wsResponse.data)
              break;
            case NotificationConstant.DB_COL_TAB: 
              this.shareService.addDbColEvent(wsResponse.data)
              break;
            case NotificationConstant.USER_ROLE_TAB: 
              this.shareService.addUserRoleEvent(wsResponse.data)
              break;
            default: 
              break;
          }
        } catch (ex) {
          console.log("[handleServiceStatusCallback] - parse message error: ", ex);
        }

      }
    }
    this.notificationWsService.openWs([{ topic: topicServiceDetail, cb: handleServiceDetailCallback }])
    
  }

}
