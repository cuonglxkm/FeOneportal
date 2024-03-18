import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { camelizeKeys } from 'humps';
import { Subscription, finalize } from 'rxjs';
import { AppConstants } from 'src/app/core/constants/app-constant';
import { KafkaInfor } from 'src/app/core/models/kafka-infor.model';
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
  isShowIntroductionPage: boolean = false;


  setOfCheckedId = new Set<number>();

  // flag check view detail panel open
  viewDetail = false;

  sub: Subscription;
  eventSource: EventSource;

  // websocket service
  private websocketService: ServiceActiveWebsocketService;

  constructor(
    private kafkaService: KafkaService,
    private cdr: ChangeDetectorRef,
    // private utilService: UtilService,
    // private modalService: NzModalService
  ) {
    this.keySearch = '';
    this.serviceStatus = null;
    this.pageIndex = 1;
    this.pageSize = 10;
    this.total = 1;
  }

  // temp
  listOfStatusKafka: Array<{ label: string; value: number }> = [
    { label: "Chưa gia hạn", value: 0 },
    { label: "Đang khởi tạo", value: 1 },
    { label: "Đang hoạt động", value: 2 },
    { label: "Đang xóa", value: 7 },
  ]


  ngOnInit(): void {
    this.kafkaService.getListService(this.pageIndex, this.pageSize, this.keySearch, this.serviceStatus)
      .pipe(
        finalize(() => {
          this.isShowIntroductionPage = this.listOfKafka.length > 0 ? false : true;
        })
      )
      .subscribe((data) => {
        this.total = data?.data?.totals;
        this.pageSize = data?.data?.size;
        this.listOfKafka = camelizeKeys(data?.data?.results) as KafkaInfor[];
        this.cdr.detectChanges();
      });



    // open websocket
    // this.openWS();

    this.getFlux();
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

  ngOnDestroy() {
    console.log("");
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
    this.kafkaService.getListService(index, size, keySearch, status)
      .subscribe((data) => {
        this.total = data?.data?.totals;
        this.pageSize = data?.data?.size;
        this.listOfKafka = camelizeKeys(data?.data?.results) as KafkaInfor[];
        this.cdr.detectChanges();
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
}
