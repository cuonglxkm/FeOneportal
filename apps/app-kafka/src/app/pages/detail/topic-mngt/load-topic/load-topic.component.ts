import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KafkaTopic } from 'apps/app-kafka/src/app/core/models/kafka-topic.model';
import { topicService } from 'apps/app-kafka/src/app/services/kafka-topic.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from "ng-zorro-antd/notification";
import { Subject } from 'rxjs';
import { filter, finalize, map } from 'rxjs/operators';
import { JsonEditorOptions } from 'ang-jsoneditor';
import { LoadingService } from '@delon/abc/loading';
@Component({
  selector: 'one-portal-load-topic',
  templateUrl: './load-topic.component.html',
  styleUrls: ['./load-topic.component.css'],
})

export class LoadTopicComponent implements OnInit {

  serviceOrderCode: string = 'kafka-s1hnuicj7u7g';
  listTopic: KafkaTopic[] = [];
  index: number = 1;
  size: number = 50;
  total: number;
  search: string = '';
  control: number;
  selectedTopic: KafkaTopic;
  topicDetail: string;

  visibleConfigInfo: boolean;
  isSubmitProduce: boolean = false;
  isVisible: boolean = false;
  loading = false;

  configInfo: object = new Object();
  config: any[];

  singleValue = null;
  listNum = 0;
  createNum = 1;
  editNum = 2;
  detailNum = 3;

  isLoadingTopic: boolean = false;
  isSubmitBasicTopic: boolean = false;
  isSubmitAdvancedTopic: boolean = false;

  changeKeySearch = new Subject<string>();

  myform: FormGroup;

  keySearch: string;
  isAdvanced: number;
  kafkaSystem: string;

  listOfTopics: any[];
  listOfKafkaSys: any[];

  jsonOption: JsonEditorOptions;

  description1 = 'Là chuỗi JSON chứa thông tin cấu hình khởi tạo customize cho topic. Các giá trị number cũng truyền vào dưới dạng string. Ví dụ \n';
  description2 = { "compression.type": "producer", "retention.ms": "7200000", "flush.messages": "9223372036854775807", "max.message.bytes": "1048588" };
  description3 = 'Danh sách topic cần tạo mới và được nhập cách nhau bởi <b>dấu phẩy \',\'</b>';

  constructor(
    private fb: FormBuilder,
    private kafkaService: topicService,
    private modal: NzModalService,
    private loadingSrv: LoadingService,
  ) {
    this.jsonOption = new JsonEditorOptions();
    this.jsonOption.search = false;
    this.jsonOption.mode = 'code'; // set all allowed modes
    this.jsonOption.history = false;
    this.jsonOption.mainMenuBar = false;
  }


  ngOnInit(): void {
    this.listOfKafkaSys = [];
    this.listOfTopics = [];
    this.control = this.listNum;

    this.getListKafkaSystem();
    this.getList();
    this.setDefaultForm();
  }

  setDefaultForm() {
    this.myform = this.fb.group({
      topicList: [null, Validators.required],
      configMap: [null],
      partitionNum: [3, [Validators.required, Validators.min(1)]],
      replicaNum: [2, [Validators.required, Validators.min(1)]],
      isAdvanced: [1, Validators.required],   // fix
      serviceOrderCode: ['kafka-dev', [Validators.required]]
    });
  }

  getListKafkaSystem() {
    this.kafkaService.getListKafkaSystem()
      .subscribe(r => {
        this.listOfKafkaSys = r;
      });
  }

  getList() {
    if (!this.kafkaSystem)
      return
    this.loadingSrv.open({ type: "spin", text: "Loading..." });
    this.kafkaService.getListTopic(this.index, this.size, this.search, this.kafkaSystem)
      .pipe(
        filter((r) => r && r.code == 200),
        map((r) => r.data)
      )
      .subscribe((data) => {
        this.total = data?.totals;
        this.size = data?.size;
        let temp: KafkaTopic[] = [];
        data.results.forEach(element => {
          temp.push(new KafkaTopic(element));
        });
        this.listTopic = temp;
        this.loadingSrv.close();
      });
  }

  handleSearch() {
    this.index = 1;
    this.search = this.search.trim()
    this.getList();
  }

  changePageSize($event: any) {
    this.size = $event;
    this.index = 1;
    this.getList();
  }

  changePage($event: any) {
    this.index = $event;
    this.getList();
  }

  isNumber(event: any) {
    let reg = new RegExp('^[0-9]+$');
    let input = event.key;
    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  onChangeKafkaSystem(event: string) {
    this.kafkaSystem = event;
    this.getList();
  }

  showConfirmLoadTopic(): void {
    this.modal.confirm({
      nzTitle: '<b>Xác nhận</b>',
      nzContent: 'Bạn có muốn thêm mới topic không?',
      nzOnOk: () => this.onLoadTopic()
    });
  }

  onLoadTopic() {
    this.isAdvanced = 1;
    this.isSubmitAdvancedTopic = true;
    this.submitData();
  }

  submitData() {
    this.loadingSrv.open({ type: "spin", text: "Loading..." });
    let obj: any = this.myform.value;

    let configMap = this.myform.get('configMap').value;
    let partition = this.myform.get('partitionNum').value;
    let replica = this.myform.get('replicaNum').value;

    if (configMap) {
      obj.configMap = JSON.stringify(configMap);
    } else {
      obj.configMap = '{}';
    }
    obj.isAdvanced = this.isAdvanced;
    obj.partitionNum = +partition;
    obj.replicaNum = +replica;

    let data = {
      topic_list: obj.topicList,
      config_map: obj.configMap,
      replica_num: obj.replicaNum,
      partition_num: obj.partitionNum,
      is_advanced: obj.isAdvanced,
      service_order_code: obj.serviceOrderCode
    };
    console.log({ datasend: data });
    this.kafkaService.createTopicInitual(data).pipe(
      finalize(() => {
        this.isSubmitAdvancedTopic = false;
        this.isSubmitBasicTopic = false;
      })
    ).subscribe((r: any) => {
      if (r && r.code == 200) {
        console.log(this.kafkaSystem);
        let kafkaSys = this.kafkaSystem;
        this.setDefaultForm();
        this.myform.get('serviceOrderCode').setValue(kafkaSys);
        this.keySearch = '';
        this.getList();
      }
      this.loadingSrv.close();
    });
  }
}