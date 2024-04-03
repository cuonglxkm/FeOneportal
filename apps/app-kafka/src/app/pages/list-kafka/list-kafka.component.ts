import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { LoadingService } from '@delon/abc/loading';
import { camelizeKeys } from 'humps';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription, finalize } from 'rxjs';
import { AppConstants } from 'src/app/core/constants/app-constant';
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
  projectInfraId: number;
  cloudProfileId: string;
  vlanId: number;
  
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
    // private utilService: UtilService,
  ) {
    this.keySearch = '';
    this.serviceStatus = null;
    this.pageIndex = 1;
    this.pageSize = 10;
    this.total = 1;
  }

  listOfStatusKafka: KafkaStatus[] = [];


  ngOnInit(): void {
    localStorage.removeItem('selectedTabIndex');

    this.kafkaService.getListService(this.pageIndex, this.pageSize, this.keySearch, this.serviceStatus)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.isShowIntroductionPage = this.listOfKafka.length > 0 ? false : true;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.total = data?.data?.totals;
        this.pageSize = data?.data?.size;
        this.listOfKafka = camelizeKeys(data?.data?.results) as KafkaInfor[];
      });
    
    this.getListStatus();
    // open websocket
    // this.openWS();

    this.getFlux();
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

  getFlux(): void {

    this.eventSource = this.kafkaService.getFlux() // khởi tạo kết nối flux
    this.eventSource.onopen = (event) => {
      console.log('open flux');
    }

    this.eventSource.onerror = err => {
      console.error('error', err);
      this.eventSource.close();
    }

    this.eventSource.onmessage = (event) => {
      console.log('connected');
      const res = JSON.parse(event.data);
      if (res.status == AppConstants.NOTI_SUCCESS) {
        this.getListService(1000, 1, '', -1);
      }
    };
  }

  // catch event region change and reload data
  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.cloudProfileId = region.cloudId;

    // this.getListService(this.regionId, this.cloudProfileId);

    // this.myform.get('regionId').setValue(this.regionId);
    // this.myform.get('cloudProfileId').setValue(this.cloudProfileId);
  }

  onProjectChange(project: ProjectModel) {
    this.projectInfraId = project.id;

    // this.getVlanNetwork(this.projectInfraId);
    // this.myform.get('projectInfraId').setValue(this.projectInfraId);

    // handle reset select box of previous project
    // this.myform.get('vpcNetwork').setValue(null);
    // this.myform.get('subnet').setValue(null);
  }

  ngOnDestroy() {
    this.eventSource.close();
    // close websocket
    // this.websocketService.disconnect();
  }

  /**
   * Notification task
   */
  // openWS() {
  // // const ws_endpoint = this.utilService.parseWsEndpoint();
  // console.log('ws_endpoint: ', ws_endpoint);
  // this.websocketService = new ServiceActiveWebsocketService(
  //   this,
  //   ws_endpoint
  // );
  //   this.websocketService.connect();
  // }

  

  getListService(size: number, index: number, keySearch: string, status: number) {
    this.loading = true;
    this.kafkaService.getListService(index, size, keySearch, status)
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe((data) => {
      this.total = data.data.totals;
      this.pageSize = data.data.size;
      this.listOfKafka = camelizeKeys(data.data.results) as KafkaInfor[];
    });

  }

  handleChange() {
    this.getListService(this.pageSize, this.pageIndex, this.keySearch, this.serviceStatus)
  }

  onQueryParamsChange(event) {
    console.log();
  }
  onAllClusterChecked(event) {
    console.log();
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
            this.notification.success('Thành công', data.msg);
            this.getListService(this.pageSize, this.pageIndex, this.keySearch, this.serviceStatus)
          }
          else {
            this.notification.error('Thất bại', data.msg);
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
