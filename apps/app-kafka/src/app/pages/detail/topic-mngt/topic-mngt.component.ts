import { Component, Input, OnInit } from '@angular/core';
import { KafkaService } from '../../../services/kafka.service';
import { filter, map } from 'rxjs/operators';
import { ClipboardService } from 'ngx-clipboard';
import { InfoConnection } from '../../../core/models/info-connection.model';
import { BrokerConfig } from '../../../core/models/broker-config.model';
import { AppConstants } from '../../../core/constants/app-constant';
import { NzNotificationService } from "ng-zorro-antd/notification";
import { STColumn } from '@delon/abc/st';
import { KafkaTopic } from '../../../core/models/kafka-topic.model';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDescriptionsSize } from 'ng-zorro-antd/descriptions';
@Component({
  selector: 'one-portal-topic-mngt',
  templateUrl: './topic-mngt.component.html',
  styleUrls: ['./topic-mngt.component.css'],
})
export class TopicMngtComponent implements OnInit {
  @Input() serviceOrderCode: string;

  listTopic: KafkaTopic[] = [];
  total: number;
  pageSize: number;
  control: number;
  selectedTopic: KafkaTopic;
  visibleConfigInfo: boolean;
  topicDetail: string;

  configInfo: object = new Object();
  config: any[];

  listNum = 0;
  createNum = 1;
  editNum = 2;
  detailNum = 3;

  constructor(
    private kafkaService: KafkaService,
  ) { }

  ngOnInit(): void {
    this.getList();
    this.control = this.listNum;
  }

  handleCancel() {
    this.control = this.listNum;
  }

  getList() {
    this.kafkaService.getListTopic(this.serviceOrderCode)
      .pipe(
        filter((r) => r && r.code == 200),
        map((r) => r.data)
      )
      .subscribe((data) => {
        let temp: KafkaTopic[] = [];
        data.data.forEach(element => {
          temp.push(new KafkaTopic(element));
        });
        this.listTopic = temp;
        console.log(this.listTopic);
      });
  }

  openCreateForm() {
    this.control = this.createNum;
  }

  detailTopic(topicName) {
    this.control = this.detailNum;
    this.topicDetail = topicName;
  }

  updateTopicForm(data: KafkaTopic) {
    this.control = this.editNum;
    this.selectedTopic = data;
  }

  showTopicInfo(data: KafkaTopic) {
    this.configInfo = JSON.parse(data.configs);
    this.visibleConfigInfo = true;
  }

  closeTopicInfo() {
    this.visibleConfigInfo = false;
  }


}
