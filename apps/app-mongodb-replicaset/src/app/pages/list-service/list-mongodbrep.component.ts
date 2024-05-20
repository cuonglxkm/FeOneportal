import { Component, OnDestroy, OnInit } from '@angular/core';
import { MongodbInfor } from '../../model/mongodb-infor.model';
import { MongoService } from '../../service/mongo.service';
import { MongodbStatus } from '../../model/status.model';
import { Subject, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { LoadingService } from '@delon/abc/loading';
// import { ServiceActiveWebsocketService } from '../../service/websocket-service.service';
// import { UtilService } from '../../service/utils.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NotificationWsService } from '../../service/notification-ws.service';
import { NotificationConstant } from '../../constant/notification-constant.contants';
import { WebsocketResponse } from '../../model/websocket/websocket-response.model';
import { WsDataServiceStatus } from '../../model/websocket/ws-service-status.model';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { UtilService } from '../../service/utils.service';
import { NotiStatusEnum } from '../../enum/noti-status.enum';

@Component({
  selector: 'one-portal-list-mongodbrep',
  templateUrl: './list-mongodbrep.component.html',
  styleUrls: ['./list-mongodbrep.component.css'],
})
export class ListMongodbrepComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject();

  services: MongodbInfor[] = [];
  listServiceStatus: MongodbStatus[] = [];
  currentMongo: MongodbInfor;
  keywordFilter: string;
  statusFilter: number;
  pageIndex: number;
  pageSize: number;
  total: number;
  isShowIntroductionPage = false;
  loading = false;

  isInitModal:boolean = false;
  isVisibleDelete:boolean = false;
  isErrorCheckDelete:boolean = false;
  serviceNameDelete:string = "";
  msgError:string = "";

  regionId: number;
  projectId: number;


  constructor(
    private mongoService : MongoService,
    private notificationWsService: NotificationWsService,
    private router : Router,
    // private utilService: UtilService,
    private loadingSrv: LoadingService,
    private utilService: UtilService) {

  }

  ngOnInit(): void {
    console.log('on init')
    this.loading = true;
    localStorage.removeItem('selectedTabIndex');
    // this.onRegionChange()
    console.log('3', this.isShowIntroductionPage)
     
    this.keywordFilter = '';
    this.statusFilter = -1;
    this.pageIndex = 1;
    this.pageSize = 10;
    this.total = 1;
    // this.firstSearchCluster();

    this.getListServiceStatus();
    this.openWS();

  }

  // firstSearchCluster() {
  //   this.loading = true

  //   const timeoutId = setTimeout(() => {
  //     this.loading = false
  //   }, 5000);

  //   if(this.regionId != null || this.projectId != null) {
  //     clearTimeout(timeoutId);
  //     this.mongoService.searchCluster(this.regionId,this.projectId,this.statusFilter, this.keywordFilter, this.pageIndex, this.pageSize)
  //     .pipe(finalize(() => this.loading = false))
  //     .subscribe(
  //       (r) => {
  //         this.services = r.data.content;
  //         this.total = r.data.total;
  //         this.isShowIntroductionPage = this.services.length == 0;
  //       }
  //     );
  //   }
  // }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
    this.notificationWsService.close();
  }


  openWS(){
    const topicServiceOrderStatus = NotificationConstant.WS_SERVICE_STATUS;
    const _this = this;
    const handleServiceStatusCallback = (message) => {
      if (message.body) {
        try {
          //
          const wsResponse: WebsocketResponse<WsDataServiceStatus> = JSON.parse(message.body);
          if (wsResponse.message) { 
            // TODO : show notification
            if(wsResponse.success)
              this.utilService.showNotification(NotiStatusEnum.SUCCESS,wsResponse.message)
            else
            this.utilService.showNotification(NotiStatusEnum.ERROR,wsResponse.message)
          }
          console.log('ws')
          _this.searchServices();
        } catch (ex) {
          console.log("[handleServiceStatusCallback] - parse message error: ", ex);
        }

      }
    }
    this.notificationWsService.openWs([{ topic: topicServiceOrderStatus, cb: handleServiceStatusCallback }])

  }

  getDetail(service_code: string) {
    this.router.navigate(['/app-mongodb-replicaset/detail/'+service_code], {state: {data: service_code}});
  }

  getListServiceStatus() {
    return this.mongoService.getListServiceStatus().subscribe(r => {
      this.listServiceStatus = r.data;
    })
  }

  searchServices() {
    // this.loading = true;
    this.mongoService.searchCluster(this.regionId,this.projectId,this.statusFilter, this.keywordFilter, this.pageIndex, this.pageSize)
    .pipe(finalize(() => this.loading = false))
    .subscribe(
      (r) => {
        this.services = r.data.content;
        this.total = r.data.total;
        console.log('1', this.isShowIntroductionPage)
        this.isShowIntroductionPage = this.services.length == 0;
        console.log('2', this.isShowIntroductionPage, this.services)

      }
    );
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
    this.searchServices();
  }

  resetPageFilter() {
    this.pageIndex = 1;
    this.pageSize = 10;
  }

  changePage(page: number) {
    console.log('change page')
    this.pageIndex = page;
    this.searchServices();
  }

  changeSize(size: number) {
    console.log('change size')
    this.pageSize = size;
    this.searchServices();
  }

  changeStatusFilter(status: number) {
    console.log('changeStatusFilter')
    this.resetPageFilter();
    this.statusFilter = status;
    this.searchServices();
  }

  changeKeywordFilter() {
    console.log('changeKeywordFilter')

    this.resetPageFilter();
    this.keywordFilter = this.keywordFilter.trim();
    this.searchServices();
  }

  deleteForm(data:MongodbInfor){
    this.isVisibleDelete = true;
    this.isErrorCheckDelete = false;
    this.isInitModal = true;
    this.msgError = '';
    this.serviceNameDelete = '';
    this.currentMongo = data;
  }

  handleCancelDelete(){
    this.isVisibleDelete=false;
    this.router.navigate(['/app-mongodb-replicaset']);

  }

  checkServiceNameDel(){
    this.isInitModal = false;
    if (this.serviceNameDelete.length == 0) {
      this.isErrorCheckDelete = true;
      this.msgError = 'Vui lòng nhập tên dịch vụ';
    } else if (this.serviceNameDelete != this.currentMongo.service_name) {
      this.isErrorCheckDelete = true;
      this.msgError = 'Tên dịch vụ nhập chưa đúng';
    } else {
      this.isErrorCheckDelete = false;
      this.msgError = '';
    }
  }

  handleOkDelete(){
    this.loadingSrv.open({ type: 'spin', text: 'Loading...' });

    this.mongoService.deleteMongodbCluster(this.currentMongo.service_code)
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.utilService.showNotification(NotiStatusEnum.SUCCESS,r.message);
      } else{
        this.utilService.showNotification(NotiStatusEnum.ERROR,r.message);
      }
      this.isVisibleDelete=false;
      this.searchServices()
      this.loadingSrv.close();
    });
  }
}
