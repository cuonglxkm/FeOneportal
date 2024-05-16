import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { LoadingService } from '@delon/abc/loading';
import { camelizeKeys } from 'humps';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription, finalize } from 'rxjs';
import { I18NService } from 'src/app/core/i18n/i18n.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { KafkaInfor } from 'src/app/core/models/kafka-infor.model';
import { ProjectModel } from 'src/app/core/models/project.model';
import { RegionModel } from 'src/app/core/models/region.model';
import { KafkaStatus } from 'src/app/core/models/status.model';
import { KafkaService } from 'src/app/services/kafka.service';
import { UtilService } from 'src/app/services/utils.service';
import { ServiceActiveWebsocketService } from 'src/app/services/websocket-service.service';

@Component({
  selector: 'one-portal-list-kafka',
  templateUrl: './list-kafka.component.html',
  styleUrls: ['./list-kafka.component.css'],
})
export class ListKafkaComponent implements OnInit, OnDestroy {
  listOfKafka: KafkaInfor[] = [];
  keySearch: string;
  serviceStatus: number;
  pageIndex: number;
  pageSize: number;
  total: number;
  isShowIntroductionPage = false;
  loading = true;

  sub: Subscription;
  eventSource: EventSource;

  // infrastructure info
  regionId: number;
  projectId: number;
  
  isVisibleDelete = false;
  isErrorCheckDelete = false;
  isInitModal = true;
  msgError = '';
  serviceNameDelete: string;
  currentKafka: KafkaInfor;

  // websocket service
  private websocketService: ServiceActiveWebsocketService;

  constructor(
    private kafkaService: KafkaService,
    private cdr: ChangeDetectorRef,
    private loadingSrv: LoadingService,
    private notification: NzNotificationService,
    private utilService: UtilService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
    this.keySearch = '';
    this.serviceStatus = -1;
    this.pageIndex = 1;
    this.pageSize = 10;
    this.total = 1;
  }

  listOfStatusKafka: KafkaStatus[] = [];


  ngOnInit(): void {
    localStorage.removeItem('selectedTabIndex');
    // Ẩn đi vì khi khởi tạo component, thay đổi cbx project sẽ gọi đến hàm getList. 
    // this.getListService(this.pageIndex, this.pageSize, this.keySearch, this.serviceStatus);
    this.getListStatus();
    // open websocket
    this.openWS();

  }

  getListStatus() {
    this.kafkaService.getListStatus()
      .subscribe(
        res => {
          if (res && res.code == 200) {
            this.listOfStatusKafka = camelizeKeys(res.data) as KafkaStatus[];
          }
        }
      )
  }

  // catch event region change and reload data
  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project?.id;
    this.getListService(this.pageIndex, this.pageSize, this.keySearch, this.serviceStatus);
  }

  ngOnDestroy() {
    // close websocket
    this.websocketService.disconnect();
  }

  /**
   * Notification task
   */
  openWS() {
  const ws_endpoint = this.utilService.parseWsEndpoint();
  this.websocketService = new ServiceActiveWebsocketService(
    this,
    ws_endpoint
  );
    this.websocketService.connect();
  }

  

  getListService(index: number, size: number, keySearch: string, status: number) {
    this.loading = true;
    this.kafkaService.getListService(index, size, keySearch, status, this.regionId.toString(), this.projectId.toString())
    .pipe(
      finalize(() => {
        this.loading = false;
        this.isShowIntroductionPage = (this.listOfKafka.length == 0 && (keySearch == '' || keySearch == null) && (status == -1 || status == null)) ? true : false;
        this.cdr.detectChanges();
      })
    )
    .subscribe((data) => {
      this.total = data.data.totals;
      this.pageSize = data.data.size;
      this.listOfKafka = camelizeKeys(data.data.results) as KafkaInfor[];
    });

  }

  changePage(event: number) {
    this.pageIndex = event;
    this.getListService(this.pageIndex, this.pageSize, this.keySearch, this.serviceStatus);
  }

  changeSize(event: number) {
    this.pageSize = event;
    this.getListService(this.pageIndex, this.pageSize, this.keySearch, this.serviceStatus);
  }

  handleChange() {
    this.pageIndex = 1;
    this.getListService(this.pageIndex, this.pageSize, this.keySearch, this.serviceStatus)
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  showDeleteConfirm(data: KafkaInfor) {
    this.isVisibleDelete = true;
    this.isErrorCheckDelete = false;
    this.isInitModal = true;
    this.msgError = '';
    this.currentKafka = data;
    this.serviceNameDelete = '';
  }

  handleOkDelete() {
    this.isVisibleDelete = false;
    this.loadingSrv.open({ type: "spin", text: "Loading..." });
    this.kafkaService.delete(this.currentKafka.serviceOrderCode)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe(
        (data) => {
          if (data && data.code == 200) {
            this.notification.success(this.i18n.fanyi('app.status.success'), data.msg);
            this.getListService(this.pageIndex, this.pageSize, this.keySearch, this.serviceStatus)
          }
          else {
            this.notification.error(this.i18n.fanyi('app.status.fail'), data.msg);
          }
        }
      );
  }

  checkServiceNameDel() {
    this.isInitModal = false;
    if (this.serviceNameDelete.length == 0) {
      this.isErrorCheckDelete = true;
      this.msgError = 'Vui lòng nhập tên dịch vụ';
    } else if (this.serviceNameDelete != this.currentKafka.serviceName) {
      this.isErrorCheckDelete = true;
      this.msgError = 'Tên dịch vụ nhập chưa đúng';
    } else {
      this.isErrorCheckDelete = false;
      this.msgError = '';
    }
  }
}
